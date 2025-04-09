import React from 'react'
import EditDevisPage from './quote-edit'
import { getQuoteById } from '@/actions/quote'
import { getClientsByUserId } from '@/actions/client'
import { getProductsByUserId } from '@/actions/produit'
import { getUser } from '@/actions/auth'
import { cache } from 'react'

// Fonction mise en cache pour récupérer les données nécessaires à l'édition d'un devis
const getQuoteEditData = cache(async (quoteId: string, userId: string) => {
    // Récupérer toutes les données en parallèle
    const [quoteResponse, clientsResult, itemsResult] = await Promise.all([
        getQuoteById({ id: quoteId }),
        getClientsByUserId({ userId }),
        getProductsByUserId({ userId })
    ]);

    // Extraire les données du devis
    const quoteData = quoteResponse?.data?.quote;

    // Extraire les clients
    const clients = clientsResult?.data?.clients || [];

    // Transformer les items en produits
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

    return { quoteData, clients, products };
});

export async function generateMetadata({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params;
    const quote = await getQuoteById({ id: quoteId });
    return {
        title: `Devis | Factura (${quote?.data?.quote?.id})`,
        description: `Modifier le devis ${quote?.data?.quote?.id}`,
    }
}

export default async function QuotesPageEdit({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params;
    const user = await getUser();

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
