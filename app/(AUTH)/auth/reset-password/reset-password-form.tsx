"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, ArrowRightIcon, CheckCircleIcon, AlertCircleIcon, ArrowLeftIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  })
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "text-muted-foreground",
    tips: "",
    isValid: false,
  })

  useEffect(() => {
    // Vérifier si le token est valide
    if (!token) {
      setIsValidToken(false)
    }
  }, [token])

  const checkPasswordStrength = (password: string) => {
    // Critères de validation
    const lengthValid = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

    // Calcul du score
    let score = 0
    if (lengthValid) score += 1
    if (hasUpperCase) score += 1
    if (hasLowerCase) score += 1
    if (hasNumbers) score += 1
    if (hasSpecialChars) score += 1

    // Détermination du message et de la couleur
    let message = ""
    let color = ""

    if (password === "") {
      message = ""
      color = "text-muted-foreground"
    } else if (score <= 2) {
      message = "Faible"
      color = "text-red-500"
    } else if (score <= 4) {
      message = "Moyen"
      color = "text-yellow-500"
    } else {
      message = "Fort"
      color = "text-green-500"
    }

    // Générer les conseils pour améliorer le mot de passe
    const missingCriteria = []
    if (!lengthValid) missingCriteria.push("8 caractères minimum")
    if (!hasUpperCase) missingCriteria.push("une majuscule")
    if (!hasLowerCase) missingCriteria.push("une minuscule")
    if (!hasNumbers) missingCriteria.push("un chiffre")
    if (!hasSpecialChars) missingCriteria.push("un caractère spécial")

    let tips = ""
    if (missingCriteria.length > 0) {
      tips = `Ajoutez ${missingCriteria.join(", ")}`
    }

    return { score, message, color, tips, isValid: score >= 3 }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Réinitialiser les erreurs
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }))

    // Vérifier la force du mot de passe si c'est le champ password qui change
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const validateForm = () => {
    const newErrors = {
      password: "",
      confirmPassword: "",
      general: "",
    }

    let isValid = true

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
      isValid = false
    } else if (!passwordStrength.isValid) {
      newErrors.password = "Le mot de passe n'est pas assez fort"
      isValid = false
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe"
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) {
      return
    }

    setIsLoading(true)

    try {
      // Utiliser l'API Better Auth pour réinitialiser le mot de passe
      const { error } = await authClient.resetPassword({
        token,
        newPassword: formData.password,
      })

      if (error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Une erreur est survenue lors de la réinitialisation du mot de passe"
        }))
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error resetting password:", err)
      setErrors((prev) => ({
        ...prev,
        general: "Une erreur est survenue lors de la réinitialisation du mot de passe"
      }))
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-full bg-red-100 dark:bg-red-900/30 p-3"
            >
              <AlertCircleIcon className="w-12 h-12 text-red-500" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Lien invalide
            </motion.h2>
            <motion.p
              className="text-center text-muted-foreground max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full pt-4"
            >
              <Button asChild className="w-full">
                <Link href="/auth/forget-password">Demander un nouveau lien</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-[500px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="rounded-full bg-green-100 dark:bg-green-900/30 p-3"
            >
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Mot de passe réinitialisé !
            </motion.h2>
            <motion.p
              className="text-center text-muted-foreground max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre
              nouveau mot de passe.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-full pt-4"
            >
              <Button asChild className="w-full">
                <Link href="/auth/sign-in">Se connecter</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Réinitialiser le mot de passe</CardTitle>
          <CardDescription className="text-center">Créez un nouveau mot de passe pour votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {errors.general && (
                <motion.div variants={itemVariants}>
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500 pr-10" : ""}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

                {formData.password && (
                  <motion.div
                    className="space-y-1 text-sm mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={passwordStrength.color}>{passwordStrength.message}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <motion.div
                            key={index}
                            className={`h-1 w-5 rounded-full ${
                              index <= passwordStrength.score
                                ? passwordStrength.color.replace("text-", "bg-")
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: "1.25rem" }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          />
                        ))}
                      </div>
                    </div>
                    {passwordStrength.tips && <p className="text-muted-foreground text-xs">{passwordStrength.tips}</p>}
                  </motion.div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "border-red-500 pr-10" : ""}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="pt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading || !formData.password || !formData.confirmPassword || passwordStrength.score < 3}
                >
                  {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                  {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                </Button>
              </motion.div>

              {formData.password !== "" && passwordStrength.score < 3 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Améliorez la force de votre mot de passe pour continuer
                </p>
              )}

              <div className="mt-4 text-center text-sm">
                <Link href="/auth/sign-in" className="text-primary hover:underline inline-flex items-center">
                  <ArrowLeftIcon className="mr-1 h-3 w-3" />
                  Retour à la connexion
                </Link>
              </div>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

