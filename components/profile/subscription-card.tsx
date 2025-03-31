"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cardVariants, itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import { type SubscriptionPlan, getSubscriptionBadgeVariant, getSubscriptionPlanLabel } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/type"
import { paths } from "@/paths"
import { useAuthStore } from "@/store/auth-store"

interface SubscriptionCardProps {
  plan: SubscriptionPlan
  status: "active" | "trialing" | "canceled" | "expired"
  renewDate: string
}

export function SubscriptionCard({ plan, status, renewDate }: SubscriptionCardProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Abonnement
          </CardTitle>
          <CardDescription>Détails de votre abonnement actuel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div className="flex items-center justify-between" variants={itemVariants}>
            <span className="text-sm font-medium">Plan actuel</span>
            <Badge variant={getSubscriptionBadgeVariant(plan)}>{getSubscriptionPlanLabel(plan)}</Badge>
          </motion.div>
          <motion.div className="flex items-center justify-between" variants={itemVariants}>
            <span className="text-sm font-medium">Statut</span>
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status === "active" ? "Actif" : "Inactif"}
            </Badge>
          </motion.div>
          <motion.div className="flex items-center justify-between" variants={itemVariants}>
            <span className="text-sm font-medium">Renouvellement</span>
            <span className="text-sm">{renewDate}</span>
          </motion.div>
          <Separator className="my-2" />
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(paths.dashboard.subscription.index(user?.id ?? ""))}
            >
              Gérer l'abonnement
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

