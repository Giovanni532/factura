"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightIcon, CheckCircleIcon, ArrowLeftIcon, MailIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { paths } from "@/paths"

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Veuillez entrer une adresse email valide")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error: errorAuthClient } = await authClient.forgetPassword({
        email: email,
        redirectTo: paths.auth.resetPassword,
      })
      
      // Si l'erreur est liée à un utilisateur non trouvé, on ne l'affiche pas à l'utilisateur
      // pour des raisons de sécurité
      if (errorAuthClient && errorAuthClient.message && 
          !errorAuthClient.message.toLowerCase().includes("not found")) {
        setError(errorAuthClient.message || "Une erreur est survenue lors de l'envoi de l'email")
        setIsLoading(false)
        return
      }

      // Même si l'utilisateur n'existe pas, on montre un message de succès
      // pour éviter l'énumération des utilisateurs
      setIsLoading(false)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error sending forget password request:", err)
      setError("Une erreur est survenue lors de l'envoi de l'email")
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
              Email envoyé !
            </motion.h2>
            <motion.p
              className="text-center text-muted-foreground max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Si un compte existe avec l'adresse {email}, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-full pt-4"
            >
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sign-in">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4 w-96">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
          <CardDescription className="text-center">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} >
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@exemple.com"
                    value={email}
                    onChange={handleChange}
                    className={error ? "border-red-500 pr-10" : ""}
                    required
                  />
                  <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="pt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full gap-2" disabled={isLoading || !email}>
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                  {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                </Button>
              </motion.div>

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

