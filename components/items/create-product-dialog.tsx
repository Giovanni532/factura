"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProduct } from '@/actions/produit'
import { createProductSchema } from '@/validations/produits'
import { motion } from 'framer-motion'

// Utilisation du même schema que dans le serveur
const formSchema = createProductSchema

type FormData = z.infer<typeof formSchema>

export function CreateProductDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            unitPrice: 0,
        },
    })

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true)
            await createProduct(data)
            form.reset()
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Erreur lors de la création du produit:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Ajouter un produit
                    </Button>
                </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Ajouter un produit ou service</DialogTitle>
                            <DialogDescription>
                                Créez un nouveau produit ou service en remplissant les informations ci-dessous.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Nom*
                                </Label>
                                <Input
                                    id="name"
                                    {...form.register('name')}
                                    aria-invalid={!!form.formState.errors.name}
                                />
                                {form.formState.errors.name && (
                                    <motion.p
                                        className="text-sm text-destructive"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {form.formState.errors.name.message}
                                    </motion.p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    className="resize-none"
                                    {...form.register('description')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unitPrice">
                                    Prix unitaire (€)*
                                </Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    step="0.01"
                                    {...form.register('unitPrice', {
                                        valueAsNumber: true,
                                    })}
                                    aria-invalid={!!form.formState.errors.unitPrice}
                                />
                                {form.formState.errors.unitPrice && (
                                    <motion.p
                                        className="text-sm text-destructive"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {form.formState.errors.unitPrice.message}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Création..." : "Créer le produit"}
                                </Button>
                            </motion.div>
                        </DialogFooter>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
} 