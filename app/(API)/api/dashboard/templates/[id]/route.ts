import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
        where: {
            id: id,
            userId: session.user.id,
        },
    });

    return NextResponse.json({ template });

}