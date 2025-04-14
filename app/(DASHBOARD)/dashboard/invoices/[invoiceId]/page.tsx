import React from 'react'
import InvoiceDetail from './invoice-detail'
import { cache } from 'react'
import { cookies } from 'next/headers'
// Fonction mise en cache pour récupérer une facture spécifique
const getInvoiceData = cache(async (invoiceId: string) => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/factures/${invoiceId}`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const { invoice } = await response.json();

    return invoice;
});


export async function generateMetadata({ params }: { params: Promise<{ invoiceId: string }> }) {
    const invoiceId = (await params).invoiceId;
    const invoice = await getInvoiceData(invoiceId);

    return {
        title: `Facture | Factura (${invoice?.number || invoiceId})`,
        description: `Modifier la facture ${invoice?.number || invoiceId}`,
    }
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
    const invoiceId = (await params).invoiceId;

    // Récupérer les détails de la facture avec la fonction mise en cache
    const invoice = await getInvoiceData(invoiceId);

    // Si la facture n'existe pas, afficher un message d'erreur
    if (!invoice) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Facture introuvable</h2>
                    <p className="text-muted-foreground">
                        La facture que vous recherchez n&apos;existe pas ou vous n&apos;avez pas les permissions nécessaires.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <InvoiceDetail
            invoice={invoice}
        />
    )
}
