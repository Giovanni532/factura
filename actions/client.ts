"use server"

import { prisma } from "@/lib/prisma";
import { useMutation } from "@/lib/safe-action";
import {
    getClientsByUserIdSchema,
    createClientSchema,
    updateClientSchema,
    deleteClientSchema
} from "@/validations/clients";

export const getClientsByUserId = useMutation(
    getClientsByUserIdSchema,
    async ({ userId }, { userId: authUserId }) => {
        if (userId !== authUserId) {
            throw new Error("Vous n'êtes pas autorisé à accéder à ces données");
        }

        const clients = await prisma.client.findMany({
            where: {
                userId,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return {
            success: true,
            data: {
                clients,
            },
        };
    }
);

export const createClient = useMutation(
    createClientSchema,
    async (data, { userId }) => {
        const client = await prisma.client.create({
            data: {
                ...data,
                userId,
            },
        });

        return {
            success: true,
            data: client,
        };
    }
);

export const updateClient = useMutation(
    updateClientSchema,
    async ({ id, ...data }, { userId }) => {
        // Check if the client belongs to the user
        const existingClient = await prisma.client.findUnique({
            where: { id },
        });

        if (!existingClient) {
            throw new Error("Client non trouvé");
        }

        if (existingClient.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à modifier ce client");
        }

        const updatedClient = await prisma.client.update({
            where: { id },
            data,
        });

        return {
            success: true,
            data: updatedClient,
        };
    }
);

export const deleteClient = useMutation(
    deleteClientSchema,
    async ({ id }, { userId }) => {
        // Check if the client belongs to the user
        const existingClient = await prisma.client.findUnique({
            where: { id },
        });

        if (!existingClient) {
            throw new Error("Client non trouvé");
        }

        if (existingClient.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à supprimer ce client");
        }

        await prisma.client.delete({
            where: { id },
        });

        return {
            success: true,
        };
    }
);