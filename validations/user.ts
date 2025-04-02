import { z } from "zod";

// Schéma pour l'adresse de l'entreprise
export const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
});

// Schéma pour les informations personnelles
export const personalInfoSchema = z.object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    avatar: z.string().nullable().optional(),
});

// Schéma pour les informations de l'entreprise
export const businessInfoSchema = z.object({
    name: z.string().min(1, "Le nom de l'entreprise est requis"),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    taxId: z.string().nullable().optional(),
    vatNumber: z.string().nullable().optional(),
});

// Schéma pour la mise à jour du profil complet
export const updateProfileSchema = z.object({
    personal: personalInfoSchema,
    business: businessInfoSchema,
});

// Type pour la mise à jour du profil
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;
