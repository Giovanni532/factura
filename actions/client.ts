"use server"

import { prisma } from "@/lib/prisma";
import { useMutation } from "@/lib/safe-action";
import { z } from "zod";

const getClientsByUserIdSchema = z.object({
    userId: z.string(),
});

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