"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import TemplateEditor from "@/components/templates/TemplateEditor"
import { createTemplate } from "@/actions/template"
import { useAction } from "@/hooks/use-action"
import { paths } from "@/paths"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TemplateCreateClientPage() {
    const router = useRouter()

    // Utiliser le hook useAction pour la server action
    const { execute: executeCreateTemplate, isLoading: isSubmitting } = useAction(createTemplate, {
        onSuccess: (result) => {
            toast.success("Template créé avec succès", {
                description: "Votre template a été créé et sauvegardé.",
            });

            // Rediriger vers la liste des templates
            router.push(paths.dashboard.templates.list);
        },
        onError: (error) => {
            toast.error("Erreur lors de la création du template", {
                description: error || "Veuillez réessayer.",
            });
        }
    });

    // Fonction pour gérer l'annulation
    const handleCancel = () => {
        router.push(paths.dashboard.templates.list);
    }

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (formData: any) => {
        executeCreateTemplate({
            name: formData.name,
            description: formData.description || undefined,
            type: formData.type,
            content: formData.content,
            isDefault: formData.isDefault || false
        });
    }

    // Animation pour le conteneur principal
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <motion.div className="flex flex-col space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                    }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Créer un nouveau template</CardTitle>
                            <CardDescription>
                                Concevez un template personnalisé pour vos factures et devis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TemplateEditor
                                onSave={handleSubmit}
                                onCancel={handleCancel}
                                isSubmitting={isSubmitting}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    )
} 