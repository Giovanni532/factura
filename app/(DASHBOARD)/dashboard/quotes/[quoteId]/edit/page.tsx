import React from 'react'
import EditDevisPage from './quote-edit'
import { cache } from 'react'
import { cookies } from 'next/headers'
// Fonction mise en cache pour récupérer les données nécessaires à l'édition d'un devis
const getQuoteEditData = cache(async (quoteId: string, userId: string) => {
    // Récupérer toutes les données en parallèle
    const allCookies = await cookies()
    const responseClients = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/clients`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const { clients } = await responseClients.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/quotes/${quoteId}`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
    })
    const { quote } = await response.json();
    // Extraire les données du devis
    const quoteData = quote;

    const responseItems = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/products`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
    })
    const productsData = await responseItems.json();

    // Transformer les items en produits
    const products = (productsData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        defaultPrice: item.unitPrice,
        defaultTaxRate: 20, // Default tax rate if not in the Item model
        userId: item.userId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    }));

    return { quoteData, clients, products };
});

export async function generateMetadata({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params;
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/quotes/${quoteId}`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
    })
    const { quote } = await response.json();
    return {
        title: `Devis | Factura (${quote?.id})`,
        description: `Modifier le devis ${quote?.id}`,
    }
}

export default async function QuotesPageEdit({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params;
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const user = await response.json();
    // Vérifier si l'utilisateur est connecté
    if (!user || !user.id) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Vous devez être connecté</h2>
                </div>
            </div>
        );
    }

    // Récupérer les données avec la fonction mise en cache
    const { quoteData, clients, products } = await getQuoteEditData(quoteId, user.id);

    if (!quoteData) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Devis introuvable</h2>
                </div>
            </div>
        )
    }

    if (quoteData.status === "CONVERTED") {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Ce devis a été converti en facture</h2>
                    <p className="text-muted-foreground">Vous ne pouvez plus modifier ce devis</p>
                </div>
            </div>
        )
    }

    const enhancedQuote = {
        id: quoteData.id,
        userId: user.id,
        total: 0,
        clientId: "",
        validUntil: null,
        updatedAt: new Date(),
        createdAt: quoteData.createdAt,
        status: quoteData.status,
        number: quoteData.number,
        items: quoteData.items?.map((item: any) => {
            const matchingProduct = products.find((p: any) =>
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
        const matchingClient = clients.find((c: any) => c.name === quoteData.client.name);
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
