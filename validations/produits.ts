import { z } from "zod";

export const getProductsByUserIdSchema = z.object({
    userId: z.string(),
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    unitPrice: z.number().min(0, "Le prix doit être supérieur ou égal à 0"),
});

export const updateProductSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    unitPrice: z.number().min(0, "Le prix doit être supérieur ou égal à 0"),
});

export const deleteProductSchema = z.object({
    id: z.string(),
});
