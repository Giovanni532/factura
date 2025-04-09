"use client"

import { motion } from "framer-motion"
import { TrendingDownIcon, TrendingUpIcon, AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon, AlertCircleIcon, BarChart4Icon, UsersIcon, FileTextIcon, CreditCardIcon } from "lucide-react"

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

  // Function to determine icon and color based on trend value
  const getTrendInfo = (trend: number, isInverse: boolean = false) => {
    const isPositive = isInverse ? trend <= 0 : trend >= 0;
    const icon = isPositive ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const sign = trend >= 0 ? '+' : '';

    return { icon, color, sign };
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6"
    >
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <BarChart4Icon className="size-4 text-primary" />
              <CardDescription>Revenus générés</CardDescription>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {formatCurrency(cards.revenue.total)}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              {cards.revenue.trend !== 0 && (
                <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${getTrendInfo(cards.revenue.trend).color}`}>
                  {getTrendInfo(cards.revenue.trend).icon}
                  {getTrendInfo(cards.revenue.trend).sign}{cards.revenue.trend}%
                </Badge>
              )}
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              {cards.revenue.trend >= 0 ? 'Hausse' : 'Baisse'} ce mois-ci
              {cards.revenue.trend >= 0 ? (
                <ArrowUpIcon className="size-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              Basé sur les factures payées
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4 text-primary" />
              <CardDescription>Nouveaux clients</CardDescription>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {cards.clients.total}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              {cards.clients.trend !== 0 && (
                <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${getTrendInfo(cards.clients.trend).color}`}>
                  {getTrendInfo(cards.clients.trend).icon}
                  {getTrendInfo(cards.clients.trend).sign}{cards.clients.trend}%
                </Badge>
              )}
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              {cards.clients.trend >= 0 ? 'En hausse' : 'En baisse'} ce mois-ci
              {cards.clients.trend >= 0 ? (
                <ArrowUpIcon className="size-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              {cards.clients.trend >= 0 ? 'Plus de' : 'Moins de'} nouveaux clients enregistrés
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-primary" />
              <CardDescription>Devis envoyés</CardDescription>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {cards.quotes.total}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              {cards.quotes.trend !== 0 && (
                <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${getTrendInfo(cards.quotes.trend).color}`}>
                  {getTrendInfo(cards.quotes.trend).icon}
                  {getTrendInfo(cards.quotes.trend).sign}{cards.quotes.trend}%
                </Badge>
              )}
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              Activité {cards.quotes.trend >= 0 ? 'en hausse' : 'en baisse'}
              {cards.quotes.trend >= 0 ? (
                <ArrowUpIcon className="size-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="size-4 text-red-500" />
              )}
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              {cards.quotes.trend >= 0 ? 'Plus' : 'Moins'} de demandes enregistrées
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="size-4 text-primary" />
              <CardDescription>Factures impayées</CardDescription>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {formatCurrency(cards.unpaidInvoices.total)}
              </CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              {cards.unpaidInvoices.trend !== 0 && (
                <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${getTrendInfo(cards.unpaidInvoices.trend, true).color}`}>
                  {getTrendInfo(cards.unpaidInvoices.trend, true).icon}
                  {getTrendInfo(cards.unpaidInvoices.trend, true).sign}{cards.unpaidInvoices.trend}%
                </Badge>
              )}
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              {cards.unpaidInvoices.trend > 0 ? (
                <div className="flex items-center gap-1.5">
                  <AlertCircleIcon className="size-4 text-red-500" />
                  <span>Suivi recommandé</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Bonne évolution</span>
                  <ArrowDownIcon className="size-4 text-green-500" />
                </div>
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
