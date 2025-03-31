"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { containerVariants, fadeInVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import { type UserProfile, initialUserData } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/type"
import { PersonalInfoTab } from "@/components/profile/personal-info-tab"
import { CompanyInfoTab } from "@/components/profile/company-info-tab"
import { PasswordDialog } from "@/components/profile/password-dialog"

export default function ProfilePageClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [userData, setUserData] = useState<UserProfile>(initialUserData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("personal")
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Fonction pour mettre à jour les champs utilisateur
  const updateUserField = (field: keyof UserProfile, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Fonction pour mettre à jour les champs de l'entreprise
  const updateCompanyField = (field: keyof UserProfile["company"], value: any) => {
    setUserData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value,
      },
    }))
  }

  // Fonction pour mettre à jour les champs d'adresse
  const updateAddressField = (field: keyof UserProfile["company"]["address"], value: string) => {
    setUserData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        address: {
          ...prev.company.address,
          [field]: value,
        },
      },
    }))
  }

  // Validation du formulaire principal
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!userData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis"
    }

    if (!userData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis"
    }

    if (!userData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "L'email n'est pas valide"
    }

    if (!userData.company.name.trim()) {
      newErrors.companyName = "Le nom de l'entreprise est requis"
    }

    if (!userData.company.address.street.trim()) {
      newErrors.street = "L'adresse est requise"
    }

    if (!userData.company.address.city.trim()) {
      newErrors.city = "La ville est requise"
    }

    if (!userData.company.address.postalCode.trim()) {
      newErrors.postalCode = "Le code postal est requis"
    }

    if (!userData.company.address.country.trim()) {
      newErrors.country = "Le pays est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Gérer la soumission du formulaire principal
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
      console.log("Profil mis à jour:", userData)

      // Afficher l'animation de succès
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      toast.success("Profil mis à jour", {
        description: "Vos informations ont été enregistrées avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast.error("Une erreur est survenue lors de la mise à jour du profil.", {
        description: "Veuillez réessayer plus tard.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col space-y-8">
        {/* En-tête */}
        <motion.div className="flex flex-col space-y-2" variants={fadeInVariants}>
          <motion.h1
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Profil Utilisateur
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Gérez vos informations personnelles et les détails de votre entreprise.
          </motion.p>
        </motion.div>

        {/* Contenu principal */}
        <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab}>
          <motion.div variants={fadeInVariants}>
            <TabsList className="mb-6">
              <TabsTrigger value="personal" className="flex items-center">
                <span className="mr-2">👤</span>
                Personnel
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center">
                <span className="mr-2">🏢</span>
                Entreprise
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Onglets avec AnimatePresence pour les transitions */}
            <AnimatePresence mode="wait">
              {activeTab === "personal" && (
                <TabsContent value="personal" className="space-y-6">
                  <PersonalInfoTab
                    userData={userData}
                    errors={errors}
                    updateUserField={updateUserField}
                    onPasswordChange={() => setShowPasswordDialog(true)}
                  />
                </TabsContent>
              )}

              {activeTab === "company" && (
                <TabsContent value="company" className="space-y-6">
                  <CompanyInfoTab
                    userData={userData}
                    errors={errors}
                    updateCompanyField={updateCompanyField}
                    updateAddressField={updateAddressField}
                  />
                </TabsContent>
              )}
            </AnimatePresence>

            {/* Boutons d'action */}
            <motion.div className="flex justify-between mt-8" variants={fadeInVariants}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button type="submit" disabled={isLoading} className="relative overflow-hidden">
                  {saveSuccess ? (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Enregistré !
                    </motion.span>
                  ) : isLoading ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}

                  {saveSuccess && (
                    <motion.span
                      className="absolute inset-0 bg-success opacity-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </Tabs>
      </div>

      {/* Boîte de dialogue pour changer le mot de passe */}
      <PasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </motion.div>
  )
}

