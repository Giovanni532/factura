import { z } from "zod";

export const getUserQuotesSchema = z.object({});

export const createQuoteSchema = z.object({
    clientId: z.string(),
});