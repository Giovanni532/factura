import { z } from "zod";

export const getClientsByUserIdSchema = z.object({
    userId: z.string(),
});

export const createClientSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
});

export const updateClientSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
});

export const deleteClientSchema = z.object({
    id: z.string(),
});