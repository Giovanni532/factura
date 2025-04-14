import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type Invoice = {
    id: string;
    number: string;
    client: {
        name: string;
        company?: string;
    };
    createdAt: Date;
    dueDate: Date;
    amount: number;
    status: "pending" | "paid" | "overdue" | "canceled";
    paidAmount?: number;
};

// Fonction pour mapper le statut de la base de données au format frontend
const mapStatus = (status: string): "pending" | "paid" | "overdue" | "canceled" => {
    switch (status) {
        case "PENDING": return "pending";
        case "PAID": return "paid";
        case "OVERDUE": return "overdue";
        case "CANCELED": return "canceled";
        default: return "pending";
    }
};


export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
        where: {
            userId
        },
        include: {
            client: true,
            payments: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    // Transformer les factures au format attendu par le frontend
    const formattedInvoices: Invoice[] = invoices.map(invoice => {
        // Calculer le montant total payé
        const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

        return {
            id: invoice.id,
            number: `FAC-${invoice.id.slice(0, 8)}`, // Générer un numéro basé sur l'ID
            client: {
                name: invoice.client.name,
                company: invoice.client.company || undefined
            },
            createdAt: invoice.createdAt,
            dueDate: invoice.dueDate,
            amount: invoice.total,
            status: mapStatus(invoice.status),
            paidAmount: paidAmount
        };
    });

    return NextResponse.json(formattedInvoices);
}
