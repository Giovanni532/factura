import React from 'react'
import { cache } from 'react'
import { cookies } from 'next/headers'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { Template } from '@prisma/client'

// Importer le composant TemplateEditor de manière dynamique pour éviter les problèmes SSR
const TemplateEditor = dynamic(() => import('./template-editor'), {
    loading: () => <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
})

// Optimiser la récupération des données du template avec le cache
const getTemplateData = cache(async (templateId: string) => {
    const allCookies = await cookies()
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/templates/${templateId}`, {
            credentials: 'include',
            headers: {
                Cookie: allCookies.toString(),
            },
            next: { revalidate: 0 }
        })

        if (!response.ok) {
            return { template: null }
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Erreur lors de la récupération du template:", error)
        return { template: null }
    }
})

export async function generateMetadata({ params }: { params: Promise<{ templateId: string }> }) {
    const { template } = await getTemplateData((await params).templateId)

    if (!template) {
        return {
            title: "Template introuvable | Factura",
            description: "Le template demandé n'existe pas."
        }
    }

    return {
        title: `${template.name} | Templates | Factura`,
        description: template.description || "Détails et édition du template"
    }
}

export default async function TemplateDetailsPage({ params }: { params: Promise<{ templateId: string }> }) {
    const { template } = await getTemplateData((await params).templateId)

    if (!template) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <TemplateEditor template={template as Template} />
        </div>
    )
}
