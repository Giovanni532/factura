"use server"

import { useMutation } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import {
    getUserInvoicesSchema,
    getInvoiceByIdSchema,
    deleteInvoiceSchema,
    downloadInvoicePdfSchema,
    updateInvoiceSchema,
    createInvoiceSchema,
    addPaymentSchema,
    deletePaymentSchema,
    duplicateInvoiceSchema
} from "@/validations/factures";

// Server action pour récupérer une facture spécifique par ID
export const getInvoiceById = useMutation(
    getInvoiceByIdSchema,
    async ({ id }, { userId }) => {
        try {
            // Récupérer la facture par ID, en s'assurant qu'elle appartient à l'utilisateur connecté
            const invoice = await prisma.invoice.findUnique({
                where: {
                    id,
                    userId
                },
                include: {
                    client: true,
                    invoiceItems: {
                        include: {
                            item: true
                        }
                    },
                    payments: {
                        orderBy: {
                            paidAt: 'desc'
                        }
                    },
                    user: {
                        include: {
                            businesses: true
                        }
                    }
                }
            });
            // Si la facture n'existe pas ou n'appartient pas à l'utilisateur
            if (!invoice) {
                return { invoice: null };
            }

            // Récupérer les informations de l'entreprise de l'utilisateur
            const business = invoice.user.businesses[0]; // On suppose que l'utilisateur a au moins une entreprise

            // Calculer le montant total payé
            const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

            // Formater les éléments de la facture
            const formattedItems = invoice.invoiceItems.map(item => ({
                id: item.id,
                itemId: item.itemId,
                name: item.item.name,
                description: item.item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
            }));

            // Formater les paiements
            const formattedPayments = invoice.payments.map(payment => ({
                id: payment.id,
                amount: payment.amount,
                method: payment.method,
                paidAt: payment.paidAt
            }));

            return {
                invoice: {
                    id: invoice.id,
                    number: `FAC-${invoice.id.slice(0, 8)}`,
                    status: invoice.status,
                    createdAt: invoice.createdAt,
                    dueDate: invoice.dueDate,
                    total: invoice.total,
                    paidAmount,
                    remainingAmount: invoice.total - paidAmount,
                    isPaid: paidAmount >= invoice.total,
                    client: {
                        id: invoice.client.id,
                        name: invoice.client.name,
                        email: invoice.client.email,
                        phone: invoice.client.phone,
                        company: invoice.client.company,
                        address: invoice.client.address,
                        postalCode: invoice.client.postalCode,
                        city: invoice.client.city,
                        country: invoice.client.country
                    },
                    business: business ? {
                        name: business.name,
                        address: business.address,
                        city: business.city,
                        postalCode: business.postalCode,
                        country: business.country,
                        taxId: business.taxId,
                        logoUrl: business.logoUrl
                    } : null,
                    items: formattedItems,
                    payments: formattedPayments,
                    vatRate: invoice.vatRate,
                    vatAmount: invoice.vatAmount,
                    totalHT: invoice.totalHT,
                    totalTTC: invoice.total,
                }
            };
        } catch (error) {
            console.error("Erreur lors de la récupération de la facture:", error);
            throw error;
        }
    }
);

// Server action pour créer une nouvelle facture
export const createInvoice = useMutation(
    createInvoiceSchema,
    async (data, { userId }) => {
        try {
            // Vérifier si le client existe et appartient à l'utilisateur
            const client = await prisma.client.findUnique({
                where: {
                    id: data.clientId,
                    userId
                }
            });

            if (!client) {
                throw new Error("Client introuvable ou non autorisé");
            }

            // Calculer le total HT de la facture
            const totalHT = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            // Calculer la TVA (par défaut 20% si non spécifiée)
            const vatRate = data.vatRate || 20;
            const vatAmount = (totalHT * vatRate) / 100;

            // Calculer le total TTC
            const totalTTC = totalHT + vatAmount;

            // Créer la facture et ses éléments en une seule transaction
            const invoice = await prisma.invoice.create({
                data: {
                    clientId: data.clientId,
                    userId,
                    dueDate: data.dueDate,
                    total: totalTTC,
                    totalHT: totalHT,
                    vatRate: vatRate,
                    vatAmount: vatAmount,
                    status: "PENDING",
                    invoiceItems: {
                        create: data.items.map(item => ({
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }))
                    }
                },
                include: {
                    invoiceItems: true
                }
            });

            return {
                success: true,
                invoice: {
                    id: invoice.id,
                    totalHT,
                    vatAmount,
                    total: totalTTC
                }
            };
        } catch (error) {
            console.error("Erreur lors de la création de la facture:", error);
            throw error;
        }
    }
);

// Server action pour mettre à jour une facture existante
export const updateInvoice = useMutation(
    updateInvoiceSchema,
    async (data, { userId }) => {
        try {
            // Vérifier si la facture existe et appartient à l'utilisateur
            const existingInvoice = await prisma.invoice.findUnique({
                where: {
                    id: data.id,
                    userId
                },
                include: {
                    invoiceItems: true,
                    payments: true
                }
            });

            if (!existingInvoice) {
                throw new Error("Facture introuvable ou non autorisée");
            }

            // Si la facture est déjà payée, empêcher certaines modifications
            const paidAmount = existingInvoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
            const isPaid = paidAmount >= existingInvoice.total;

            if (isPaid && data.status !== "PAID") {
                throw new Error("Impossible de modifier le statut d'une facture entièrement payée");
            }

            // Vérifier si le client existe et appartient à l'utilisateur
            const client = await prisma.client.findUnique({
                where: {
                    id: data.clientId,
                    userId
                }
            });

            if (!client) {
                throw new Error("Client introuvable ou non autorisé");
            }

            // Calculer le nouveau total HT
            const totalHT = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            // Calculer la TVA (utiliser la valeur existante ou par défaut 20%)
            const vatRate = data.vatRate !== undefined ? data.vatRate : (existingInvoice.vatRate || 20);
            const vatAmount = (totalHT * vatRate) / 100;

            // Calculer le total TTC
            const totalTTC = totalHT + vatAmount;

            // Créer un ensemble des IDs d'éléments existants
            const existingItemIds = new Set(existingInvoice.invoiceItems.map(item => item.id));

            // Séparer les éléments à créer, mettre à jour ou supprimer
            const itemsToCreate = data.items.filter(item => !item.id);
            const itemsToUpdate = data.items.filter(item => item.id && existingItemIds.has(item.id));
            const itemIdsToKeep = new Set(itemsToUpdate.map(item => item.id));
            const itemIdsToDelete = Array.from(existingItemIds).filter(id => !itemIdsToKeep.has(id as string));

            // Mettre à jour la facture et ses éléments en une seule transaction
            await prisma.$transaction(async (tx) => {
                // Mettre à jour la facture
                await tx.invoice.update({
                    where: { id: data.id },
                    data: {
                        clientId: data.clientId,
                        dueDate: data.dueDate,
                        status: data.status,
                        total: totalTTC,
                        totalHT: totalHT,
                        vatRate: vatRate,
                        vatAmount: vatAmount,
                        updatedAt: new Date()
                    }
                });

                // Supprimer les éléments qui ne sont plus présents
                if (itemIdsToDelete.length > 0) {
                    await tx.invoiceItem.deleteMany({
                        where: {
                            id: { in: itemIdsToDelete as string[] }
                        }
                    });
                }

                // Mettre à jour les éléments existants
                for (const item of itemsToUpdate) {
                    await tx.invoiceItem.update({
                        where: { id: item.id },
                        data: {
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }
                    });
                }

                // Créer les nouveaux éléments
                for (const item of itemsToCreate) {
                    await tx.invoiceItem.create({
                        data: {
                            invoiceId: data.id,
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }
                    });
                }
            });

            return {
                success: true,
                invoice: {
                    id: data.id,
                    totalHT,
                    vatAmount,
                    total: totalTTC
                }
            };
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la facture:", error);
            throw error;
        }
    }
);

// Server action pour supprimer une facture
export const deleteInvoice = useMutation(
    deleteInvoiceSchema,
    async ({ id }, { userId }) => {
        try {
            // Vérifier si la facture existe et appartient à l'utilisateur
            const invoice = await prisma.invoice.findUnique({
                where: {
                    id,
                    userId
                },
                include: {
                    payments: true
                }
            });

            if (!invoice) {
                throw new Error("Facture introuvable ou non autorisée");
            }

            // Empêcher la suppression d'une facture avec des paiements
            if (invoice.payments.length > 0) {
                throw new Error("Impossible de supprimer une facture ayant des paiements enregistrés");
            }

            // Supprimer d'abord les éléments de la facture puis la facture elle-même
            await prisma.$transaction([
                prisma.invoiceItem.deleteMany({
                    where: { invoiceId: id }
                }),
                prisma.invoice.delete({
                    where: { id }
                })
            ]);

            return { success: true };
        } catch (error) {
            console.error("Erreur lors de la suppression de la facture:", error);
            throw error;
        }
    }
);

// Server action pour ajouter un paiement à une facture
export const addPayment = useMutation(
    addPaymentSchema,
    async (data, { userId }) => {
        try {
            // Vérifier si la facture existe et appartient à l'utilisateur
            const invoice = await prisma.invoice.findUnique({
                where: {
                    id: data.invoiceId,
                    userId
                },
                include: {
                    payments: true
                }
            });

            if (!invoice) {
                throw new Error("Facture introuvable ou non autorisée");
            }

            // Calculer le montant déjà payé
            const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
            const remainingAmount = invoice.total - paidAmount;

            // Vérifier que le montant du paiement ne dépasse pas le montant restant dû
            if (data.amount > remainingAmount) {
                throw new Error(`Le montant du paiement ne peut pas dépasser le montant restant dû (${remainingAmount.toFixed(2)} €)`);
            }

            // Créer le paiement
            const payment = await prisma.payment.create({
                data: {
                    amount: data.amount,
                    method: data.method,
                    paidAt: data.paidAt,
                    invoiceId: data.invoiceId,
                    userId
                }
            });

            // Mettre à jour le statut de la facture si nécessaire
            const newPaidAmount = paidAmount + data.amount;
            const isPaid = newPaidAmount >= invoice.total;

            if (isPaid && invoice.status !== "PAID") {
                await prisma.invoice.update({
                    where: { id: data.invoiceId },
                    data: { status: "PAID" }
                });
            }

            return {
                success: true,
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    paidAt: payment.paidAt,
                    method: payment.method
                },
                invoiceStatus: isPaid ? "PAID" : invoice.status
            };
        } catch (error) {
            console.error("Erreur lors de l'ajout du paiement:", error);
            throw error;
        }
    }
);

// Server action pour supprimer un paiement
export const deletePayment = useMutation(
    deletePaymentSchema,
    async ({ id }, { userId }) => {
        try {
            // Vérifier si le paiement existe et appartient à l'utilisateur
            const payment = await prisma.payment.findUnique({
                where: {
                    id,
                    userId
                },
                include: {
                    invoice: {
                        include: {
                            payments: true
                        }
                    }
                }
            });

            if (!payment) {
                throw new Error("Paiement introuvable ou non autorisé");
            }

            // Supprimer le paiement
            await prisma.payment.delete({
                where: { id }
            });

            // Recalculer le montant total payé sans le paiement supprimé
            const remainingPayments = payment.invoice.payments.filter(p => p.id !== id);
            const newPaidAmount = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
            const isPaid = newPaidAmount >= payment.invoice.total;

            // Mettre à jour le statut de la facture si nécessaire
            let newStatus = payment.invoice.status;
            if (payment.invoice.status === "PAID" && !isPaid) {
                newStatus = "PENDING";
                if (new Date() > payment.invoice.dueDate) {
                    newStatus = "OVERDUE";
                }
                await prisma.invoice.update({
                    where: { id: payment.invoice.id },
                    data: { status: newStatus }
                });
            }

            return {
                success: true,
                invoiceStatus: newStatus
            };
        } catch (error) {
            console.error("Erreur lors de la suppression du paiement:", error);
            throw error;
        }
    }
);

// Server action pour dupliquer une facture existante
export const duplicateInvoice = useMutation(
    duplicateInvoiceSchema,
    async ({ id }, { userId }) => {
        try {
            // Récupérer la facture source avec tous ses éléments
            const sourceInvoice = await prisma.invoice.findUnique({
                where: {
                    id,
                    userId
                },
                include: {
                    invoiceItems: true
                }
            });

            if (!sourceInvoice) {
                throw new Error("Facture source introuvable ou non autorisée");
            }

            // Créer une nouvelle facture avec les mêmes données mais un statut PENDING
            const newInvoice = await prisma.invoice.create({
                data: {
                    clientId: sourceInvoice.clientId,
                    userId,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Date d'échéance par défaut à 30 jours
                    total: sourceInvoice.total,
                    totalHT: sourceInvoice.totalHT,
                    vatRate: sourceInvoice.vatRate,
                    vatAmount: sourceInvoice.vatAmount,
                    status: "PENDING",
                    invoiceItems: {
                        create: sourceInvoice.invoiceItems.map(item => ({
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }))
                    }
                },
                include: {
                    invoiceItems: true,
                    client: true
                }
            });

            return {
                success: true,
                invoice: {
                    id: newInvoice.id,
                    number: `FAC-${newInvoice.id.slice(0, 8)}`,
                    clientName: newInvoice.client.name,
                    createdAt: newInvoice.createdAt,
                    totalHT: newInvoice.totalHT,
                    vatAmount: newInvoice.vatAmount,
                    total: newInvoice.total
                }
            };
        } catch (error) {
            console.error("Erreur lors de la duplication de la facture:", error);
            throw error;
        }
    }
);