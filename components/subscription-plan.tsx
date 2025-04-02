"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// Types pour les plans
interface PlanFeature {
    name: string
    included: boolean | string | number
    highlight?: boolean
}

interface Plan {
    id: string
    name: string
    description: string
    price: {
        monthly: number
        yearly: number
    }
    features: PlanFeature[]
    recommended?: boolean
    popular?: boolean
}

interface SubscriptionPlansProps {
    currentPlan: string
}

export function SubscriptionPlans({ currentPlan }: SubscriptionPlansProps) {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

    const handlePlanSelection = (plan: Plan) => {
        setSelectedPlan(plan)
    }

    // Données des plans
    const plans: Plan[] = [
        {
            id: "free",
            name: "Gratuit",
            description: "Pour les indépendants qui débutent",
            price: {
                monthly: 0,
                yearly: 0,
            },
            features: [
                { name: "Jusqu'à 10 devis et factures par mois", included: true },
                { name: "Jusqu'à 5 clients", included: true },
                { name: "1 utilisateur", included: true },
                { name: "Modèles de base", included: true },
                { name: "Assistance par email", included: true },
                { name: "Fonctionnalités IA", included: false },
                { name: "Personnalisation avancée", included: false },
                { name: "Intégrations", included: false },
            ],
        },
        {
            id: "pro",
            name: "Pro",
            description: "Pour les petites entreprises en croissance",
            price: {
                monthly: 29.99,
                yearly: 299.99,
            },
            recommended: true,
            popular: true,
            features: [
                { name: "Jusqu'à 100 devis et factures par mois", included: true, highlight: true },
                { name: "Clients illimités", included: true, highlight: true },
                { name: "Jusqu'à 3 utilisateurs", included: true },
                { name: "Modèles personnalisables", included: true },
                { name: "Assistance prioritaire", included: true },
                { name: "50 requêtes IA par mois", included: true, highlight: true },
                { name: "Personnalisation avancée", included: true },
                { name: "Intégrations de base", included: true },
            ],
        },
        {
            id: "business",
            name: "Business",
            description: "Pour les entreprises établies",
            price: {
                monthly: 79.99,
                yearly: 799.99,
            },
            features: [
                { name: "Devis et factures illimités", included: true },
                { name: "Clients illimités", included: true },
                { name: "Utilisateurs illimités", included: true, highlight: true },
                { name: "Modèles entièrement personnalisables", included: true },
                { name: "Assistance dédiée 24/7", included: true, highlight: true },
                { name: "Requêtes IA illimitées", included: true, highlight: true },
                { name: "Personnalisation avancée", included: true },
                { name: "Intégrations avancées", included: true },
            ],
        },
    ]

    // Fonction pour formater le prix
    const formatPrice = (price: number) => {
        if (price === 0) return "Gratuit"
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
        }).format(price)
    }

    // Animation pour le conteneur
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    // Animation pour les cartes
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        },
        hover: {
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 },
        },
    }

    return (
        <div className="space-y-8">
            {/* Toggle pour le cycle de facturation */}
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                    <span className={cn("text-sm", billingCycle === "monthly" ? "font-medium" : "text-muted-foreground")}>
                        Mensuel
                    </span>
                    <Switch
                        checked={billingCycle === "yearly"}
                        onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                    />
                    <span className={cn("text-sm", billingCycle === "yearly" ? "font-medium" : "text-muted-foreground")}>
                        Annuel
                    </span>
                    {billingCycle === "yearly" && (
                        <Badge
                            variant="outline"
                            className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                        >
                            Économisez 17%
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    {billingCycle === "yearly"
                        ? "Économisez en payant annuellement"
                        : "Passez à la facturation annuelle pour économiser"}
                </p>
            </div>

            {/* Grille des plans */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        variants={cardVariants}
                        whileHover={plan.id !== currentPlan ? "hover" : undefined}
                        className="flex"
                    >
                        <Card
                            className={cn(
                                "flex flex-col w-full relative",
                                plan.id === currentPlan && "border-primary shadow-md shadow-primary/20 dark:shadow-primary/10",
                            )}
                        >
                            {/* Badges */}
                            {(plan.recommended || plan.popular || plan.id === currentPlan) && (
                                <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-1/2 gap-2">
                                    {plan.recommended && <Badge className="bg-primary hover:bg-primary">Recommandé</Badge>}
                                    {plan.popular && <Badge variant="secondary">Populaire</Badge>}
                                    {plan.id === currentPlan && (
                                        <Badge variant="outline" className="border-primary text-primary bg-background">
                                            Plan actuel
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <CardHeader
                                className={cn("pb-2", (plan.recommended || plan.popular || plan.id === currentPlan) && "pt-6")}
                            >
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-grow">
                                <div className="mb-6">
                                    <div className="flex items-baseline">
                                        <span className="text-3xl font-bold">
                                            {formatPrice(billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly)}
                                        </span>
                                        {plan.price.monthly > 0 && (
                                            <span className="text-sm text-muted-foreground ml-1">
                                                /{billingCycle === "monthly" ? "mois" : "an"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check
                                                className={cn(
                                                    "h-5 w-5 mr-2 mt-0.5",
                                                    typeof feature.included === "boolean" && !feature.included
                                                        ? "text-muted-foreground"
                                                        : "text-green-500 dark:text-green-400",
                                                )}
                                            />
                                            <span className={cn(feature.highlight && "font-medium text-primary")}>{feature.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-6">
                                <Button
                                    className="w-full"
                                    variant={plan.id === currentPlan ? "outline" : "default"}
                                    onClick={() => handlePlanSelection(plan)}
                                    disabled={plan.id === currentPlan}
                                >
                                    {plan.id === currentPlan ? "Votre plan actuel" : "Choisir ce plan"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

