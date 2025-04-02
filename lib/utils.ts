import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  business: {
    id: string
    name: string
    address: string | null
    city: string | null
    postalCode: string | null
    country: string | null
    logo?: string
    logoUrl: string | null
    taxId: string | null
    userId: string
    siret?: string
    vatNumber?: string
    createdAt: Date
    updatedAt: Date
  }
  subscription: {
    id: string
    status: string
    currentPeriodEnd: Date
    plan: string
    renewDate?: string
  }
}

// Format a number as currency (EUR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};


// Types pour le profil utilisateur
export type SubscriptionPlan = "free" | "starter" | "professional" | "enterprise"

// Fonctions utilitaires pour les badges et labels
export function getSubscriptionBadgeVariant(plan: SubscriptionPlan) {
  switch (plan) {
    case "free":
      return "secondary"
    case "starter":
      return "default"
    case "professional":
      return "default"
    case "enterprise":
      return "default"
    default:
      return "secondary"
  }
}

export function getSubscriptionPlanLabel(plan: SubscriptionPlan) {
  switch (plan) {
    case "free":
      return "Gratuit"
    case "starter":
      return "Démarrage"
    case "professional":
      return "Professionnel"
    case "enterprise":
      return "Entreprise"
    default:
      return plan
  }
}