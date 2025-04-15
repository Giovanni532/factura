import React from 'react'
import TemplateCreateClientPage from './template-create'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Créer un template | Factura",
    description: "Créer un template personnalisé pour vos factures et devis",
}

export default async function TemplatesCreatePage() {
    return <TemplateCreateClientPage />
}
