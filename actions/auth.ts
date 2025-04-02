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

    const userProfile = {
        id: user?.id,
        firstName: user?.name?.split(' ')[0],
        lastName: user?.name?.split(' ')[1],
        email: user?.email,
        avatar: user?.image,
    }

    const business = await prisma.business.findUnique({
        where: {
            userId: session?.user?.id,
        },
    })

    const subscription = await prisma.subscription.findUnique({
        where: {
            userId: session?.user?.id,
        },
        select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            plan: true,
        }
    });

    const userData = {
        ...userProfile,
        business: business,
        subscription: subscription,
    }

    return userData
}
