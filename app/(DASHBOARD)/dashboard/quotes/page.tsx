import React from 'react'
import DataTableQuote from './data-table-quote'
import { getUserQuotes } from '@/actions/quote'

export async function generateMetadata() {
    const quotes = await getUserQuotes({});
    if (!quotes?.data?.quotes) {
        return {
            title: `Devis | Factura`,
            description: `Voyez et gérez tous vos devis`,
        }
    }
    return {
        title: `Devis | Factura (${quotes.data.quotes.length})`,
        description: `Voyez et gérez tous vos ${quotes.data.quotes.length} devis`,
    }
}

export default async function QuotesPage() {
    const quotes = await getUserQuotes({});
    const quotesData = quotes?.data?.quotes || [];
    return <DataTableQuote quotes={quotesData} />;
}
