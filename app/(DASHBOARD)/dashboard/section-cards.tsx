"use client"

import { motion } from "framer-motion"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/types/dashboard"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.6,
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
}

interface SectionCardsProps {
  data: DashboardData;
}

export function SectionCards({ data }: SectionCardsProps) {
  const { cards } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6"
    >
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden">
          <CardHeader className="relative">
            <CardDescription>Revenus générés</CardDescription>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {formatCurrency(cards.revenue.total)}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${cards.revenue.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {cards.revenue.trend >= 0 ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {cards.revenue.trend >= 0 ? '+' : ''}{cards.revenue.trend}%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              {cards.revenue.trend >= 0 ? 'Hausse' : 'Baisse'} ce mois-ci
              {cards.revenue.trend >= 0 ? (
                <TrendingUpIcon className="size-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              Basé sur les factures payées
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden">
          <CardHeader className="relative">
            <CardDescription>Nouveaux clients</CardDescription>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {cards.clients.total}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${cards.clients.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {cards.clients.trend >= 0 ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {cards.clients.trend >= 0 ? '+' : ''}{cards.clients.trend}%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              {cards.clients.trend >= 0 ? 'En hausse' : 'En baisse'} ce mois-ci
              {cards.clients.trend >= 0 ? (
                <TrendingUpIcon className="size-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              {cards.clients.trend >= 0 ? 'Plus de' : 'Moins de'} nouveaux clients enregistrés
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden">
          <CardHeader className="relative">
            <CardDescription>Devis envoyés</CardDescription>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {cards.quotes.total}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${cards.quotes.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {cards.quotes.trend >= 0 ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {cards.quotes.trend >= 0 ? '+' : ''}{cards.quotes.trend}%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              Activité {cards.quotes.trend >= 0 ? 'en hausse' : 'en baisse'}
              {cards.quotes.trend >= 0 ? (
                <TrendingUpIcon className="size-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              {cards.quotes.trend >= 0 ? 'Plus' : 'Moins'} de demandes enregistrées
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden">
          <CardHeader className="relative">
            <CardDescription>Factures impayées</CardDescription>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {formatCurrency(cards.unpaidInvoices.total)}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${cards.unpaidInvoices.trend <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {cards.unpaidInvoices.trend <= 0 ? (
                  <TrendingDownIcon className="size-3" />
                ) : (
                  <TrendingUpIcon className="size-3" />
                )}
                {cards.unpaidInvoices.trend >= 0 ? '+' : ''}{cards.unpaidInvoices.trend}%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              {cards.unpaidInvoices.trend > 0 ? 'Suivi recommandé' : 'Bonne évolution'}
              {cards.unpaidInvoices.trend <= 0 ? (
                <TrendingDownIcon className="size-4 text-green-500" />
              ) : (
                <TrendingUpIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              Paiements en attente à relancer
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
