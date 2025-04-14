"use server"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session?.user?.id,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    const userProfile = {
        id: user?.id,
        firstName: user?.name?.split(' ')[0],
        lastName: user?.name?.split(' ')[1],
        email: user?.email,
        avatar: user?.image,
    }

    let business = await prisma.business.findUnique({
        where: {
            userId: session?.user?.id,
        },
    })

    if (!business) {
        business = await prisma.business.create({
            data: {
                userId: session?.user?.id as string,
                name: "Business",
            }
        })
    }
    let subscription = await prisma.subscription.findUnique({
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

    if (!subscription) {
        subscription = await prisma.subscription.create({
            data: {
                userId: session?.user?.id as string,
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'active',
            }
        })
    }

    const userData = {
        ...userProfile,
        business: business,
        subscription: subscription,
    }

    return NextResponse.json(userData);
}    
