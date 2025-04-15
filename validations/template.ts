import { z } from 'zod'

export const templateSchema = z.object({
    name: z.string().min(2, {
        message: 'Template name must be at least 2 characters.'
    }),
    description: z.string().optional(),
    type: z.enum(['INVOICE', 'QUOTE', 'BOTH']),
    content: z.string(),
    isDefault: z.boolean().default(false),
})

export type TemplateFormValues = z.infer<typeof templateSchema>
