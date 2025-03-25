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

export default function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    })
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: "",
        color: "text-muted-foreground",
        tips: "",
        isValid: false,
    })

    const { register, checkAuth } = useAuthStore();

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

        // Vérifier la force du mot de passe si c'est le champ password qui change
        if (name === "password") {
            setPasswordStrength(checkPasswordStrength(value))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await register({
                email: formData.email,
                password: formData.password,
                name: `${formData.firstName} ${formData.lastName}`,
                image: undefined,
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
                    setError(ctx.error.message);
                },
            });

            if (error) {
                setError(error.message || "An unexpected error occurred");
            }
        } catch (err) {
            setError("An unexpected error occurred");
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
        <div className="flex items-center justify-center min-h-[500px] p-4">
            <Card className="w-full max-w-md overflow-hidden">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
                    <CardDescription className="text-center">Entrez vos informations pour vous inscrire</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Prénom</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Jean"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nom</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Dupont"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

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
                                                        className={`h-1 w-5 rounded-full ${index <= passwordStrength.score
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
                            {error && (
                                <motion.div
                                    variants={itemVariants}
                                    className="text-xs text-red-500 text-center mt-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {error}
                                </motion.div>
                            )}
                            <motion.div
                                variants={itemVariants}
                                className="pt-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={formData.password === "" || passwordStrength.score < 3}
                                >
                                    {isLoading ? "Inscription en cours..." : "S'inscrire"}
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            {formData.password !== "" && passwordStrength.score < 3 && (
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Améliorez la force de votre mot de passe pour continuer
                                </p>
                            )}

                            <div className="mt-4 text-center text-sm">
                                Vous avez déjà un compte ?{" "}
                                <Link href={paths.auth.signIn} className="text-primary hover:underline">
                                    Se connecter
                                </Link>
                            </div>
                        </motion.div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

