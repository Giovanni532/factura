"use client"

import Image from "next/image"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cardVariants, itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"

interface CompanyPreviewProps {
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

export function CompanyPreview({ name, logo, address, siret, vatNumber }: CompanyPreviewProps) {
  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
          <CardDescription>Voici comment vos informations apparaîtront sur vos documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <motion.div
              className="relative h-12 w-12 overflow-hidden rounded-md border"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Image src={logo || "/placeholder.svg"} alt="Company logo" fill className="object-cover" />
            </motion.div>
            <div>
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.country}
              </p>
            </div>
          </motion.div>

          <Separator />

          <motion.div className="space-y-1 text-sm" variants={itemVariants}>
            <p>{address.street}</p>
            <p>
              {address.postalCode} {address.city}
            </p>
            <p>{address.country}</p>
          </motion.div>

          {(siret || vatNumber) && (
            <>
              <Separator />
              <motion.div className="space-y-1 text-sm" variants={itemVariants}>
                {siret && <p>SIRET: {siret}</p>}
                {vatNumber && <p>TVA: {vatNumber}</p>}
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

