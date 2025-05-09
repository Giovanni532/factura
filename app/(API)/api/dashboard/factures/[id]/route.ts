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

    // First try to find the invoice directly
    let invoice = await prisma.invoice.findUnique({
        where: {
            id,
            userId: session.user.id
        },
        include: {
            client: true,
            invoiceItems: {
                include: {
                    item: true
                }
            },
            payments: {
                orderBy: {
                    paidAt: 'desc'
                }
            },
            user: {
                include: {
                    businesses: true
                }
            },
            createdFrom: true // Include the quote if this invoice was created from a quote
        }
    });

    // If invoice not found, check if there's a quote with this ID that has been converted to an invoice
    if (!invoice) {
        const quote = await prisma.quote.findUnique({
            where: {
                id,
                userId: session.user.id,
                status: 'CONVERTED' // Only converted quotes
            },
            include: {
                convertedTo: {
                    include: {
                        client: true,
                        invoiceItems: {
                            include: {
                                item: true
                            }
                        },
                        payments: {
                            orderBy: {
                                paidAt: 'desc'
                            }
                        },
                        user: {
                            include: {
                                businesses: true
                            }
                        }
                    }
                }
            }
        });

        // If we found a quote that was converted to an invoice, use its invoice
        if (quote?.convertedTo) {
            // Type assertion to match the expected invoice structure
            invoice = {
                ...quote.convertedTo,
                createdFrom: quote
            };
        }
    }

    // Si la facture n'existe pas ou n'appartient pas à l'utilisateur
    if (!invoice) {
        return NextResponse.json({ invoice: null });
    }

    // Récupérer les informations de l'entreprise de l'utilisateur
    const business = invoice.user.businesses[0]; // On suppose que l'utilisateur a au moins une entreprise

    // Calculer le montant total payé
    const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Formater les éléments de la facture
    const formattedItems = invoice.invoiceItems.map(item => ({
        id: item.id,
        itemId: item.itemId,
        name: item.item.name,
        description: item.item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
    }));

    // Formater les paiements
    const formattedPayments = invoice.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        paidAt: payment.paidAt
    }));

    return NextResponse.json({
        invoice: {
            id: invoice.id,
            number: `FAC-${invoice.id.slice(0, 8)}`,
            status: invoice.status,
            createdAt: invoice.createdAt,
            dueDate: invoice.dueDate,
            total: invoice.total,
            paidAmount,
            remainingAmount: invoice.total - paidAmount,
            isPaid: paidAmount >= invoice.total,
            client: {
                id: invoice.client.id,
                name: invoice.client.name,
                email: invoice.client.email,
                phone: invoice.client.phone,
                company: invoice.client.company,
                address: invoice.client.address,
                postalCode: invoice.client.postalCode,
                city: invoice.client.city,
                country: invoice.client.country
            },
            business: business ? {
                name: business.name,
                address: business.address,
                city: business.city,
                postalCode: business.postalCode,
                country: business.country,
                taxId: business.taxId,
                logoUrl: business.logoUrl
            } : null,
            items: formattedItems,
            payments: formattedPayments,
            vatRate: invoice.vatRate,
            vatAmount: invoice.vatAmount,
            totalHT: invoice.totalHT,
            totalTTC: invoice.total,
            // Add the source quote ID if this invoice was created from a quote
            createdFromQuoteId: invoice.createdFromId || null,
            // Include original quote data if available
            originalQuote: invoice.createdFrom ? {
                id: invoice.createdFrom.id,
                status: invoice.createdFrom.status,
                createdAt: invoice.createdFrom.createdAt
            } : null
        }
    });

}