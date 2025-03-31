import { z } from "zod";

export const getUserQuotesSchema = z.object({});

export const createQuoteSchema = z.object({
    clientId: z.string(),
});

// Schema for getting a quote by ID
export const getQuoteByIdSchema = z.object({
    id: z.string()
});