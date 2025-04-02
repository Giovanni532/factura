import React from 'react'
import DataTableQuote from './data-table-quote'
import { getUserQuotes } from '@/actions/quote'
import { Quote } from '@/actions/quote'

export const getQuotes = async () => {
    const response = await getUserQuotes({});
    const quotes: Quote[] = response?.data?.quotes || [];
    return quotes;
}

export async function generateMetadata() {
    const quotes = await getQuotes();
    return {
        title: `Devis | Factura (${quotes.length})`,
        description: `Voyez et gérez tous vos ${quotes.length} devis`,
    }
}

export default async function QuotesPage() {
    const quotes = await getQuotes();

    return <DataTableQuote quotes={quotes} />;
}
