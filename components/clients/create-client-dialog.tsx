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

    const formFields = [
        {
            id: "name",
            label: "Nom*",
            type: "text",
            required: true,
            error: form.formState.errors.name?.message
        },
        {
            id: "email",
            label: "Email*",
            type: "email",
            required: true,
            error: form.formState.errors.email?.message
        },
        {
            id: "company",
            label: "Entreprise",
            type: "text",
            required: false
        },
        {
            id: "phone",
            label: "Téléphone",
            type: "text",
            required: false
        },
        {
            id: "address",
            label: "Adresse",
            type: "text",
            required: false
        }
    ];

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
            <DialogContent className="sm:max-w-[425px]">
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
                        <div className="grid gap-4 py-4">
                            {formFields.map((field, index) => (
                                <motion.div
                                    key={field.id}
                                    className="grid grid-cols-4 items-center gap-4"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Label htmlFor={field.id} className="text-right">
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={field.id}
                                        type={field.type}
                                        className="col-span-3"
                                        {...form.register(field.id as any)}
                                        aria-invalid={field.error ? true : false}
                                    />
                                    {field.error && (
                                        <motion.p
                                            className="col-span-3 col-start-2 text-sm text-destructive"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {field.error}
                                        </motion.p>
                                    )}
                                </motion.div>
                            ))}
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