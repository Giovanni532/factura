import React from 'react'
import TemplateCreateClientPage from './template-create'
import { Metadata } from 'next'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
    title: "Créer un template | Factura",
    description: "Créer un template personnalisé pour vos factures et devis",
}

export default async function TemplatesCreatePage() {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": allCookies.toString(),
        },
        cache: "no-store",
    })

    const user = await response.json()
    const business = {
        ...user.business,
        email: user.email,
        logoUrl: user.business.logoUrl || '/placeholder-logo.png'
    }
    return <TemplateCreateClientPage business={business} />
}
