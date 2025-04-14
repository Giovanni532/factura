import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.item.findMany({
        where: {
            userId,
        },
        orderBy: {
            name: 'asc',
        },
    });

    console.log(items);

    return NextResponse.json(items);
}

