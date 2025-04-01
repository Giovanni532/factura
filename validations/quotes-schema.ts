import { z } from "zod";

export const getUserQuotesSchema = z.object({});

export const createQuoteSchema = z.object({
    clientId: z.string(),
    status: z.string().optional(),
    validUntil: z.date().optional(),
    quoteItems: z.array(
        z.object({
            id: z.string(),
            itemId: z.string(),
            quantity: z.number().positive(),
            unitPrice: z.number().min(0),
            description: z.string().optional(),
        })
    ).optional(),
});

// Schema for getting a quote by ID
export const getQuoteByIdSchema = z.object({
    id: z.string()
});

// Schema for duplicating a quote
export const duplicateQuoteSchema = z.object({
    id: z.string()
});

// Schema for deleting a quote
export const deleteQuoteSchema = z.object({
    id: z.string()
});

// Schema for downloading a quote as PDF
export const downloadQuotePdfSchema = z.object({
    id: z.string()
});

// Schema for converting a quote to an invoice
export const convertQuoteToInvoiceSchema = z.object({
    id: z.string(),
    dueDate: z.date().optional() // Optional due date for the invoice
});

// Schema for updating a quote
export const updateQuoteSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    createdAt: z.date(),
    dueDate: z.date(),
    status: z.enum(["draft", "sent", "accepted", "rejected", "converted"]),
    items: z.array(
        z.object({
            id: z.string(),
            productId: z.string(),
            name: z.string(),
            description: z.string().optional(),
            quantity: z.number().positive(),
            unitPrice: z.number().min(0),
            taxRate: z.number().min(0)
        })
    ),
    discount: z.object({
        type: z.enum(["percentage", "fixed"]),
        value: z.number().min(0)
    }).optional(),
    notes: z.string().optional()
});