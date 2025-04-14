import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface QuoteClient {
    name: string
    company?: string
}
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED"

export interface Quote {
    id: string
    number: string
    client: QuoteClient
    createdAt: Date
    dueDate: Date
    amount: number
    status: QuoteStatus
}

export interface QuoteDetail {
    id: string;
    number: string;
    client: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
    };
    company: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
        logo?: string;
        taxId: string;
    };
    items: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    createdAt: Date;
    dueDate: Date;
    status: QuoteStatus;
    discount?: {
        type: "percentage" | "fixed";
        value: number;
    };
    notes?: string;
    total: number;
}

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const quotes = await prisma.quote.findMany({
        where: {
            userId: userId
        },
        include: {
            client: true,
            quoteItems: {
                include: {
                    item: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Transform database quotes to the format expected by the frontend
    const formattedQuotes: Quote[] = quotes.map(quote => ({
        id: quote.id,
        number: `DEV-${quote.id.slice(0, 8)}`, // Generate a number based on ID
        client: {
            name: quote.client.name,
            company: quote.client.company || undefined
        },
        createdAt: quote.createdAt,
        dueDate: quote.validUntil || new Date(),
        amount: quote.total,
        status: quote.status as QuoteStatus
    }));

    return NextResponse.json(formattedQuotes);
}
