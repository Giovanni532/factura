"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { QuoteForm } from "@/components/quotes/quote-form"
import { PageTitle } from "@/components/quotes/page-title"

export default function CreateQuotePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fonction pour gérer l'annulation
    const handleCancel = () => {
        router.push("/dashboard/quotes")
    }

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true)

        try {
            // Simuler un délai de traitement
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Afficher les données du formulaire dans la console (pour démonstration)
            console.log("Données du devis soumises:", formData)

            // Afficher un toast de succès
            toast.success("Devis créé avec succès", {
                description: "Votre devis a été enregistré.",
            })

            // Rediriger vers la liste des devis
            router.push("/dashboard/quotes")
        } catch (error) {
            console.error("Erreur lors de la création du devis:", error)

            // Afficher un toast d'erreur
            toast.error("Une erreur est survenue lors de la création du devis.", {
                description: "Veuillez réessayer.",
            })
        } finally {
            setIsSubmitting(false)
        }
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
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                    }}
                >
                    <Button variant="ghost" size="sm" className="gap-1" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </motion.div>
                <PageTitle
                    title="Créer un nouveau devis"
                    description="Remplissez les informations ci-dessous pour créer un nouveau devis."
                />
                <QuoteForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
            </motion.div>
        </div>
    )
}

