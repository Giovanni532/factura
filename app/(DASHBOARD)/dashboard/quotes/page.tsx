import React from 'react'
import DataTableQuote from './data-table-quote'
import { getUserQuotes } from '@/actions/quote'
import { Quote } from '@/actions/quote'

export default async function QuotesPage() {
    const response = await getUserQuotes({});
    const quotes: Quote[] = response?.data?.quotes || [];

    return <DataTableQuote quotes={quotes} />;
}
