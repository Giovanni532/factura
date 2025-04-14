"use server"

import { useMutation } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import {
    getQuoteByIdSchema,
    duplicateQuoteSchema,
    deleteQuoteSchema,
    downloadQuotePdfSchema,
    convertQuoteToInvoiceSchema,
    updateQuoteSchema,
    createQuoteSchema
} from "@/validations/quotes-schema";


// Server action to get a specific quote by ID
export const getQuoteById = useMutation(
    getQuoteByIdSchema,
    async (input, { userId }) => {
        try {
            // Fetch the quote by ID, ensuring it belongs to the current user
            const quote = await prisma.quote.findUnique({
                where: {
                    id: input.id,
                    userId: userId
                },
                include: {
                    client: true,
                    quoteItems: {
                        include: {
                            item: true
                        }
                    },
                    user: {
                        include: {
                            businesses: true
                        }
                    }
                }
            });

            // If quote doesn't exist or doesn't belong to the user
            if (!quote) {
                return { quote: null };
            }

            // Get the user's business info
            const business = quote.user.businesses[0]; // Assuming the user has at least one business

            // Format quote items
            const items = quote.quoteItems.map(qItem => ({
                id: qItem.id,
                name: qItem.item.name,
                description: qItem.item.description || "",
                quantity: qItem.quantity,
                unitPrice: qItem.unitPrice,
                taxRate: 20 // Default tax rate, could be stored in the DB in a real implementation
            }));

            // Calculate subtotal and taxes
            const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
            const taxes = items.reduce((total, item) => total + (item.quantity * item.unitPrice * item.taxRate) / 100, 0);
            const expectedTotal = subtotal + taxes;

            // If the stored total is less than expected total, there's a discount
            let discount = undefined;
            if (quote.total < expectedTotal) {
                const discountValue = expectedTotal - quote.total;
                const discountPercentage = (discountValue / subtotal) * 100;

                // If the discount seems close to a round percentage, use percentage type
                if (Math.abs(Math.round(discountPercentage) - discountPercentage) < 0.1) {
                    discount = {
                        type: "percentage" as const,
                        value: Math.round(discountPercentage)
                    };
                } else {
                    discount = {
                        type: "fixed" as const,
                        value: discountValue
                    };
                }
            }

            // Transform the database quote to the format expected by the frontend
            const formattedQuote: QuoteDetail = {
                id: quote.id,
                number: `DEV-${quote.id.slice(0, 8)}`,
                client: {
                    name: quote.client.name,
                    email: quote.client.email,
                    address: {
                        street: quote.client.address || "",
                        city: quote.client.city || "",
                        postalCode: quote.client.postalCode || "",
                        country: quote.client.country || ""
                    }
                },
                company: {
                    name: business?.name || "Your Company",
                    email: quote.user.email || "contact@company.com",
                    address: {
                        street: business?.address || "",
                        city: business?.city || "",
                        postalCode: business?.postalCode || "",
                        country: business?.country || ""
                    },
                    logo: business?.logoUrl || undefined,
                    taxId: business?.taxId || ""
                },
                items: items,
                createdAt: quote.createdAt,
                dueDate: quote.validUntil || new Date(),
                status: mapStatus(quote.status),
                discount: discount,
                notes: quote.note || undefined,
                total: quote.total
            };

            return { quote: formattedQuote };
        } catch (error) {
            console.error("Error fetching quote:", error);
            return { quote: null };
        }
    }
);

// Server action to update a quote
export const updateQuote = useMutation(
    updateQuoteSchema,
    async (input, { userId }) => {
        try {
            // First check if the quote exists and belongs to the user
            const existingQuote = await prisma.quote.findUnique({
                where: {
                    id: input.id,
                    userId: userId
                },
                include: {
                    quoteItems: true // Include existing quote items
                }
            });

            if (!existingQuote) {
                return {
                    success: false,
                    data: {
                        message: "Devis introuvable ou vous n'avez pas les droits pour le modifier"
                    }
                };
            }

            // Check if quote has been converted to invoice (can't edit if converted)
            if (existingQuote.status === "CONVERTED") {
                return {
                    success: false,
                    data: {
                        message: "Ce devis a été converti en facture et ne peut plus être modifié"
                    }
                };
            }

            // Calculate exactly as in the client
            // 1. Calculate subtotal (HT)
            const subtotal = input.items.reduce((sum, item) => {
                return sum + (item.quantity * item.unitPrice);
            }, 0);

            // 2. Calculate taxes
            const taxes = input.items.reduce((sum, item) => {
                const itemSubtotal = item.quantity * item.unitPrice;
                const tax = (itemSubtotal * item.taxRate) / 100;
                return sum + tax;
            }, 0);

            // 3. Calculate discount
            let discount = 0;
            if (input.discount) {
                if (input.discount.type === "percentage") {
                    discount = (subtotal * input.discount.value) / 100;
                } else {
                    discount = input.discount.value;
                }
            }

            // 4. Calculate final total: subtotal + taxes - discount
            const finalTotal = subtotal + taxes - discount;

            // Start transaction to update quote and items
            return await prisma.$transaction(async (tx) => {
                // Update the quote record
                const updatedQuote = await tx.quote.update({
                    where: { id: input.id },
                    data: {
                        clientId: input.clientId,
                        status: input.status.toUpperCase() as any, // Convert to database enum format
                        validUntil: input.dueDate,
                        total: finalTotal,
                        note: input.notes || "",
                    }
                });

                // Get the map of existing quote items by ID for reference
                const existingItemsMap = existingQuote.quoteItems.reduce((map, item) => {
                    map[item.id] = item;
                    return map;
                }, {} as Record<string, any>);

                // 1. Identify items to delete (items in DB but not in the input)
                const inputItemIds = new Set(input.items.map(item => item.id));
                const itemIdsToDelete = existingQuote.quoteItems
                    .filter(item => !inputItemIds.has(item.id))
                    .map(item => item.id);

                // Delete items that are no longer in the input
                if (itemIdsToDelete.length > 0) {
                    await tx.quoteItem.deleteMany({
                        where: {
                            id: { in: itemIdsToDelete }
                        }
                    });
                }

                // 2. Process each item from the input
                for (const item of input.items) {
                    // Check if this is an existing item that we need to update
                    if (existingItemsMap[item.id]) {
                        // This is an existing item
                        const existingItem = existingItemsMap[item.id];

                        // Vérifier si le produit associé à cet item a changé
                        const productHasChanged = existingItem.itemId !== item.productId;

                        if (productHasChanged) {
                            // Si le produit a changé, vérifier d'abord que le nouveau produit existe
                            const newProduct = await tx.item.findUnique({
                                where: {
                                    id: item.productId,
                                    userId
                                }
                            });

                            if (!newProduct) {
                                // Si le produit n'existe pas, continuer sans changer l'item
                                await tx.quoteItem.update({
                                    where: { id: item.id },
                                    data: {
                                        quantity: item.quantity,
                                        unitPrice: item.unitPrice,
                                    }
                                });
                            } else {
                                // Si le produit existe, mettre à jour l'item avec le nouveau produit
                                await tx.quoteItem.update({
                                    where: { id: item.id },
                                    data: {
                                        itemId: item.productId, // Mettre à jour l'ID du produit
                                        quantity: item.quantity,
                                        unitPrice: item.unitPrice,
                                    }
                                });
                            }
                        } else {
                            // Si le produit n'a pas changé, mettre à jour seulement les quantités et prix
                            await tx.quoteItem.update({
                                where: { id: item.id },
                                data: {
                                    quantity: item.quantity,
                                    unitPrice: item.unitPrice,
                                }
                            });
                        }
                    } else {
                        // This is a new item, verify the product exists first
                        const product = await tx.item.findUnique({
                            where: {
                                id: item.productId,
                                userId // Ensure the product belongs to the user
                            }
                        });

                        if (!product) {
                            continue; // Skip this item if product doesn't exist
                        }

                        // Create the new quote item
                        await tx.quoteItem.create({
                            data: {
                                quoteId: input.id,
                                itemId: item.productId,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice
                            }
                        });
                    }
                }

                return {
                    success: true,
                    data: {
                        message: "Devis mis à jour avec succès",
                        quoteId: updatedQuote.id
                    }
                };
            });
        } catch (error) {
            console.error("Error updating quote:", error);
            return {
                success: false,
                data: {
                    message: "Erreur lors de la mise à jour du devis"
                }
            };
        }
    }
);

// Server action to duplicate a quote
export const duplicateQuote = useMutation(
    duplicateQuoteSchema,
    async (input, { userId }) => {
        try {
            // Fetch the original quote with all related data
            const originalQuote = await prisma.quote.findUnique({
                where: {
                    id: input.id,
                    userId: userId
                },
                include: {
                    quoteItems: true
                }
            });

            if (!originalQuote) {
                return { success: false, message: "Devis introuvable" };
            }

            // Create a new quote as a duplicate (without the items initially)
            const newQuote = await prisma.quote.create({
                data: {
                    userId: userId,
                    clientId: originalQuote.clientId,
                    status: "DRAFT", // Always start as draft
                    total: originalQuote.total,
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                }
            });

            // Create duplicate quote items
            const quoteItemsData = originalQuote.quoteItems.map(item => ({
                quoteId: newQuote.id,
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }));

            // Insert all quote items in a single transaction
            await prisma.quoteItem.createMany({
                data: quoteItemsData
            });

            return {
                success: true,
                message: "Devis dupliqué avec succès",
                quoteId: newQuote.id
            };
        } catch (error) {
            console.error("Error duplicating quote:", error);
            return { success: false, message: "Erreur lors de la duplication du devis" };
        }
    }
);

// Server action to delete a quote
export const deleteQuote = useMutation(
    deleteQuoteSchema,
    async (input, { userId }) => {
        try {
            // First check if quote exists and belongs to user
            const quote = await prisma.quote.findUnique({
                where: {
                    id: input.id,
                    userId: userId
                }
            });

            if (!quote) {
                return { success: false, message: "Devis introuvable" };
            }

            // Delete all quote items first (handle foreign key constraints)
            await prisma.quoteItem.deleteMany({
                where: {
                    quoteId: input.id
                }
            });

            // Delete the quote
            await prisma.quote.delete({
                where: {
                    id: input.id
                }
            });

            return { success: true, message: "Devis supprimé avec succès" };
        } catch (error) {
            console.error("Error deleting quote:", error);
            return { success: false, message: "Erreur lors de la suppression du devis" };
        }
    }
);

// Server action to create a quote
export const createQuote = useMutation(
    createQuoteSchema,
    async (input, { userId }) => {
        try {
            // 1. Verify that the client exists and belongs to the user
            const client = await prisma.client.findUnique({
                where: {
                    id: input.clientId,
                    userId: userId
                }
            });

            if (!client) {
                return {
                    success: false,
                    message: "Client introuvable ou vous n'avez pas les droits pour créer un devis pour ce client"
                };
            }

            // Calcul du total si des items sont fournis
            let total = 0;
            if (input.quoteItems && input.quoteItems.length > 0) {
                total = input.quoteItems.reduce((sum, item) => {
                    return sum + (item.quantity * item.unitPrice);
                }, 0);
            }

            // 2. Create the quote
            const quote = await prisma.quote.create({
                data: {
                    userId: userId,
                    clientId: input.clientId,
                    status: (input.status || "DRAFT") as QuoteStatus,
                    total: total,
                    validUntil: input.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days by default
                }
            });

            // 3. Create quote items if provided
            if (input.quoteItems && input.quoteItems.length > 0) {
                // Préparer les données pour createMany
                const quoteItemsData = input.quoteItems.map(item => ({
                    quoteId: quote.id,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    // Nous pourrions stocker la description temporaire ici si nécessaire
                    // description: item.description,
                }));

                // Insérer tous les items en une seule opération
                await prisma.quoteItem.createMany({
                    data: quoteItemsData
                });
            }

            return {
                success: true,
                message: "Devis créé avec succès",
                quoteId: quote.id
            };
        } catch (error) {
            console.error("Error creating quote:", error);
            return {
                success: false,
                message: "Erreur lors de la création du devis: " + (error instanceof Error ? error.message : String(error))
            };
        }
    }
);

// Server action to generate and download a quote PDF
export const downloadQuotePdf = useMutation(
    downloadQuotePdfSchema,
    async (input, { userId }) => {
        try {
            // Get the quote details using a separate call
            const quoteData = await prisma.quote.findUnique({
                where: {
                    id: input.id,
                    userId: userId
                },
                include: {
                    client: true,
                    quoteItems: {
                        include: {
                            item: true
                        }
                    }
                }
            });

            if (!quoteData) {
                return { success: false, message: "Devis introuvable" };
            }

            // In a real implementation, we would generate a PDF here
            // For this example, we're just returning a success message

            return {
                success: true,
                message: "PDF généré avec succès",
                pdfUrl: `/api/quotes/${input.id}/pdf` // Mock URL
            };
        } catch (error) {
            console.error("Error generating PDF:", error);
            return { success: false, message: "Erreur lors de la génération du PDF" };
        }
    }
);

// Server action to convert a quote to an invoice
export const convertQuoteToInvoice = useMutation(
    convertQuoteToInvoiceSchema,
    async (input, { userId }) => {
        try {
            // Start a transaction to ensure both operations succeed or fail together
            return await prisma.$transaction(async (tx) => {
                // Get the quote with its items
                const quote = await tx.quote.findUnique({
                    where: {
                        id: input.id,
                        userId: userId
                    },
                    include: {
                        quoteItems: {
                            include: {
                                item: true
                            }
                        },
                        client: true
                    }
                });

                if (!quote) {
                    return { success: false, message: "Devis introuvable" };
                }

                // Check if quote has already been converted to an invoice
                // Using string comparison with toString() to avoid TypeScript enum issues
                if (quote.status.toString() === "CONVERTED") {
                    return { success: false, message: "Ce devis a déjà été converti en facture" };
                }

                // Set due date for the invoice (30 days from now if not provided)
                const dueDate = input.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                // Create the invoice record in the database
                const invoice = await tx.invoice.create({
                    data: {
                        // Link to the client
                        clientId: quote.clientId,
                        // Link to the user
                        userId: userId,
                        // Set status to PENDING initially
                        status: "PENDING",
                        // Set due date
                        dueDate: dueDate,
                        // Copy the total amount from the quote
                        total: quote.total,
                        // Link back to the source quote
                        createdFromId: quote.id
                    }
                });

                // Create invoice items for each quote item
                for (const item of quote.quoteItems) {
                    await tx.invoiceItem.create({
                        data: {
                            invoiceId: invoice.id,
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }
                    });
                }

                // Update quote status to CONVERTED
                // Using the enum value directly from QuoteStatus
                await tx.quote.update({
                    where: { id: quote.id },
                    data: {
                        status: "CONVERTED"
                    }
                });

                return {
                    success: true,
                    message: "Devis converti en facture avec succès",
                    invoiceId: invoice.id
                };
            });
        } catch (error) {
            console.error("Error converting quote to invoice:", error);
            return { success: false, message: "Erreur lors de la conversion du devis en facture" };
        }
    }
);

// Helper function to map database status to frontend status
function mapStatus(status: any): QuoteStatus {
    // Map from database enum values to frontend expected values
    const statusMap: Record<string, QuoteStatus> = {
        'DRAFT': 'DRAFT',
        'SENT': 'SENT',
        'ACCEPTED': 'ACCEPTED',
        'REJECTED': 'REJECTED',
        'CONVERTED': 'CONVERTED' // Add CONVERTED status
    };

    return statusMap[status] || 'DRAFT';
}
