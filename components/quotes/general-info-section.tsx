"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Client } from "@prisma/client"

interface GeneralInfoSectionProps {
  formState: any
  errors: Record<string, string>
  onChange: (field: string, value: any) => void
  clients: Client[]
}

export function GeneralInfoSection({ formState, errors, onChange, clients }: GeneralInfoSectionProps) {
  const [date, setDate] = useState<Date | undefined>(formState.validUntil ? new Date(formState.validUntil) : undefined)

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    onChange("validUntil", date)
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

  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Sélectionnez le client, le statut et la date de validité du devis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sélection du client */}
            <div className="space-y-2">
              <Label htmlFor="client">
                Client <span className="text-destructive">*</span>
              </Label>
              <Select value={formState.clientId} onValueChange={(value) => onChange("clientId", value)}>
                <SelectTrigger id="client" className={errors.clientId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-sm font-medium text-destructive">{errors.clientId}</p>}
            </div>

            {/* Sélection du statut */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Statut <span className="text-destructive">*</span>
              </Label>
              <Select value={formState.status} onValueChange={(value) => onChange("status", value)}>
                <SelectTrigger id="status" className={errors.status ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SENT">Envoyé</SelectItem>
                  <SelectItem value="ACCEPTED">Accepté</SelectItem>
                  <SelectItem value="REJECTED">Refusé</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm font-medium text-destructive">{errors.status}</p>}
            </div>

            {/* Sélection de la date de validité */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">
                Date de validité <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="validUntil"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.validUntil && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus locale={fr} />
                </PopoverContent>
              </Popover>
              {errors.validUntil && <p className="text-sm font-medium text-destructive">{errors.validUntil}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

