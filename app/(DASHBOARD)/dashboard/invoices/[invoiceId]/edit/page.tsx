"use server"

import React from 'react'
import EditInvoicePage from './edit-invoice'
import { getInvoiceById } from '@/actions/facture'
import { getClientsByUserId } from '@/actions/client'
import { getProductsByUserId } from '@/actions/produit'
import { cache } from 'react'
import { cookies } from 'next/headers'

// Fonction mise en cache pour récupérer les données nécessaires à l'édition d'une facture
const getInvoiceEditData = cache(async (invoiceId: string, userId: string) => {
    // Récupérer toutes les données en parallèle
    const [invoiceResponse, clientsResult, itemsResult] = await Promise.all([
        getInvoiceById({ id: invoiceId }),
        getClientsByUserId({ userId }),
        getProductsByUserId({ userId })
    ]);

    // Extraire les données de la facture
    const invoiceData = invoiceResponse?.data?.invoice;

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

    return { invoiceData, clients, products };
});


export async function generateMetadata({ params }: { params: Promise<{ invoiceId: string }> }) {
    const { invoiceId } = await params;
    return {
        title: `Facture | Factura (${invoiceId})`,
        description: `Modifier la facture ${invoiceId}`,
    }
}

export default async function InvoicesPageEdit({ params }: { params: Promise<{ invoiceId: string }> }) {
    const { invoiceId } = await params;
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
    const { invoiceData, clients, products } = await getInvoiceEditData(invoiceId, user.id);

    // Check if response has the expected structure
    if (!invoiceData) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Facture introuvable</h2>
                    <p className="text-gray-600">La facture que vous cherchez n&apos;existe pas.</p>
                </div>
            </div>
        )
    }

    // Transform the data structure to match the expected Invoice type
    const enhancedInvoice = {
        ...invoiceData,
        userId: user.id,
        clientId: invoiceData.client.id,
        items: invoiceData.items?.map(item => ({
            ...item,
            description: item.description || ""
        }))
    };

    return (
        <EditInvoicePage
            invoice={enhancedInvoice}
            clients={clients}
            products={products}
        />
    )
}