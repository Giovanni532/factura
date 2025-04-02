"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { containerVariants, fadeInVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import { PersonalInfoTab } from "@/components/profile/personal-info-tab"
import { CompanyInfoTab } from "@/components/profile/company-info-tab"
import { PasswordDialog } from "@/components/profile/password-dialog"
import { UserProfile } from "@/lib/utils"

export default function ProfilePageClient({ user }: { user: UserProfile }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const [userData, setUserData] = useState<UserProfile>(user)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("personal")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setUserData(user)
  }, [user])

  const updateUserField = (field: keyof UserProfile, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateCompanyField = (field: keyof UserProfile["business"], value: any) => {
    setUserData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value,
      },
    }))
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
              <TabsTrigger value="business" className="flex items-center">
                <span className="mr-2">🏢</span>
                Entreprise
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <div>
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

              {activeTab === "business" && (
                <TabsContent value="business" className="space-y-6">
                  <CompanyInfoTab
                    userData={userData}
                    errors={errors}
                    updateCompanyField={updateCompanyField}
                  />
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      {/* Boîte de dialogue pour changer le mot de passe */}
      <PasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </motion.div>
  )
}

