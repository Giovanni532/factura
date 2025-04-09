import React from 'react'
import DataTableQuote from './data-table-quote'
import { getUserQuotes } from '@/actions/quote'
import { cache } from 'react'

// Fonction mise en cache pour récupérer les devis
const getQuotesData = cache(async () => {
    const quotes = await getUserQuotes({});
    return quotes?.data?.quotes || [];
})

// Revalidation toutes les heures
export const revalidate = 3600;

export async function generateMetadata() {
    const quotes = await getQuotesData();

    if (!quotes.length) {
        return {
            title: `Devis | Factura`,
            description: `Voyez et gérez tous vos devis`,
        }
    }

    return {
        title: `Devis | Factura (${quotes.length})`,
        description: `Voyez et gérez tous vos ${quotes.length} devis`,
    }
}

export async function generateStaticParams() {
    const quotes = await getQuotesData();

    if (!quotes.length) {
        return [];
    }

    return quotes.map((quote) => ({ quoteId: quote.id }));
}

export default async function QuotesPage() {
    const quotesData = await getQuotesData();
    return <DataTableQuote quotes={quotesData} />;
}
