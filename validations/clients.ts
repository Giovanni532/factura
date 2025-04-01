import { z } from "zod";

export const getClientsByUserIdSchema = z.object({
    userId: z.string(),
});