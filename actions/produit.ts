"use server"

import { prisma } from "@/lib/prisma";
import { useMutation } from "@/lib/safe-action";
import { z } from "zod";

const getProductsByUserIdSchema = z.object({
    userId: z.string(),
});

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
            data: {
                items,
            },
        };
    }
);
