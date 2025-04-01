import { z } from "zod";

export const getProductsByUserIdSchema = z.object({
    userId: z.string(),
});
