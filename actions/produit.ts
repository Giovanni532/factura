"use server"

import { prisma } from "@/lib/prisma";
import { useMutation } from "@/lib/safe-action";
import {
    getProductsByUserIdSchema,
    createProductSchema,
    updateProductSchema,
    deleteProductSchema
} from "@/validations/produits";

export const getProductsByUserId = useMutation(
    getProductsByUserIdSchema,
    async ({ userId }, { userId: authUserId }) => {
        if (userId !== authUserId) {
            throw new Error("Vous n'êtes pas autorisé à accéder à ces données");
        }

        const items = await prisma.item.findMany({
            where: {
                userId,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return {
            success: true,
            items,
        };
    }
);

export const createProduct = useMutation(
    createProductSchema,
    async (data, { userId }) => {
        const item = await prisma.item.create({
            data: {
                ...data,
                userId,
            },
        });

        return {
            success: true,
            data: item,
        };
    }
);

export const updateProduct = useMutation(
    updateProductSchema,
    async ({ id, ...data }, { userId }) => {
        // Vérifier si le produit appartient à l'utilisateur
        const existingItem = await prisma.item.findUnique({
            where: { id },
        });

        if (!existingItem) {
            throw new Error("Produit non trouvé");
        }

        if (existingItem.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à modifier ce produit");
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data,
        });

        return {
            success: true,
            data: updatedItem,
        };
    }
);

export const deleteProduct = useMutation(
    deleteProductSchema,
    async ({ id }, { userId }) => {
        // Vérifier si le produit appartient à l'utilisateur
        const existingItem = await prisma.item.findUnique({
            where: { id },
        });

        if (!existingItem) {
            throw new Error("Produit non trouvé");
        }

        if (existingItem.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à supprimer ce produit");
        }

        // Vérifier si le produit est utilisé dans des devis ou factures
        const itemUsage = await prisma.quoteItem.findFirst({
            where: { itemId: id },
        });

        if (itemUsage) {
            throw new Error("Ce produit ne peut pas être supprimé car il est utilisé dans un ou plusieurs devis");
        }

        const invoiceItemUsage = await prisma.invoiceItem.findFirst({
            where: { itemId: id },
        });

        if (invoiceItemUsage) {
            throw new Error("Ce produit ne peut pas être supprimé car il est utilisé dans une ou plusieurs factures");
        }

        await prisma.item.delete({
            where: { id },
        });

        return {
            success: true,
        };
    }
);
