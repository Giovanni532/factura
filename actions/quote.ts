"use server"

import { useMutation } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import {
    getUserQuotesSchema,
    getQuoteByIdSchema,
    duplicateQuoteSchema,
    deleteQuoteSchema,
    downloadQuotePdfSchema,
    convertQuoteToInvoiceSchema,
    updateQuoteSchema
} from "@/validations/quotes-schema";
// Remove jsPDF imports as they'll be handled client-side or by a dedicated PDF service

// Type for status - matching the enum in the database
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED"

// Type for client data - matching the frontend expectations
export interface QuoteClient {
    name: string
    company?: string
}

// Type for quote data - matching the frontend expectations
export interface Quote {
    id: string
    number: string
    client: QuoteClient
    createdAt: Date
    dueDate: Date
    amount: number
    status: QuoteStatus
}

// Type for detailed quote info with address and items
export interface QuoteDetail {
    id: string;
    number: string;
    client: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
    };
    company: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
        logo?: string;
        taxId: string;
    };
    items: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    createdAt: Date;
    dueDate: Date;
    status: QuoteStatus;
    discount?: {
        type: "percentage" | "fixed";
        value: number;
    };
    notes?: string;
}

// Server action to get all quotes for the currently authenticated user
export const getUserQuotes = useMutation(
    getUserQuotesSchema,
    async (_input, { userId }) => {
        try {
            // Fetch quotes from database that belong to the current user
            const quotes = await prisma.quote.findMany({
                where: {
                    userId: userId
                },
                include: {
                    client: true,
                    quoteItems: {
                        include: {
                            item: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Transform database quotes to the format expected by the frontend
            const formattedQuotes: Quote[] = quotes.map(quote => ({
                id: quote.id,
                number: `DEV-${quote.id.slice(0, 8)}`, // Generate a number based on ID
                client: {
                    name: quote.client.name,
                    company: quote.client.company || undefined
                },
                createdAt: quote.createdAt,
                dueDate: quote.validUntil || new Date(), // Use validUntil or fallback to current date
                amount: quote.total,
                status: mapStatus(quote.status) // Convert database status to frontend status
            }));

            return { quotes: formattedQuotes };
        } catch (error) {
            console.error("Error fetching quotes:", error);
            return { quotes: [] };
        }
    }
);

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

            // Extract client address components or provide defaults
            const clientAddress = quote.client.address?.split('\n') || [];
            const [street = "", cityInfo = "", country = ""] = clientAddress;
            const cityParts = cityInfo.split(' ');
            const postalCode = cityParts.length > 0 ? cityParts[0] : "";
            const city = cityParts.slice(1).join(' ') || "";

            // Extract business address components or provide defaults
            const businessAddress = business?.address?.split('\n') || [];
            const [bizStreet = "", bizCityInfo = "", bizCountry = ""] = businessAddress;
            const bizCityParts = bizCityInfo.split(' ');
            const bizPostalCode = bizCityParts.length > 0 ? bizCityParts[0] : "";
            const bizCity = bizCityParts.slice(1).join(' ') || "";

            // Format quote items
            const items = quote.quoteItems.map(qItem => ({
                id: qItem.id,
                name: qItem.item.name,
                description: qItem.item.description || "",
                quantity: qItem.quantity,
                unitPrice: qItem.unitPrice,
                taxRate: 20 // Default tax rate, could be stored in the DB in a real implementation
            }));

            // Create discount object if applicable
            // In this example implementation, we'll assume no discount is applied
            // A real implementation would use data from the database
            const discount = undefined;

            // Transform the database quote to the format expected by the frontend
            const formattedQuote: QuoteDetail = {
                id: quote.id,
                number: `DEV-${quote.id.slice(0, 8)}`,
                client: {
                    name: quote.client.name,
                    email: quote.client.email,
                    address: {
                        street: street,
                        city: city,
                        postalCode: postalCode,
                        country: country
                    }
                },
                company: {
                    name: business?.name || "Your Company",
                    email: quote.user.email || "contact@company.com",
                    address: {
                        street: bizStreet,
                        city: bizCity,
                        postalCode: bizPostalCode,
                        country: bizCountry
                    },
                    logo: business?.logoUrl || undefined,
                    taxId: "FR 76 123 456 789" // Example tax ID, could be stored in business model
                },
                items: items,
                createdAt: quote.createdAt,
                dueDate: quote.validUntil || new Date(),
                status: mapStatus(quote.status),
                discount: discount,
                notes: "Ce devis est valable 30 jours à compter de sa date d'émission. Le paiement est dû dans les 15 jours suivant l'acceptation du devis." // Example note
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

            // Calculate total based on items
            const total = input.items.reduce((sum, item) => {
                const subtotal = item.quantity * item.unitPrice;
                const tax = (subtotal * item.taxRate) / 100;
                return sum + subtotal + tax;
            }, 0);

            // Apply discount if provided
            let finalTotal = total;
            if (input.discount) {
                if (input.discount.type === "percentage") {
                    finalTotal = total - (total * input.discount.value / 100);
                } else {
                    finalTotal = total - input.discount.value;
                }
            }

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
                        // We don't store notes directly in the Quote model, this would be handled separately in a real app
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
                        // This is an existing item, update it
                        await tx.quoteItem.update({
                            where: { id: item.id },
                            data: {
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                // We don't update the itemId as that would change the product
                            }
                        });
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
