"use client"

import { useRef, type ChangeEvent } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { itemVariants } from "@/app/(DASHBOARD)/dashboard/[userId]/profile/animations"

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Dans une application réelle, vous téléchargeriez le fichier sur un serveur
      // et utiliseriez l'URL retournée. Ici, nous simulons cela avec un URL d'objet local.
      const imageUrl = URL.createObjectURL(file)
      onImageChange(imageUrl)
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
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentImage} alt="Avatar" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </motion.div>
        ) : (
          <motion.div
            className="relative h-20 w-32 overflow-hidden rounded-md border"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image src={currentImage || "/placeholder.svg"} alt="Company logo" fill className="object-cover" />
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Choisir un fichier
            </Button>
          </motion.div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <p className="text-xs text-muted-foreground">PNG, JPG ou GIF. 2MB max.</p>
        </div>
      </div>
    </motion.div>
  )
}

