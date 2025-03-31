"use client"

import { motion } from "framer-motion"
import { Building2, MapPin } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { containerVariants, cardVariants, itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import type { UserProfile } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/type"
import { ImageUploader } from "@/components/profile/image-uploader"
import { CompanyPreview } from "@/components/profile/company-preview"

interface CompanyInfoTabProps {
  userData: UserProfile
  errors: Record<string, string>
  updateCompanyField: (field: keyof UserProfile["company"], value: any) => void
  updateAddressField: (field: keyof UserProfile["company"]["address"], value: string) => void
}

export function CompanyInfoTab({ userData, errors, updateCompanyField, updateAddressField }: CompanyInfoTabProps) {
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
                value={userData.company.name}
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
                  value={userData.company.address.street}
                  onChange={(e) => updateAddressField("street", e.target.value)}
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
                    value={userData.company.address.city}
                    onChange={(e) => updateAddressField("city", e.target.value)}
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
                    value={userData.company.address.postalCode}
                    onChange={(e) => updateAddressField("postalCode", e.target.value)}
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
                  value={userData.company.address.country}
                  onChange={(e) => updateAddressField("country", e.target.value)}
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
                <Label htmlFor="siret">Numéro SIRET</Label>
                <Input
                  id="siret"
                  value={userData.company.siret || ""}
                  onChange={(e) => updateCompanyField("siret", e.target.value)}
                  placeholder="Facultatif"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">Numéro de TVA</Label>
                <Input
                  id="vatNumber"
                  value={userData.company.vatNumber || ""}
                  onChange={(e) => updateCompanyField("vatNumber", e.target.value)}
                  placeholder="Facultatif"
                />
              </div>
            </motion.div>

            {/* Logo de l'entreprise */}
            <ImageUploader
              currentImage={userData.company.logo}
              onImageChange={(url) => updateCompanyField("logo", url)}
              label="Logo de l'entreprise"
              description="Ce logo apparaîtra sur vos devis et factures."
              isAvatar={false}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Aperçu */}
      <CompanyPreview
        name={userData.company.name}
        logo={userData.company.logo}
        address={userData.company.address}
        siret={userData.company.siret}
        vatNumber={userData.company.vatNumber}
      />
    </motion.div>
  )
}

