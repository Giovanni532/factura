import { z } from "zod";

export const getUserInvoicesSchema = z.object({
    userId: z.string(),
});

export const getInvoiceByIdSchema = z.object({
    id: z.string(),
});

export const createInvoiceSchema = z.object({
    clientId: z.string(),
    dueDate: z.date(),
    vatRate: z.number().default(20),
    items: z.array(
        z.object({
            itemId: z.string(),
            quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
            unitPrice: z.number().min(0, "Le prix unitaire doit être supérieur ou égal à 0"),
        })
    ).min(1)
});

export const updateInvoiceSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    dueDate: z.date(),
    status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELED"]),
    vatRate: z.number().default(20),
    items: z.array(
        z.object({
            id: z.string().optional(),
            itemId: z.string(),
            quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
            unitPrice: z.number().min(0, "Le prix unitaire doit être supérieur ou égal à 0"),
        })
    ).min(1)
});

export const deleteInvoiceSchema = z.object({
    id: z.string(),
});

export const downloadInvoicePdfSchema = z.object({
    id: z.string(),
});

export const addPaymentSchema = z.object({
    invoiceId: z.string(),
    amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
    method: z.string().optional(),
    paidAt: z.date().default(() => new Date()),
});

export const deletePaymentSchema = z.object({
    id: z.string(),
});
