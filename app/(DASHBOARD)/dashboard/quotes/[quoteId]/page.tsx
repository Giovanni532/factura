import React from 'react'
import { getQuoteById } from '@/actions/quote'
import QuoteDetailPage from './quote-detail';
import { unstable_noStore } from 'next/cache';

export default async function QuotesPageDetail({ params }: { params: Promise<{ quoteId: string }> }) {
    // Désactiver la mise en cache pour cette page
    unstable_noStore();

    const { quoteId } = await params;

    // Fetch the quote by ID using the server action
    const response = await getQuoteById({ id: quoteId });

    // Check if the quote was found
    if (!response?.data?.quote) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Devis introuvable</h2>
                    <p className="text-muted-foreground">
                        Le devis que vous recherchez n'existe pas ou vous n'avez pas les permissions nécessaires.
                    </p>
                </div>
            </div>
        );
    }
    console.log(response.data.quote)
    return <QuoteDetailPage quote={response.data.quote} />
}
