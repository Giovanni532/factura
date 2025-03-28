"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { resetPassword } from "@/lib/auth-client"
import { paths } from "@/paths"

export default function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token")
        setToken(tokenFromUrl)

        if (!tokenFromUrl) {
            setError("Lien de réinitialisation invalide ou expiré.")
        }
    }, [searchParams])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            setIsLoading(false)
            return
        }

        if (!token) {
            setError("Lien de réinitialisation invalide ou expiré.")
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await resetPassword({
                newPassword: formData.newPassword,
                token,
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
                setError(error.message || "Une erreur est survenue lors de la réinitialisation du mot de passe")
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la réinitialisation du mot de passe")
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

    const redirectToLogin = () => {
        router.push(paths.auth.signIn)
    }

    return (
        <div className="flex items-center justify-center min-h-[500px] p-4 w-96">
            <Card className="w-full max-w-md overflow-hidden">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {success ? "Mot de passe réinitialisé" : "Réinitialisation du mot de passe"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {success
                            ? "Votre mot de passe a été réinitialisé avec succès."
                            : "Créez un nouveau mot de passe pour votre compte"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!token && !success ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center justify-center space-y-4"
                        >
                            <motion.p variants={itemVariants} className="text-center text-red-500">
                                Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.
                            </motion.p>
                            <motion.div variants={itemVariants} className="pt-4 w-full">
                                <Link href={paths.auth.forgotPassword}>
                                    <Button
                                        className="w-full gap-2"
                                    >
                                        Demander un nouveau lien
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : success ? (
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
                                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                            </motion.p>
                            <motion.div variants={itemVariants} className="pt-4 w-full">
                                <Button
                                    className="w-full gap-2"
                                    onClick={redirectToLogin}
                                >
                                    Se connecter
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
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
                                            required
                                            minLength={8}
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
                                        disabled={
                                            isLoading ||
                                            !formData.newPassword ||
                                            !formData.confirmPassword ||
                                            formData.newPassword !== formData.confirmPassword
                                        }
                                    >
                                        {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
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