"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { containerVariants, itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"

interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordDialog({ open, onOpenChange }: PasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est requis"
    }

    if (!newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est requis"
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Dans une vraie application, vous enverriez les données au serveur ici
      console.log("Mot de passe mis à jour")

      // Réinitialiser les champs
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Fermer la boîte de dialogue
      onOpenChange(false)

      toast.success("Mot de passe mis à jour", {
        description: "Votre mot de passe a été modifié avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error)
      toast.error("Une erreur est survenue lors de la mise à jour du mot de passe.", {
        description: "Veuillez réessayer plus tard.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le mot de passe</DialogTitle>
              <DialogDescription>Entrez votre mot de passe actuel et votre nouveau mot de passe.</DialogDescription>
            </DialogHeader>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={errors.currentPassword ? "border-destructive" : ""}
                />
                {errors.currentPassword && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.currentPassword}
                  </motion.p>
                )}
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? "border-destructive" : ""}
                />
                {errors.newPassword && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.newPassword}
                  </motion.p>
                )}
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

