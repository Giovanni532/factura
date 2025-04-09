"use server"

import React from 'react'
import EditInvoicePage from './edit-invoice'
import { getInvoiceById, getUserInvoices } from '@/actions/facture'
import { getClientsByUserId } from '@/actions/client'
import { getProductsByUserId } from '@/actions/produit'
import { getUser } from '@/actions/auth'

export async function generateStaticParams() {
    const response = await getUserInvoices({});
    if (!response?.data?.invoices) {
        return [];
    }
    return response.data.invoices.map((invoice) => ({ invoiceId: invoice.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ invoiceId: string }> }) {
    const { invoiceId } = await params;
    return {
        title: `Facture | Factura (${invoiceId})`,
        description: `Modifier la facture ${invoiceId}`,
    }
}

export default async function InvoicesPageEdit({ params }: { params: Promise<{ invoiceId: string }> }) {
    const { invoiceId } = await params
    const user = await getUser()

    const response = await getInvoiceById({ id: invoiceId })

    // Fetch clients and products
    const clientsResult = await getClientsByUserId({ userId: user?.id as string })
    const itemsResult = await getProductsByUserId({ userId: user?.id as string })

    // Handle possible errors or undefined responses
    const clients = clientsResult?.data?.clients || []

    // Map Item model to the Product type expected by the EditInvoicePage component
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

    // Check if response has the expected structure
    if (!response?.data || !('invoice' in response.data) || !response.data.invoice) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-semibold mb-2">Facture introuvable</h2>
                    <p className="text-gray-600">La facture que vous cherchez n&apos;existe pas.</p>
                </div>
            </div>
        )
    }

    const invoiceData = response.data?.invoice;

    // Transform the data structure to match the expected Invoice type
    const enhancedInvoice = {
        ...invoiceData,
        userId: user?.id as string,
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