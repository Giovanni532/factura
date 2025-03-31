"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user?.id,
        },
    })
    return user
}
