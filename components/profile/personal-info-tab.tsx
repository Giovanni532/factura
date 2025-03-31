"use client"

import { motion } from "framer-motion"
import { Lock, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { containerVariants, cardVariants, itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import type { UserProfile } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/type"
import { ImageUploader } from "@/components/profile/image-uploader"
import { SubscriptionCard } from "@/components/profile/subscription-card"

interface PersonalInfoTabProps {
  userData: UserProfile
  errors: Record<string, string>
  updateUserField: (field: keyof UserProfile, value: any) => void
  onPasswordChange: () => void
}

export function PersonalInfoTab({ userData, errors, updateUserField, onPasswordChange }: PersonalInfoTabProps) {
  const initials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* Informations de base */}
      <motion.div className="lg:col-span-2" variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles et vos préférences de compte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nom et prénom */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => updateUserField("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => updateUserField("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <motion.p
                    className="text-sm font-medium text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => updateUserField("email", e.target.value)}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && (
                <motion.p
                  className="text-sm font-medium text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Mot de passe */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label>Mot de passe</Label>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center">
                  <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">••••••••••••</span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="button" variant="outline" size="sm" onClick={onPasswordChange}>
                    Modifier
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Photo de profil */}
            <ImageUploader
              currentImage={userData.avatar}
              onImageChange={(url) => updateUserField("avatar", url)}
              label="Photo de profil"
              description="Cette photo sera affichée sur votre profil et dans vos communications."
              isAvatar={true}
              initials={initials}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Informations sur l'abonnement */}
      <motion.div className="space-y-6" variants={containerVariants}>
        <SubscriptionCard
          plan={userData.subscription.plan}
          status={userData.subscription.status}
          renewDate={userData.subscription.renewDate}
        />

      </motion.div>
    </motion.div>
  )
}

