"use client"

import { useRef, type ChangeEvent, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Upload, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"
import { uploadImage } from "@/actions/user"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"

interface ImageUploaderProps {
  currentImage: string
  onImageChange: (url: string) => void
  label: string
  description: string
  isAvatar?: boolean
  initials?: string
}

export function ImageUploader({
  currentImage,
  onImageChange,
  label,
  description,
  isAvatar = false,
  initials = "TD",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImage)
  const { setUser } = useAuthStore()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 2MB)")
        return
      }

      // Vérifier le type du fichier
      if (!file.type.startsWith("image/")) {
        toast.error("Seules les images sont acceptées")
        return
      }

      setIsUploading(true)

      try {
        // Créer un aperçu local temporaire
        const localImageUrl = URL.createObjectURL(file)
        setPreviewUrl(localImageUrl)

        // Télécharger l'image vers Supabase via l'action serveur
        const response = await uploadImage({
          file,
          type: isAvatar ? 'avatar' : 'logo'
        })

        // Vérifier si la réponse est valide
        if (response && typeof response === "object") {
          // Pour les réponses de next-safe-action, vérifier s'il y a une erreur
          if ("serverError" in response && response.serverError) {
            throw new Error(response.serverError.message || "Erreur serveur");
          }

          // Pour les réponses réussies
          if ("data" in response && response.data) {
            const data = response.data;
            if (data.success && data.imageUrl) {
              onImageChange(data.imageUrl);
              toast.success(data.message || "Image téléchargée avec succès");
              setUser(data.user)
            } else {
              throw new Error("Format de réponse invalide");
            }
          } else if ("success" in response && response.success) {
            // Pour le format direct
            if ("imageUrl" in response) {
              onImageChange(response.imageUrl as string);
              toast.success("Image téléchargée avec succès");
            }
          } else {
            throw new Error("Format de réponse non reconnu");
          }
        } else {
          throw new Error("Réponse invalide du serveur");
        }
      } catch (error) {
        console.error("Erreur d'upload:", error)
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
        // Restaurer l'image précédente en cas d'erreur
        setPreviewUrl(currentImage)
      } finally {
        setIsUploading(false)
        // Nettoyer le champ de fichier pour permettre de réuploader le même fichier
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  return (
    <motion.div className="space-y-4" variants={itemVariants}>
      <div className="flex flex-col space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-4">
        {isAvatar ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={previewUrl} alt="Avatar" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative h-20 w-32 overflow-hidden rounded-md border"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image src={previewUrl || "/placeholder.svg"} alt="Company logo" fill className="object-cover" />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Téléchargement..." : "Choisir un fichier"}
            </Button>
          </motion.div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <p className="text-xs text-muted-foreground">PNG, JPG ou GIF. 2MB max.</p>
        </div>
      </div>
    </motion.div>
  )
}

