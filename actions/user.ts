"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { useMutation } from "@/lib/safe-action"
import { personalInfoSchema, businessInfoSchema, updateProfileSchema, updatePasswordSchema, uploadImageSchema } from "@/validations/user"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

// Initialisation du client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

        revalidatePath(`/dashboard/${userId}/profile`)

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

export const updatePassword = useMutation(
    updatePasswordSchema,
    async (data, { userId }) => {
        const ctx = await auth.$context

        if (data.newPassword !== data.confirmPassword) {
            return {
                success: false,
                message: "Les mots de passe ne correspondent pas",
            }
        }

        const hashedPassword = await ctx.password.hash(data.newPassword)

        await ctx.internalAdapter.updatePassword(userId, hashedPassword)

        return {
            success: true,
            message: "Mot de passe mis à jour avec succès",
        }
    }
)

// Action pour télécharger une image vers Supabase
export const uploadImage = useMutation(
    uploadImageSchema,
    async (data, { userId }) => {
        try {
            const file = data.file;
            const type = data.type;
            const fileUserId = userId;

            if (!file || !type || !fileUserId) {
                throw new Error("Données manquantes pour le téléchargement");
            }

            // Définition du bucket et du chemin selon le type d'image
            const bucket = 'images';
            const path = type === 'avatar'
                ? `user/${fileUserId}/${Date.now()}_${file.name}`
                : `business/${fileUserId}/${Date.now()}_${file.name}`;

            // Récupérer l'ancienne image pour la supprimer plus tard
            let oldImagePath = null;

            if (type === 'avatar') {
                const user = await prisma.user.findUnique({
                    where: { id: fileUserId }
                });

                if (user?.image) {
                    // Extraction du chemin de l'URL de l'image
                    const url = new URL(user.image);
                    // Le format de l'URL est généralement : 
                    // https://[project-ref].supabase.co/storage/v1/object/public/images/user/...
                    const pathParts = url.pathname.split('/');
                    const publicIndex = pathParts.indexOf('public');

                    if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
                        // Récupérer le chemin après "public/[bucket_name]/"
                        oldImagePath = pathParts.slice(publicIndex + 2).join('/');
                    }
                }
            } else if (type === 'logo') {
                const business = await prisma.business.findFirst({
                    where: { userId: fileUserId }
                });

                if (business?.logoUrl) {
                    // Extraction du chemin de l'URL de l'image
                    const url = new URL(business.logoUrl);
                    const pathParts = url.pathname.split('/');
                    const publicIndex = pathParts.indexOf('public');

                    if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
                        oldImagePath = pathParts.slice(publicIndex + 2).join('/');
                    }
                }
            }

            // Conversion du fichier en ArrayBuffer pour l'upload
            const arrayBuffer = await file.arrayBuffer();
            const fileBuffer = new Uint8Array(arrayBuffer);

            // Upload du fichier vers Supabase Storage
            const { error } = await supabase
                .storage
                .from(bucket)
                .upload(path, fileBuffer, {
                    contentType: file.type,
                    upsert: true
                });

            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }

            // Récupération de l'URL publique
            const { data: urlData } = await supabase
                .storage
                .from(bucket)
                .getPublicUrl(path);

            if (!urlData || !urlData.publicUrl) {
                throw new Error("Impossible de récupérer l'URL publique de l'image");
            }

            const imageUrl = urlData.publicUrl;

            // Mise à jour de la base de données selon le type d'image
            if (type === 'avatar') {
                await prisma.user.update({
                    where: { id: fileUserId },
                    data: { image: imageUrl }
                });
            } else if (type === 'logo') {
                const business = await prisma.business.findFirst({
                    where: { userId: fileUserId }
                });

                if (business) {
                    await prisma.business.update({
                        where: { id: business.id },
                        data: { logoUrl: imageUrl }
                    });
                } else {
                    throw new Error("Entreprise non trouvée");
                }
            }

            // Supprimer l'ancienne image si elle existe
            if (oldImagePath) {
                await supabase
                    .storage
                    .from(bucket)
                    .remove([oldImagePath])
                    .then(({ error }) => {
                        if (error) {
                            console.error("Erreur lors de la suppression de l'ancienne image:", error.message);
                        }
                    });
            }

            revalidatePath(`/dashboard/${fileUserId}/profile`);

            return {
                success: true,
                message: "Image téléchargée avec succès",
                imageUrl
            };
        } catch (error) {
            console.error("Erreur d'upload:", error);
            throw new Error(`Erreur lors du téléchargement de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
);