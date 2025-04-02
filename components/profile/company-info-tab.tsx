"use client"

import { motion } from "framer-motion"
import { Building2, MapPin } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { containerVariants, cardVariants, itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import { ImageUploader } from "@/components/profile/image-uploader"
import { CompanyPreview } from "@/components/profile/company-preview"
import { UserProfile } from "@/lib/utils"
import { updateBusinessInfo } from "@/actions/user"
import { useAction } from "@/hooks/use-action"

interface CompanyInfoTabProps {
  userData: UserProfile
  errors: Record<string, string>
  updateCompanyField: (field: keyof UserProfile["business"], value: any) => void
}

export function CompanyInfoTab({ userData, errors, updateCompanyField }: CompanyInfoTabProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  // Parse address components for the UI
  const addressParts = userData.business.address?.split(',') || ['']
  const street = addressParts[0] || ''

  // Create address object for CompanyPreview
  const addressObj = {
    street: street,
    city: userData.business.city || '',
    postalCode: userData.business.postalCode || '',
    country: userData.business.country || ''
  }

  // Utilisation de useAction pour la mise à jour des informations de l'entreprise
  const { execute: executeBusinessUpdate, isLoading } = useAction(updateBusinessInfo, {
    onSuccess: (result) => {
      if (result?.data?.success) {
        toast.success("Informations de l'entreprise mises à jour !", {
          description: "Vos modifications ont été enregistrées avec succès.",
        })
      }
      setIsUpdating(false)
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour", {
        description: error,
      })
      setIsUpdating(false)
    }
  })

  // Gestion de la soumission du formulaire des informations de l'entreprise
  const handleBusinessSubmit = async () => {
    // Assembler l'adresse complète à partir de la rue
    const fullAddress = street

    setIsUpdating(true)
    await executeBusinessUpdate({
      name: userData.business.name,
      address: fullAddress,
      city: userData.business.city,
      postalCode: userData.business.postalCode,
      country: userData.business.country,
      logoUrl: userData.business.logoUrl,
      taxId: userData.business.taxId,
      vatNumber: userData.business.vatNumber
    })
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* Informations de l'entreprise */}
      <motion.div className="lg:col-span-2" variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Informations de l'entreprise
            </CardTitle>
            <CardDescription>Ces informations apparaîtront sur vos devis et factures.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nom de l'entreprise */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={userData.business.name || ''}
                onChange={(e) => updateCompanyField("name", e.target.value)}
                className={errors.companyName ? "border-destructive" : ""}
              />
              {errors.companyName && (
                <motion.p
                  className="text-sm font-medium text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.companyName}
                </motion.p>
              )}
            </motion.div>

            {/* Adresse */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label>Adresse</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-sm">
                  Rue
                </Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => updateCompanyField("address", e.target.value)}
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.street}
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">
                    Ville
                  </Label>
                  <Input
                    id="city"
                    value={userData.business.city || ''}
                    onChange={(e) => updateCompanyField("city", e.target.value)}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && (
                    <motion.p
                      className="text-sm font-medium text-destructive"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.city}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm">
                    Code postal
                  </Label>
                  <Input
                    id="postalCode"
                    value={userData.business.postalCode || ''}
                    onChange={(e) => updateCompanyField("postalCode", e.target.value)}
                    className={errors.postalCode ? "border-destructive" : ""}
                  />
                  {errors.postalCode && (
                    <motion.p
                      className="text-sm font-medium text-destructive"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.postalCode}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm">
                  Pays
                </Label>
                <Input
                  id="country"
                  value={userData.business.country || ''}
                  onChange={(e) => updateCompanyField("country", e.target.value)}
                  className={errors.country ? "border-destructive" : ""}
                />
                {errors.country && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.country}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Numéros fiscaux */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
              <div className="space-y-2">
                <Label htmlFor="siret">Numéro de TVA</Label>
                <Input
                  id="siret"
                  value={userData.business.taxId || ""}
                  onChange={(e) => updateCompanyField("taxId", e.target.value)}
                  placeholder="Facultatif"
                />
              </div>
            </motion.div>

            {/* Logo de l'entreprise */}
            <ImageUploader
              currentImage={userData.business.logoUrl || ''}
              onImageChange={(url) => updateCompanyField("logoUrl", url)}
              label="Logo de l'entreprise"
              description="Ce logo apparaîtra sur vos devis et factures."
              isAvatar={false}
            />

            {/* Bouton de sauvegarde des informations de l'entreprise */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={handleBusinessSubmit}
                disabled={isLoading || isUpdating}
                className="w-full"
              >
                {isLoading || isUpdating ? "Enregistrement en cours..." : "Enregistrer les informations de l'entreprise"}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Aperçu */}
      <CompanyPreview
        name={userData.business.name || ''}
        logo={userData.business.logoUrl || ''}
        address={addressObj}
        siret={userData.business.taxId || ''}
      />
    </motion.div>
  )
}

