"use client"

import { motion } from "framer-motion"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

export function SectionCards() {
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
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">12 500 €</CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                +12.5%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              Hausse ce mois-ci <TrendingUpIcon className="size-4" />
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
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">32</CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingDownIcon className="size-3" />
                -8%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              En baisse ce mois-ci <TrendingDownIcon className="size-4" />
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              Moins de demandes de devis reçues
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden">
          <CardHeader className="relative">
            <CardDescription>Devis envoyés</CardDescription>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">84</CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                +18%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              Activité en hausse <TrendingUpIcon className="size-4" />
            </motion.div>
            <motion.div className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.3 }}>
              Plus de demandes enregistrées
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <motion.div variants={item}>
        <Card className="@container/card overflow-hidden">
          <CardHeader className="relative">
            <CardDescription>Factures impayées</CardDescription>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">3 750 €</CardTitle>
            </motion.div>
            <motion.div className="absolute right-4 top-4" variants={badgeVariants}>
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                +5%
              </Badge>
            </motion.div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <motion.div className="line-clamp-1 flex gap-2 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>
              Suivi recommandé <TrendingUpIcon className="size-4" />
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
