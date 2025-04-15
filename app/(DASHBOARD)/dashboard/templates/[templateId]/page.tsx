import React from 'react'
import { getTemplateById, updateTemplate } from '@/actions/template'
import TemplateEditor from '@/components/templates/TemplateEditor'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { paths } from '@/paths'
import { auth } from "@/lib/auth"

export default async function TemplatesDetailPage({
    params
}: {
    params: { templateId: string }
}) {
    // Récupération de la session utilisateur
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        redirect(paths.auth.signIn)
    }

    // Récupération du template
    const templateResponse = await getTemplateById({
        id: params.templateId
    })

    if (!templateResponse?.data) {
        redirect(paths.dashboard.templates.list)
    }

    const template = templateResponse.data

    // Vérification des droits d'accès
    if (template.userId !== userId) {
        redirect(paths.dashboard.templates.list)
    }

    // Préparation des données pour l'éditeur
    const initialData = {
        ...template,
        contentObj: JSON.parse(template.content)
    }

    // Fonction de mise à jour
    async function handleUpdate(data: any) {
        'use server'

        try {
            const result = await updateTemplate({
                id: params.templateId,
                name: data.name,
                description: data.description || undefined,
                type: data.type,
                content: data.content,
                isDefault: data.isDefault || false
            })

            if (result?.success) {
                redirect(paths.dashboard.templates.list)
            }
        } catch (error) {
            console.error('Failed to update template:', error)
        }
    }

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Template</CardTitle>
                    <CardDescription>
                        Customize your invoice or quote template
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TemplateEditor
                        initialData={initialData}
                        templateType={template.type}
                        onSave={handleUpdate}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
