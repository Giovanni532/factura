import React from 'react'
import EditDevisPage from './quote-edit'
import { getQuoteById, getUserQuotes } from '@/actions/quote'
import { getClientsByUserId } from '@/actions/client'
import { getProductsByUserId } from '@/actions/produit'
import { getUser } from '@/actions/auth'

export async function generateStaticParams() {
    const quotes = await getUserQuotes({});
    if (!quotes?.data?.quotes) {
        return [];
    }
    return quotes.data.quotes.map((quote) => ({ quoteId: quote.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params;
    const quote = await getQuoteById({ id: quoteId });
    return {
        title: `Devis | Factura (${quote?.data?.quote?.id})`,
        description: `Modifier le devis ${quote?.data?.quote?.id}`,
    }
}

export default async function QuotesPageEdit({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params
    const user = await getUser()

    const response = await getQuoteById({ id: quoteId })

    // Fetch clients and products
    const clientsResult = await getClientsByUserId({ userId: user?.id as string })
    const itemsResult = await getProductsByUserId({ userId: user?.id as string })

    // Handle possible errors or undefined responses
    const clients = clientsResult?.data?.clients || []

    // Map Item model to the Product type expected by the EditDevisPage component
    const products = (itemsResult?.data?.items || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        defaultPrice: item.unitPrice,
        defaultTaxRate: 20, // Default tax rate if not in the Item model
        userId: item.userId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    }));

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

    const quoteData = response.data.quote;

    const enhancedQuote = {
        id: quoteData.id,
        userId: user?.id as string,
        total: 0,
        clientId: "",
        validUntil: null,
        updatedAt: new Date(),
        createdAt: quoteData.createdAt,
        status: quoteData.status,
        number: quoteData.number,
        items: quoteData.items?.map(item => {

            const matchingProduct = products.find(p =>
                p.name === item.name
            );

            return {
                id: item.id,
                productId: matchingProduct?.id || item.id,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate
            };
        }) || [],
        notes: quoteData.notes,
        discount: quoteData.discount
    };

    if (quoteData.client && quoteData.client.name) {
        const matchingClient = clients.find(c => c.name === quoteData.client.name);
        if (matchingClient) {
            enhancedQuote.clientId = matchingClient.id;
        }
    }

    return (
        <EditDevisPage
            quote={{
                ...enhancedQuote,
                invoiceId: quoteData.id || null,
                note: enhancedQuote.notes || null,
                validUntil: enhancedQuote.validUntil || null
            }}
            clients={clients}
            products={products}
        />
    )
}
