import React from 'react'
import EditDevisPage from './quote-edit'
import { getQuoteById } from '@/actions/quote'
import { getClientsByUserId } from '@/actions/client'
import { getProductsByUserId } from '@/actions/produit'
import { getUser } from '@/actions/auth'

export default async function QuotesPageEdit({ params }: { params: Promise<{ quoteId: string }> }) {
    const { quoteId } = await params
    const user = await getUser()

    const userId = user?.id as string

    if (!userId) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Vous devez être connecté</h2>
                </div>
            </div>
        )
    }

    const response = await getQuoteById({ id: quoteId })

    // Fetch clients and products
    const clientsResult = await getClientsByUserId({ userId })
    const itemsResult = await getProductsByUserId({ userId })

    // Handle possible errors or undefined responses
    const clients = clientsResult?.data?.data?.clients || []

    // Map Item model to the Product type expected by the EditDevisPage component
    const products = (itemsResult?.data?.data?.items || []).map(item => ({
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

    // Extract the data from response based on the QuoteDetail structure
    const quoteData = response.data.quote;

    // Create a compatible quote object expected by EditDevisPage
    const enhancedQuote = {
        id: quoteData.id,
        userId: userId,
        total: 0,
        clientId: "", // We'll set this from clients array if possible
        validUntil: null,
        updatedAt: new Date(),
        createdAt: quoteData.createdAt,
        status: quoteData.status,
        // Additional properties expected by EditDevisPage
        number: quoteData.number,
        items: quoteData.items?.map(item => {
            // Dans getQuoteById, nous formattons déjà les items avec les noms des produits
            // car qItem.item.name est utilisé pour obtenir le nom du produit associé
            // Le problème est que nous n'avons pas accès à l'ID du produit (itemId)

            // Cherchons le produit correspondant dans la liste des produits
            const matchingProduct = products.find(p =>
                // Essayons de trouver une correspondance par nom de produit
                p.name === item.name
            );

            return {
                id: item.id,
                // Si on trouve un produit correspondant, utiliser son ID, sinon fallback
                productId: matchingProduct?.id || item.id,
                // Utiliser le nom de l'item qui est déjà celui du produit associé (from qItem.item.name)
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

    // Find matching client from our clients list if possible
    if (quoteData.client && quoteData.client.name) {
        const matchingClient = clients.find(c => c.name === quoteData.client.name);
        if (matchingClient) {
            enhancedQuote.clientId = matchingClient.id;
        }
    }

    return (
        <EditDevisPage
            quote={enhancedQuote}
            clients={clients}
            products={products}
        />
    )
}
