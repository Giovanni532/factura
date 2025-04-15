"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from "@/lib/prisma"
import { paths } from '@/paths'
import { templateSchema } from '@/validations/template'
import { useMutation } from "@/lib/safe-action"
import { z } from 'zod'

// Schéma de validation pour la récupération des templates
const getTemplatesSchema = z.object({
    userId: z.string()
})

// Schéma de validation pour la récupération d'un template par ID
const getTemplateByIdSchema = z.object({
    id: z.string()
})

// Schéma de validation pour la suppression d'un template
const deleteTemplateSchema = z.object({
    id: z.string()
})

// Schéma de validation pour la mise à jour d'un template
const updateTemplateSchema = z.object({
    id: z.string(),
    ...templateSchema.shape
})

// Schéma de validation pour définir un template comme défaut
const setDefaultTemplateSchema = z.object({
    id: z.string()
})

export const createTemplate = useMutation(
    templateSchema,
    async (data, { userId }) => {
        const { name, description, type, content, isDefault } = data

        try {
            // If this template is set as default, unset any existing default templates of the same type
            if (isDefault) {
                await prisma.template.updateMany({
                    where: {
                        userId,
                        type,
                        isDefault: true
                    },
                    data: {
                        isDefault: false
                    }
                })
            }

            // Create the new template
            const template = await prisma.template.create({
                data: {
                    name,
                    description,
                    type,
                    content,
                    isDefault,
                    userId
                }
            })

            revalidatePath(paths.dashboard.templates.list)
            return {
                success: true,
                data: template
            }
        } catch (error) {
            console.error('Template creation error:', error)
            return {
                success: false,
                error: 'Failed to create template'
            }
        }
    }
)

export const getTemplates = useMutation(
    getTemplatesSchema,
    async ({ userId }, { userId: authUserId }) => {
        if (userId !== authUserId) {
            throw new Error("Vous n'êtes pas autorisé à accéder à ces données")
        }

        try {
            const templates = await prisma.template.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            })

            return {
                success: true,
                data: templates
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error)
            return {
                success: false,
                error: 'Failed to fetch templates'
            }
        }
    }
)

export const getTemplateById = useMutation(
    getTemplateByIdSchema,
    async ({ id }, { userId }) => {
        try {
            const template = await prisma.template.findUnique({
                where: { id },
            })

            if (!template) {
                return {
                    success: false,
                    error: 'Template not found'
                }
            }

            // Check if template belongs to user
            if (template.userId !== userId) {
                return {
                    success: false,
                    error: 'You are not authorized to access this template'
                }
            }

            return {
                success: true,
                data: template
            }
        } catch (error) {
            console.error(`Failed to fetch template with ID ${id}:`, error)
            return {
                success: false,
                error: 'Failed to fetch template'
            }
        }
    }
)

export const updateTemplate = useMutation(
    updateTemplateSchema,
    async ({ id, ...data }, { userId }) => {
        try {
            // Check if template belongs to user
            const existingTemplate = await prisma.template.findUnique({
                where: { id }
            })

            if (!existingTemplate) {
                return {
                    success: false,
                    error: 'Template not found'
                }
            }

            if (existingTemplate.userId !== userId) {
                return {
                    success: false,
                    error: 'You are not authorized to update this template'
                }
            }

            // If this template is set as default, unset any existing default templates of the same type
            if (data.isDefault) {
                await prisma.template.updateMany({
                    where: {
                        userId,
                        type: data.type,
                        isDefault: true,
                        id: { not: id }
                    },
                    data: {
                        isDefault: false
                    }
                })
            }

            // Update the template
            const updatedTemplate = await prisma.template.update({
                where: { id },
                data
            })

            revalidatePath(paths.dashboard.templates.list)
            return {
                success: true,
                data: updatedTemplate
            }
        } catch (error) {
            console.error('Template update error:', error)
            return {
                success: false,
                error: 'Failed to update template'
            }
        }
    }
)

export const deleteTemplate = useMutation(
    deleteTemplateSchema,
    async ({ id }, { userId }) => {
        try {
            // Check if template belongs to user
            const existingTemplate = await prisma.template.findUnique({
                where: { id }
            })

            if (!existingTemplate) {
                return {
                    success: false,
                    error: 'Template not found'
                }
            }

            if (existingTemplate.userId !== userId) {
                return {
                    success: false,
                    error: 'You are not authorized to delete this template'
                }
            }

            // Delete the template
            await prisma.template.delete({
                where: { id }
            })

            revalidatePath(paths.dashboard.templates.list)
            return {
                success: true
            }
        } catch (error) {
            console.error('Template deletion error:', error)
            return {
                success: false,
                error: 'Failed to delete template'
            }
        }
    }
)

export const setDefaultTemplate = useMutation(
    setDefaultTemplateSchema,
    async ({ id }, { userId }) => {
        try {
            // Check if template belongs to user
            const existingTemplate = await prisma.template.findUnique({
                where: { id },
                select: { id: true, userId: true, type: true }
            })

            if (!existingTemplate) {
                return {
                    success: false,
                    error: 'Template not found'
                }
            }

            if (existingTemplate.userId !== userId) {
                return {
                    success: false,
                    error: 'You are not authorized to modify this template'
                }
            }

            // Unset any existing default templates of the same type
            await prisma.template.updateMany({
                where: {
                    userId,
                    type: existingTemplate.type,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            })

            // Set this template as default
            const updatedTemplate = await prisma.template.update({
                where: { id },
                data: {
                    isDefault: true
                }
            })

            revalidatePath(paths.dashboard.templates.list)
            return {
                success: true,
                data: updatedTemplate
            }
        } catch (error) {
            console.error('Set default template error:', error)
            return {
                success: false,
                error: 'Failed to set template as default'
            }
        }
    }
) 