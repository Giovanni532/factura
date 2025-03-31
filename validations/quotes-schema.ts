import { z } from "zod";

export const getUserQuotesSchema = z.object({});

export const createQuoteSchema = z.object({
    clientId: z.string(),
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