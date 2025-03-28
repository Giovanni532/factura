"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon } from "lucide-react"
import { forgetPassword } from "@/lib/auth-client"
import { paths } from "@/paths"

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        
        try {
            const { data, error } = await forgetPassword({
                email,
                redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${paths.auth.resetPassword}`,
            }, {
                onRequest: () => {
                    setIsLoading(true)
                },
                onSuccess: () => {
                    setSuccess(true)
                },
                onError: (ctx) => {
                    setError(ctx.error.message)
                },
            })

            if (error) {
                setError(error.message || "Une erreur est survenue lors de l'envoi de l'email")
            }
        } catch (err) {
            setError("Une erreur est survenue lors de l'envoi de l'email")
        } finally {
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

    return (
        <div className="flex items-center justify-center min-h-[500px] p-4 w-96">
            <Card className="w-full max-w-md overflow-hidden">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
                    <CardDescription className="text-center">
                        {success
                            ? "Un email de récupération a été envoyé. Vérifiez votre boîte de réception."
                            : "Entrez votre adresse email pour recevoir un lien de récupération"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center justify-center space-y-4"
                        >
                            <motion.div variants={itemVariants} className="text-green-500">
                                <CheckCircleIcon className="w-16 h-16" />
                            </motion.div>
                            <motion.p variants={itemVariants} className="text-center">
                                Un email avec un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                                Veuillez vérifier votre boîte de réception et suivre les instructions.
                            </motion.p>
                            <motion.div variants={itemVariants} className="pt-4 w-full">
                                <Link href={paths.auth.signIn}>
                                    <Button
                                        className="w-full gap-2"
                                        variant="outline"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        Retour à la connexion
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jean.dupont@exemple.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
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
                                        disabled={isLoading || !email}
                                    >
                                        {isLoading ? "Envoi en cours..." : "Envoyer le lien de récupération"}
                                        {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                                    </Button>
                                </motion.div>

                                {error && <motion.div variants={itemVariants} className="mt-4 text-center text-sm text-red-500">{error}</motion.div>}

                                <div className="mt-4 text-center text-sm">
                                    <Link href={paths.auth.signIn} className="text-primary hover:underline">
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </motion.div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 