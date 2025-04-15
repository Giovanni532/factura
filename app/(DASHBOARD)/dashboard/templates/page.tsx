import React from 'react'
import { cookies } from 'next/headers'
import DataTableTemplate from './data-table-template'
import { cache } from 'react'

// Fonction mise en cache pour récupérer les templates
const getTemplatesData = cache(async () => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/templates`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
    })
    const templates = await response.json();
    return templates || [];
})

// Revalidation toutes les heures
export const revalidate = 3600;

export async function generateMetadata() {
    return {
        title: "Templates | Factura",
        description: "Gérer vos templates de factures et devis",
    }
}

export default async function TemplatesPage() {
    const templates = await getTemplatesData();

    return (
        <DataTableTemplate templates={templates} />
    )
}
