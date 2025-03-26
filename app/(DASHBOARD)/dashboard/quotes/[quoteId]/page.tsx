import React from 'react'
import QuoteDetail from './quote-detail'

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function QuotesPageDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await sleep(1000)
    return (
        <QuoteDetail id={id} />
    )
}
