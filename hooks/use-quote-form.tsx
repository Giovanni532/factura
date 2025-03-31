"use client"

import { useState } from "react"
import type { QuoteItem } from "@prisma/client"

export function useQuoteForm() {
    // État initial du formulaire
    const [formState, setFormState] = useState({
        clientId: "",
        status: "DRAFT",
        validUntil: null as Date | null,
        quoteItems: [
            {
                id: "",
                quoteId: "",
                itemId: "",
                quantity: 1,
                unitPrice: 0,
            },
        ] as QuoteItem[],
    })

    // État des erreurs
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Mettre à jour les informations générales
    const updateGeneralInfo = (field: string, value: any) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Effacer l'erreur pour ce champ
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // Ajouter une ligne de devis
    const addQuoteItem = () => {
        setFormState((prev) => ({
            ...prev,
            quoteItems: [
                ...prev.quoteItems,
                {
                    quoteId: "",
                    id: "",
                    itemId: "",
                    quantity: 1,
                    unitPrice: 0,
                },
            ],
        }))
    }

    // Mettre à jour une ligne de devis
    const updateQuoteItem = (index: number, field: string, value: any) => {
        setFormState((prev) => {
            const updatedItems = [...prev.quoteItems]
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            }
            return {
                ...prev,
                quoteItems: updatedItems,
            }
        })

        // Effacer l'erreur pour ce champ
        const errorKey = `quoteItems.${index}.${field}`
        if (errors[errorKey]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[errorKey]
                return newErrors
            })
        }
    }

    // Supprimer une ligne de devis
    const removeQuoteItem = (index: number) => {
        setFormState((prev) => {
            const updatedItems = [...prev.quoteItems]
            updatedItems.splice(index, 1)
            return {
                ...prev,
                quoteItems: updatedItems,
            }
        })

        // Effacer les erreurs pour cette ligne
        setErrors((prev) => {
            const newErrors = { ...prev }
            Object.keys(newErrors).forEach((key) => {
                if (key.startsWith(`quoteItems.${index}.`)) {
                    delete newErrors[key]
                }
            })
            return newErrors
        })
    }

    // Calculer le total
    const calculateTotal = () => {
        return formState.quoteItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    }

    // Valider le formulaire
    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Valider les informations générales
        if (!formState.clientId) {
            newErrors.clientId = "Veuillez sélectionner un client"
        }

        if (!formState.status) {
            newErrors.status = "Veuillez sélectionner un statut"
        }

        if (!formState.validUntil) {
            newErrors.validUntil = "Veuillez sélectionner une date de validité"
        }

        // Valider les lignes de devis
        formState.quoteItems.forEach((item, index) => {
            if (!item.itemId) {
                newErrors[`quoteItems.${index}.itemId`] = "Veuillez sélectionner un produit"
            }

            if (item.quantity <= 0) {
                newErrors[`quoteItems.${index}.quantity`] = "La quantité doit être supérieure à 0"
            }

            if (item.unitPrice <= 0) {
                newErrors[`quoteItems.${index}.unitPrice`] = "Le prix unitaire doit être supérieur à 0"
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return {
        formState,
        errors,
        updateGeneralInfo,
        addQuoteItem,
        updateQuoteItem,
        removeQuoteItem,
        validateForm,
        calculateTotal,
    }
}

