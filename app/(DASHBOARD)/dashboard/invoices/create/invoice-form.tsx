"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, Plus, Trash2, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createInvoice, updateInvoice } from "@/actions/facture"
import { paths } from "@/paths"

// Types
type Client = {
    id: string
    name: string
    company?: string | null
}

type Product = {
    id: string
    name: string
    description?: string | null
    unitPrice: number
}

type User = {
    id: string
    name?: string | null
}

type InvoiceItem = {
    id?: string
    itemId: string
    quantity: number
    unitPrice: number
}

type Invoice = {
    id: string
    clientId: string
    dueDate: Date
    status: "pending" | "paid" | "overdue" | "canceled"
    invoiceItems: InvoiceItem[]
}

// Statut des factures
const invoiceStatuses = [
    { value: "pending", label: "En attente" },
    { value: "paid", label: "Payée" },
    { value: "overdue", label: "En retard" },
    { value: "canceled", label: "Annulée" }
]

// Schéma de validation du formulaire
const formSchema = z.object({
    id: z.string().optional(),
    clientId: z.string({
        required_error: "Veuillez sélectionner un client",
    }),
    dueDate: z.date({
        required_error: "Veuillez sélectionner une date d'échéance",
    }),
    status: z.string().default("pending"),
    vatRate: z.number().default(20),
    invoiceItems: z.array(
        z.object({
            id: z.string().optional(),
            itemId: z.string({
                required_error: "Veuillez sélectionner un produit",
            }),
            quantity: z.number().min(1, {
                message: "La quantité doit être au moins 1",
            }),
            unitPrice: z.number().min(0.01, {
                message: "Le prix unitaire doit être positif",
            }),
        })
    ).min(1, {
        message: "Vous devez ajouter au moins un produit à la facture",
    }),
})

export default function InvoiceForm({
    clients,
    products,
    user,
    invoice
}: {
    clients: Client[]
    products: Product[]
    user: User
    invoice?: Invoice
}) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [total, setTotal] = useState(0)
    const [vatAmount, setVatAmount] = useState(0)
    const [totalTTC, setTotalTTC] = useState(0)
    const [vatRate, setVatRate] = useState(20) // Taux de TVA par défaut: 20%
    const isEditing = !!invoice

    // Initialisation du formulaire
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: invoice?.id,
            clientId: invoice?.clientId || "",
            dueDate: invoice?.dueDate ? new Date(invoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
            status: invoice?.status || "pending",
            vatRate: 20, // Par défaut 20%
            invoiceItems: invoice?.invoiceItems.length
                ? invoice.invoiceItems
                : [{ itemId: "", quantity: 1, unitPrice: 0 }],
        },
    })

    // Calculer le total de la facture lorsque les items changent
    const calculateTotal = () => {
        const items = form.getValues("invoiceItems")
        const newTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        const newVatRate = form.getValues("vatRate")
        const newVatAmount = (newTotal * newVatRate) / 100
        const newTotalTTC = newTotal + newVatAmount

        setTotal(newTotal)
        setVatRate(newVatRate)
        setVatAmount(newVatAmount)
        setTotalTTC(newTotalTTC)
    }

    // Mettre à jour le total lorsque les items changent
    useEffect(() => {
        const subscription = form.watch(() => calculateTotal())
        return () => subscription.unsubscribe()
    }, [form])

    // Formater le montant en euros
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount)
    }

    // Ajouter un nouvel item à la facture
    const addInvoiceItem = () => {
        const currentItems = form.getValues("invoiceItems")
        form.setValue("invoiceItems", [
            ...currentItems,
            { itemId: "", quantity: 1, unitPrice: 0 }
        ])
    }

    // Supprimer un item de la facture
    const removeInvoiceItem = (index: number) => {
        const currentItems = form.getValues("invoiceItems")
        if (currentItems.length > 1) {
            form.setValue("invoiceItems", currentItems.filter((_, i) => i !== index))
        }
    }

    // Mettre à jour le prix unitaire lorsque le produit change
    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            const currentItems = form.getValues("invoiceItems")
            currentItems[index].unitPrice = product.unitPrice
            form.setValue("invoiceItems", currentItems)
        }
    }

    // Envoyer le formulaire
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            if (isEditing) {
                // Mise à jour d'une facture existante
                await updateInvoice({
                    id: invoice?.id as string,
                    clientId: values.clientId,
                    status: values.status as "PENDING" | "PAID" | "OVERDUE" | "CANCELED",
                    dueDate: values.dueDate,
                    vatRate: values.vatRate,
                    items: values.invoiceItems
                })
            } else {
                // Création d'une nouvelle facture
                await createInvoice({
                    clientId: values.clientId,
                    dueDate: values.dueDate,
                    vatRate: values.vatRate,
                    items: values.invoiceItems
                })
            }
            router.push(paths.dashboard.invoices.list)
            router.refresh()
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la facture:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col space-y-8"
            >
                <motion.div
                    variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                    }}
                >
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push(paths.dashboard.invoices.list)}>
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </motion.div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? "Modifier la facture" : "Créer une facture"}
                    </h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-8">
                            {/* Informations principales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations de la facture</CardTitle>
                                    <CardDescription>
                                        Saisissez les informations principales de la facture
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Sélection du client */}
                                    <FormField
                                        control={form.control}
                                        name="clientId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Client</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isSubmitting}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un client" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {clients.length ? (
                                                            clients.map((client) => (
                                                                <SelectItem
                                                                    key={client.id}
                                                                    value={client.id}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {client.name}{" "}
                                                                    {client.company && `(${client.company})`}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="" disabled>
                                                                Aucun client disponible
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Le client à qui sera facturé
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Date d'échéance */}
                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date d'échéance</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                                disabled={isSubmitting}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "d MMMM yyyy", { locale: fr })
                                                                ) : (
                                                                    <span>Sélectionner une date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            locale={fr}
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                            disabled={(date) => date < new Date()}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>
                                                    Date limite de paiement
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Taux de TVA */}
                                    <FormField
                                        control={form.control}
                                        name="vatRate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Taux de TVA (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={0.5}
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(Number(e.target.value));
                                                            calculateTotal(); // Recalculer les totaux quand le taux change
                                                        }}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Taux de TVA applicable à cette facture
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Statut (uniquement en mode édition) */}
                                    {isEditing && (
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Statut</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionner un statut" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {invoiceStatuses.map((status) => (
                                                                <SelectItem
                                                                    key={status.value}
                                                                    value={status.value}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {status.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Statut actuel de la facture
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Produits de la facture */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Produits</CardTitle>
                                    <CardDescription>
                                        Ajoutez les produits ou services à facturer
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[40%]">Produit</TableHead>
                                                    <TableHead>Quantité</TableHead>
                                                    <TableHead>Prix unitaire</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {form.getValues("invoiceItems").map((_, index) => (
                                                        <motion.tr
                                                            key={index}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border-b"
                                                        >
                                                            {/* Sélection du produit */}
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`invoiceItems.${index}.itemId`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-col">
                                                                            <Popover>
                                                                                <PopoverTrigger asChild>
                                                                                    <FormControl>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            role="combobox"
                                                                                            className={cn(
                                                                                                "justify-between w-full",
                                                                                                !field.value && "text-muted-foreground"
                                                                                            )}
                                                                                            disabled={isSubmitting}
                                                                                        >
                                                                                            {field.value
                                                                                                ? products.find(
                                                                                                    (product) => product.id === field.value
                                                                                                )?.name || "Sélectionner un produit"
                                                                                                : "Sélectionner un produit"}
                                                                                        </Button>
                                                                                    </FormControl>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className="w-[320px] p-0">
                                                                                    <Command>
                                                                                        <CommandInput placeholder="Rechercher un produit..." />
                                                                                        <CommandEmpty>Aucun produit trouvé</CommandEmpty>
                                                                                        <CommandList>
                                                                                            <CommandGroup>
                                                                                                {products.map((product) => (
                                                                                                    <CommandItem
                                                                                                        key={product.id}
                                                                                                        value={product.name}
                                                                                                        onSelect={() => {
                                                                                                            form.setValue(
                                                                                                                `invoiceItems.${index}.itemId`,
                                                                                                                product.id
                                                                                                            )
                                                                                                            handleProductChange(index, product.id)
                                                                                                        }}
                                                                                                        className="cursor-pointer"
                                                                                                    >
                                                                                                        <div className="flex flex-col">
                                                                                                            <span>{product.name}</span>
                                                                                                            <span className="text-sm text-muted-foreground">
                                                                                                                {formatAmount(product.unitPrice)}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </CommandItem>
                                                                                                ))}
                                                                                            </CommandGroup>
                                                                                        </CommandList>
                                                                                    </Command>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>

                                                            {/* Quantité */}
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`invoiceItems.${index}.quantity`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    {...field}
                                                                                    onChange={(e) => {
                                                                                        field.onChange(Number(e.target.value))
                                                                                    }}
                                                                                    disabled={isSubmitting}
                                                                                    className="w-16"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>

                                                            {/* Prix unitaire */}
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`invoiceItems.${index}.unitPrice`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min={0}
                                                                                    {...field}
                                                                                    onChange={(e) => {
                                                                                        field.onChange(Number(e.target.value))
                                                                                    }}
                                                                                    disabled={isSubmitting}
                                                                                    className="w-24"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>

                                                            {/* Total ligne */}
                                                            <TableCell className="text-right font-medium">
                                                                {formatAmount(
                                                                    form.getValues(`invoiceItems.${index}.quantity`) *
                                                                    form.getValues(`invoiceItems.${index}.unitPrice`)
                                                                )}
                                                            </TableCell>

                                                            {/* Supprimer ligne */}
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    type="button"
                                                                    onClick={() => removeInvoiceItem(index)}
                                                                    disabled={form.getValues("invoiceItems").length === 1 || isSubmitting}
                                                                    className="text-destructive hover:text-destructive/90"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addInvoiceItem}
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter un produit
                                        </Button>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <div className="w-full sm:w-64 rounded-lg border p-4">
                                            <div className="flex justify-between font-medium text-lg mb-2">
                                                <span>Total HT:</span>
                                                <span>{formatAmount(total)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                <span>TVA ({vatRate}%):</span>
                                                <span>{formatAmount(vatAmount)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                <span>Total TTC:</span>
                                                <span>{formatAmount(totalTTC)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end mt-6 space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(paths.dashboard.invoices.list)}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Traitement en cours..." : isEditing ? "Mettre à jour" : "Créer la facture"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </motion.div>
        </div>
    )
} 