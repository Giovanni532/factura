import React from 'react'
import { getInvoiceById } from '@/actions/facture'
import { getUser } from '@/actions/auth'
import InvoiceDetail from './invoice-detail'

export default async function InvoiceDetailPage({ params }: { params: { invoiceId: string } }) {
    // Récupérer l'utilisateur connecté
    const user = await getUser()

    // Récupérer les détails de la facture
    const response = await getInvoiceById({ id: params.invoiceId })

    const invoice = response?.data?.invoice

    // Si la facture n'existe pas, rediriger vers la liste des factures
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
