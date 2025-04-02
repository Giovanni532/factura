"use server"

import { prisma } from "@/lib/prisma"
import { useMutation } from "@/lib/safe-action"
import { personalInfoSchema, businessInfoSchema, updateProfileSchema } from "@/validations/user"
import { revalidatePath } from "next/cache"

// Action pour mettre à jour les informations personnelles
export const updatePersonalInfo = useMutation(
    personalInfoSchema,
    async (data, { userId }) => {
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            throw new Error("Utilisateur non trouvé")
        }

        // Construire le nom complet à partir du prénom et du nom
        const name = `${data.firstName} ${data.lastName}`.trim()

        // Mettre à jour les informations personnelles
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                image: data.avatar,
            },
        })

        revalidatePath(`/`)

        return {
            success: true,
            message: "Informations personnelles mises à jour avec succès",
            user: updatedUser,
        }
    }
)

// Action pour mettre à jour les informations de l'entreprise
export const updateBusinessInfo = useMutation(
    businessInfoSchema,
    async (data, { userId }) => {
        // Vérifier que l'utilisateur et son entreprise existent
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { businesses: true },
        })

        if (!user) {
            throw new Error("Utilisateur non trouvé")
        }

        // Si l'utilisateur n'a pas d'entreprise, en créer une
        if (!user.businesses || user.businesses.length === 0) {
            const newBusiness = await prisma.business.create({
                data: {
                    userId: userId,
                    name: data.name || "",
                    address: data.address,
                    city: data.city,
                    postalCode: data.postalCode,
                    country: data.country,
                    logoUrl: data.logoUrl,
                    taxId: data.taxId,
                },
            })

            revalidatePath(`/dashboard/${userId}/profile`)

            return {
                success: true,
                message: "Entreprise créée avec succès",
                business: newBusiness,
            }
        }

        // Mettre à jour l'entreprise existante
        const businessId = user.businesses[0].id
        const updatedBusiness = await prisma.business.update({
            where: { id: businessId },
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                postalCode: data.postalCode,
                country: data.country,
                logoUrl: data.logoUrl,
                taxId: data.taxId,
            },
        })

        revalidatePath(`/dashboard/${userId}/profile`)

        return {
            success: true,
            message: "Informations de l'entreprise mises à jour avec succès",
            business: updatedBusiness,
        }
    }
)

// Action pour mettre à jour l'ensemble du profil (personnel + entreprise)
export const updateProfile = useMutation(
    updateProfileSchema,
    async (data, { userId }) => {
        try {
            // Mise à jour des informations personnelles
            const personalUpdate = await prisma.user.update({
                where: { id: userId },
                data: {
                    name: `${data.personal.firstName} ${data.personal.lastName}`.trim(),
                    image: data.personal.avatar,
                },
            })

            // Récupérer les informations de l'entreprise
            const business = await prisma.business.findFirst({
                where: { userId },
            })

            let businessUpdate;

            // Si aucune entreprise n'existe, en créer une nouvelle
            if (!business) {
                businessUpdate = await prisma.business.create({
                    data: {
                        userId,
                        name: data.business.name,
                        address: data.business.address,
                        city: data.business.city,
                        postalCode: data.business.postalCode,
                        country: data.business.country,
                        logoUrl: data.business.logoUrl,
                        taxId: data.business.taxId,
                    },
                })
            } else {
                // Mettre à jour l'entreprise existante
                businessUpdate = await prisma.business.update({
                    where: { id: business.id },
                    data: {
                        name: data.business.name,
                        address: data.business.address,
                        city: data.business.city,
                        postalCode: data.business.postalCode,
                        country: data.business.country,
                        logoUrl: data.business.logoUrl,
                        taxId: data.business.taxId,
                    },
                })
            }

            revalidatePath(`/dashboard/${userId}/profile`)

            return {
                success: true,
                message: "Profil mis à jour avec succès",
                personal: personalUpdate,
                business: businessUpdate,
            }
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du profil: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
        }
    }
)
