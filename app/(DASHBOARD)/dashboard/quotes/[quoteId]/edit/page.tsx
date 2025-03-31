import React from 'react'
import EditDevisPage from './quote-edit'

export default async function QuotesPageEdit({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params
    return (
        <EditDevisPage params={{ id: quoteId }} />
    )
}
