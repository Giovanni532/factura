import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { QuoteStatus, QuoteDetail } from '../route';

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

    const quote = await prisma.quote.findUnique({
        where: {
            id: id,
            userId: session.user.id
        },
        include: {
            client: true,
            quoteItems: {
                include: {
                    item: true
                }
            },
            user: {
                include: {
                    businesses: true
                }
            }
        }
    });

    // If quote doesn't exist or doesn't belong to the user
    if (!quote) {
        return NextResponse.json({ quote: null });
    }

    // Get the user's business info
    const business = quote.user.businesses[0]; // Assuming the user has at least one business

    // Format quote items
    const items = quote.quoteItems.map(qItem => ({
        id: qItem.id,
        name: qItem.item.name,
        description: qItem.item.description || "",
        quantity: qItem.quantity,
        unitPrice: qItem.unitPrice,
        taxRate: 20 // Default tax rate, could be stored in the DB in a real implementation
    }));

    // Calculate subtotal and taxes
    const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    const taxes = items.reduce((total, item) => total + (item.quantity * item.unitPrice * item.taxRate) / 100, 0);
    const expectedTotal = subtotal + taxes;

    // If the stored total is less than expected total, there's a discount
    let discount = undefined;
    if (quote.total < expectedTotal) {
        const discountValue = expectedTotal - quote.total;
        const discountPercentage = (discountValue / subtotal) * 100;

        // If the discount seems close to a round percentage, use percentage type
        if (Math.abs(Math.round(discountPercentage) - discountPercentage) < 0.1) {
            discount = {
                type: "percentage" as const,
                value: Math.round(discountPercentage)
            };
        } else {
            discount = {
                type: "fixed" as const,
                value: discountValue
            };
        }
    }

    // Transform the database quote to the format expected by the frontend
    const formattedQuote: QuoteDetail = {
        id: quote.id,
        number: `DEV-${quote.id.slice(0, 8)}`,
        client: {
            name: quote.client.name,
            email: quote.client.email,
            address: {
                street: quote.client.address || "",
                city: quote.client.city || "",
                postalCode: quote.client.postalCode || "",
                country: quote.client.country || ""
            }
        },
        company: {
            name: business?.name || "Your Company",
            email: quote.user.email || "contact@company.com",
            address: {
                street: business?.address || "",
                city: business?.city || "",
                postalCode: business?.postalCode || "",
                country: business?.country || ""
            },
            logo: business?.logoUrl || undefined,
            taxId: business?.taxId || ""
        },
        items: items,
        createdAt: quote.createdAt,
        dueDate: quote.validUntil || new Date(),
        status: quote.status as QuoteStatus,
        discount: discount,
        notes: quote.note || undefined,
        total: quote.total
    };


    return NextResponse.json({ quote: formattedQuote });

}