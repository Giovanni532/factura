"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GeneralInfoSection } from "./general-info-section"
import { QuoteItemsSection } from "./quote-items-section"
import { QuoteSummarySection } from "./quote-summary-section"
import { useQuoteForm } from "@/hooks/use-quote-form"

interface QuoteFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function QuoteForm({ onSubmit, onCancel, isSubmitting }: QuoteFormProps) {
  const {
    formState,
    errors,
    updateGeneralInfo,
    addQuoteItem,
    updateQuoteItem,
    removeQuoteItem,
    validateForm,
    calculateTotal,
  } = useQuoteForm()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formState)
    }
  }

  // Animation pour le conteneur du formulaire
  const formVariants = {
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
    <motion.form onSubmit={handleSubmit} variants={formVariants}>
      <div className="space-y-8">
        {/* Section des informations générales */}
        <GeneralInfoSection formState={formState} errors={errors} onChange={updateGeneralInfo} />

        {/* Section des lignes de devis */}
        <QuoteItemsSection
          items={formState.quoteItems}
          errors={errors}
          onAdd={addQuoteItem}
          onUpdate={updateQuoteItem}
          onRemove={removeQuoteItem}
        />

        {/* Section du résumé */}
        <QuoteSummarySection total={calculateTotal()} />

        {/* Actions du formulaire */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer le devis
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

