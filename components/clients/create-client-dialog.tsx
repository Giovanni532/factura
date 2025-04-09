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
import { createClient } from '@/actions/client'
import { createClientSchema } from '@/validations/clients'
import { motion } from 'framer-motion'

// Utilisation du même schema que dans le serveur
const formSchema = createClientSchema

type FormData = z.infer<typeof formSchema>

export function CreateClientDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            company: '',
            address: '',
            city: '',
            postalCode: '',
            country: '',
        },
    })

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true)
            await createClient(data)
            form.reset()
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Erreur lors de la création du client:', error)
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
                        Ajouter un client
                    </Button>
                </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Ajouter un client</DialogTitle>
                            <DialogDescription>
                                Créez un nouveau client en remplissant les informations ci-dessous.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            {/* Informations principales */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom et prénom*</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        {...form.register("name")}
                                        aria-invalid={form.formState.errors.name ? true : false}
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email*</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...form.register("email")}
                                        aria-invalid={form.formState.errors.email ? true : false}
                                    />
                                    {form.formState.errors.email && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Coordonnées */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Entreprise</Label>
                                    <Input
                                        id="company"
                                        type="text"
                                        {...form.register("company")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        type="text"
                                        {...form.register("phone")}
                                    />
                                </div>
                            </div>

                            {/* Adresse */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Adresse</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        {...form.register("address")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        {...form.register("city")}
                                    />
                                </div>
                            </div>

                            {/* Code postal et pays */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Code postal</Label>
                                    <Input
                                        id="postalCode"
                                        type="text"
                                        {...form.register("postalCode")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Pays</Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        {...form.register("country")}
                                    />
                                </div>
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
                                    {isSubmitting ? "Création..." : "Créer le client"}
                                </Button>
                            </motion.div>
                        </DialogFooter>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
} 