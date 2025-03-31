// Types pour le profil utilisateur
export type SubscriptionPlan = "free" | "starter" | "professional" | "enterprise"

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string
  company: {
    name: string
    logo: string
    address: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    siret?: string
    vatNumber?: string
  }
  subscription: {
    plan: SubscriptionPlan
    status: "active" | "trialing" | "canceled" | "expired"
    renewDate: string
  }
}

// Données de démonstration
export const initialUserData: UserProfile = {
  id: "1",
  firstName: "Thomas",
  lastName: "Dubois",
  email: "thomas.dubois@example.com",
  avatar: "/placeholder.svg?height=300&width=300",
  company: {
    name: "Dubois Consulting",
    logo: "/placeholder.svg?height=300&width=300",
    address: {
      street: "123 Rue de la Paix",
      city: "Paris",
      postalCode: "75001",
      country: "France",
    },
    siret: "123 456 789 00012",
    vatNumber: "FR 12 345678901",
  },
  subscription: {
    plan: "professional",
    status: "active",
    renewDate: "2024-12-31",
  },
}

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