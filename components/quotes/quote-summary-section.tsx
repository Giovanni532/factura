"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface QuoteSummarySectionProps {
  total: number
}

export function QuoteSummarySection({ total }: QuoteSummarySectionProps) {
  // Fonction pour formater le prix
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Animation pour la carte
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
  }

  // Animation pour le total
  const totalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  }

  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
          <CardDescription>Récapitulatif des montants du devis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA (20%)</span>
              <span>{formatCurrency(total * 0.2)}</span>
            </div>
            <Separator />
            <motion.div className="flex justify-between font-medium text-lg" variants={totalVariants}>
              <span>Total TTC</span>
              <span>{formatCurrency(total * 1.2)}</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

