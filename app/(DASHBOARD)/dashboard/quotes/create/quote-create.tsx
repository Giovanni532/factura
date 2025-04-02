"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { QuoteForm } from "@/components/quotes/quote-form"
import { PageTitle } from "@/components/quotes/page-title"
import { Client, Item } from "@prisma/client"
import { createQuote } from "@/actions/quote"
import { useAction } from "@/hooks/use-action"
import { paths } from "@/paths"

export default function QuoteCreateFormPage({ clients, products }: { clients: Client[], products: Item[] }) {
    const router = useRouter()

    // Utiliser le hook useAction pour connecter à la server action
    const { execute: executeCreateQuote, isLoading: isSubmitting } = useAction<{ clientId: string, status: string, validUntil: string, quoteItems: any[] }, any>(createQuote as any, {
        onSuccess: ({ data }) => {
            // Récupérer les données de façon sécurisée
            const success = data?.success || false;
            const message = data?.message || "Opération terminée";
            const quoteId = data?.quoteId;

            if (success) {
                toast.success(message, {
                    description: "Votre devis a été créé avec succès.",
                });

                // Rediriger vers la page de détail du nouveau devis
                if (quoteId) {
                    router.push(paths.dashboard.quotes.detail(quoteId));
                } else {
                    // Fallback au cas où quoteId n'est pas retourné
                    router.push(paths.dashboard.quotes.list);
                }
            } else {
                toast.error(message || "Une erreur est survenue", {
                    description: "Veuillez réessayer.",
                });
            }
        },
        onError: (error) => {
            toast.error("Une erreur est survenue lors de la création du devis", {
                description: error || "Veuillez réessayer.",
            });
        }
    });

    // Fonction pour gérer l'annulation
    const handleCancel = () => {
        router.push(paths.dashboard.quotes.list);
    }

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (formData: any) => {
        // Préparer les items du devis avec leurs descriptions
        const quoteItems = formData.quoteItems.map((item: any, _index: number) => ({
            id: item.id,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            // Inclure la description si disponible
            description: formData.itemDescriptions?.[item.id] || ""
        }));

        // Envoyer les données complètes à la server action
        executeCreateQuote({
            clientId: formData.clientId,
            status: formData.status,
            validUntil: formData.validUntil,
            quoteItems: quoteItems
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
                <QuoteForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} clients={clients} products={products} />
            </motion.div>
        </div>
    )
}

