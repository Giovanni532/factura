import React from 'react'
import DataTableQuote from './data-table-quote'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function QuotesPage() {
    await sleep(1000)

    return (
        <div>
            <DataTableQuote />
        </div>
    )
}
