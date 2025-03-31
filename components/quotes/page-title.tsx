"use client"

import { motion } from "framer-motion"

interface PageTitleProps {
  title: string
  description: string
}

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <motion.div
      className="flex flex-col space-y-2"
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

