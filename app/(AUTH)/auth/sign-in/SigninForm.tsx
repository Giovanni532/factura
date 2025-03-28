"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { paths } from "@/paths"
import { useAuthStore } from "@/store/auth-store"
import { sendVerificationEmail } from "@/lib/auth-client"

export default function SignInForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
    const [sendingVerification, setSendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const { login, checkAuth } = useAuthStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSendVerification = async () => {
        setSendingVerification(true);
        try {
            await sendVerificationEmail({
                email: formData.email,
                callbackURL: paths.dashboard.home,
            }, {
                onRequest: () => {
                    setSendingVerification(true);
                },
                onSuccess: () => {
                    setVerificationSent(true);
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                    setShowVerificationPrompt(false);
                },
            });
        } catch (err) {
            setError("Une erreur est survenue lors de l'envoi de l'email de vérification");
            setShowVerificationPrompt(false);
        } finally {
            setSendingVerification(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setShowVerificationPrompt(false)

        try {
            const { data, error } = await login({
                email: formData.email,
                password: formData.password,
                callbackURL: paths.dashboard.home,
            }, {
                onRequest: () => {
                    setIsLoading(true);
                },
                onSuccess: async () => {
                    // Update auth store with new session data
                    await checkAuth();
                    router.push(paths.dashboard.home);
                },
                onError: (ctx) => {
                    // Vérifier si l'erreur est liée à la vérification de l'email
                    if (ctx.error.status === 403 && ctx.error.message.includes("verify")) {
                        setShowVerificationPrompt(true);
                    } else {
                        setError(ctx.error.message);
                    }
                },
            });

            if (error) {
                // Vérifier si l'erreur est liée à la vérification de l'email
                if (error.status === 403 && error.message && error.message.includes("verify")) {
                    setShowVerificationPrompt(true);
                } else {
                    setError(error.message || "Une erreur est survenue lors de la connexion");
                }
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la connexion");
        } finally {
            setIsLoading(false);
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
                    <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                    <CardDescription className="text-center">Entrez vos identifiants pour vous connecter</CardDescription>
                </CardHeader>
                <CardContent>
                    {showVerificationPrompt ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {verificationSent ? (
                                <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
                                    <CheckCircleIcon className="h-16 w-16 text-green-500" />
                                    <p className="text-center">
                                        Un email de vérification a été envoyé à <strong>{formData.email}</strong>.
                                        Veuillez vérifier votre boîte de réception et suivre les instructions.
                                    </p>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            setShowVerificationPrompt(false);
                                            setVerificationSent(false);
                                        }}
                                    >
                                        Retour à la connexion
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div variants={itemVariants} className="space-y-4">
                                    <p className="text-center">
                                        Vous devez vérifier votre adresse email avant de pouvoir vous connecter.
                                        Souhaitez-vous recevoir un nouvel email de vérification ?
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            onClick={handleSendVerification}
                                            disabled={sendingVerification}
                                            className="w-full"
                                        >
                                            {sendingVerification ? "Envoi en cours..." : "Envoyer l'email de vérification"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowVerificationPrompt(false)}
                                            className="w-full"
                                        >
                                            Retour à la connexion
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="jean.dupont@exemple.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
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
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex justify-end">
                                    <Link href={paths.auth.forgotPassword} className="text-sm text-primary hover:underline">
                                        Mot de passe oublié ?
                                    </Link>
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
                                        disabled={isLoading || !formData.email || !formData.password}
                                    >
                                        {isLoading ? "Connexion en cours..." : "Se connecter"}
                                        {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                                    </Button>
                                </motion.div>

                                {error && <motion.div variants={itemVariants} className="mt-4 text-center text-sm text-red-500">{error}</motion.div>}

                                <div className="mt-4 text-center text-sm">
                                    Vous n'avez pas de compte ?{" "}
                                    <Link href={paths.auth.signUp} className="text-primary hover:underline">
                                        S'inscrire
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

