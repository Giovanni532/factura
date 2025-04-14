import React from 'react'
import { getQuoteById } from '@/actions/quote'
import QuoteDetailPage from './quote-detail';
import { cache } from 'react'
import { cookies } from 'next/headers'
// Fonction pour récupérer un devis spécifique avec ID
const getQuoteData = cache(async (quoteId: string) => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/quotes/${quoteId}`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
    })
    const { quote } = await response.json();
    return quote || null;
});



export async function generateMetadata({ params }: { params: Promise<{ quoteId: string }> }) {
    const quoteId = (await params).quoteId;
    const quote = await getQuoteData(quoteId);
    return {
        title: `Devis | Factura (${quote?.id || quoteId})`,
        description: `Voir le devis ${quote?.id || quoteId}`,
    }
}

export default async function QuotesPageDetail({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params;

    // Récupérer le devis avec ID en utilisant la fonction mise en cache
    const quote = await getQuoteData(quoteId);

    // Vérifier si le devis existe
    if (!quote) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Devis introuvable</h2>
                    <p className="text-muted-foreground">
                        Le devis que vous recherchez n&apos;existe pas ou vous n&apos;avez pas les permissions nécessaires.
                    </p>
                </div>
            </div>
        );
    }

    return <QuoteDetailPage quote={quote} />
}
