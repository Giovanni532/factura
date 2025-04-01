import React from 'react'
import EditDevisPage from './quote-edit'
import { getQuoteById } from '@/actions/quote'

export default async function QuotesPageEdit({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params
    const response = await getQuoteById({ id: quoteId })

    if (!response?.data?.quote) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Devis introuvable</h2>
                </div>
            </div>
        )
    }
    if (response.data.quote.status === "CONVERTED") {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Ce devis a été converti en facture</h2>
                    <p className="text-muted-foreground">Vous ne pouvez plus modifier ce devis</p>
                </div>
            </div>
        )
    }
    return (
        <EditDevisPage quote={response.data.quote} />
    )
}
