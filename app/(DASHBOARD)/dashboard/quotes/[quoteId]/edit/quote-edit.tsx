"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Trash2, Plus, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Quote } from "@prisma/client"
import { updateQuote } from "@/actions/quote"
import { useAction } from "@/hooks/use-action"
import { toast } from "sonner"
import { paths } from "@/paths"

// Types
type DevisStatus = "draft" | "sent" | "accepted" | "rejected"
type DevisItem = {
    id: string
    productId: string
    name: string
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
}

type Client = {
    id: string
    name: string
    email: string
    userId: string
    createdAt: Date
    updatedAt: Date
    address: string | null
    phone: string | null
    company: string | null
}

type Product = {
    id: string
    name: string
    description: string
    defaultPrice: number
    defaultTaxRate: number
    userId: string
    createdAt: Date
    updatedAt: Date
}

type EditDevisPageProps = {
    quote: Quote & {
        items?: DevisItem[]
        number?: string
        discount?: {
            type: "percentage" | "fixed"
            value: number
        }
        notes?: string
    }
    clients: Client[]
    products: Product[]
}

export default function EditDevisPage({ quote, clients, products }: EditDevisPageProps) {
    const router = useRouter()
    const [confirmCancel, setConfirmCancel] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Initialize states from quote prop
    const [clientId, setClientId] = useState(quote.clientId || "")
    const [createdAt, setCreatedAt] = useState(quote.createdAt)
    const [dueDate, setDueDate] = useState(quote.validUntil || new Date())

    const [status, setStatus] = useState<DevisStatus>(quote.status ? quote.status.toLowerCase() as DevisStatus : "draft")

    // Initialize with a single item using the first product if available
    const [items, setItems] = useState<DevisItem[]>(() => {
        // Check if we already have items in the quote
        if (quote.items && quote.items.length > 0) {
            // Assurons-nous que chaque item a un nom valide
            return quote.items.map(item => {
                // Si l'item n'a pas de nom, essayons de le trouver dans les produits
                if (!item.name && item.productId) {
                    const matchingProduct = products.find(p => p.id === item.productId);
                    if (matchingProduct) {
                        return {
                            ...item,
                            name: matchingProduct.name
                        };
                    }
                }
                return item;
            });
        }

        // Otherwise, create a single item with the first product if available
        if (products.length > 0) {
            const firstProduct = products[0];
            return [{
                id: `new-item-${Date.now()}`,
                productId: firstProduct.id,
                name: firstProduct.name,
                description: firstProduct.description,
                quantity: 1,
                unitPrice: firstProduct.defaultPrice,
                taxRate: firstProduct.defaultTaxRate,
            }];
        }

        // Fallback to empty item if no products available
        return [{
            id: `new-item-${Date.now()}`,
            productId: "",
            name: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 20,
        }];
    });

    // Initialize discount and notes
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
        quote.discount?.type || "percentage"
    )
    const [discountValue, setDiscountValue] = useState(quote.discount?.value || 0)
    const [notes, setNotes] = useState(quote.notes || "")

    const addItem = () => {
        const newItem: DevisItem = {
            id: `new-item-${Date.now()}`,
            productId: "",
            name: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 20,
        }
        setItems([...items, newItem])
    }

    // Fonction pour supprimer une ligne
    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items]
            newItems.splice(index, 1)
            setItems(newItems)
        }
    }

    // Fonction pour mettre à jour un champ d'un item
    const updateItemField = (index: number, field: keyof DevisItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    // Fonction pour mettre à jour la description, le prix et la TVA lorsqu'un produit est sélectionné
    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId)
        if (product) {
            const newItems = [...items]
            newItems[index] = {
                ...newItems[index],
                productId,
                name: product.name,
                description: product.description,
                unitPrice: product.defaultPrice,
                taxRate: product.defaultTaxRate,
            }
            setItems(newItems)
        }
    }

    // Calculer le sous-total
    const calculateSubtotal = () => {
        return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    }

    // Calculer les taxes
    const calculateTaxes = () => {
        return items.reduce((total, item) => total + (item.quantity * item.unitPrice * item.taxRate) / 100, 0)
    }

    // Calculer la remise
    const calculateDiscount = () => {
        const subtotal = calculateSubtotal()
        if (discountValue <= 0) return 0
        return discountType === "percentage" ? (subtotal * discountValue) / 100 : discountValue
    }

    // Calculer le total
    const calculateTotal = () => {
        return calculateSubtotal() + calculateTaxes() - calculateDiscount()
    }

    // Formater le montant en euros
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    // Validation du formulaire
    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!clientId) {
            newErrors.clientId = "Veuillez sélectionner un client"
        }

        items.forEach((item, index) => {
            if (!item.productId) {
                newErrors[`items.${index}.productId`] = "Veuillez sélectionner un produit"
            }
            if (item.quantity <= 0) {
                newErrors[`items.${index}.quantity`] = "La quantité doit être supérieure à 0"
            }
            if (item.unitPrice <= 0) {
                newErrors[`items.${index}.unitPrice`] = "Le prix unitaire doit être supérieur à 0"
            }
            if (item.taxRate < 0) {
                newErrors[`items.${index}.taxRate`] = "Le taux de TVA ne peut pas être négatif"
            }
        })

        if (discountValue < 0) {
            newErrors.discountValue = "La remise ne peut pas être négative"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Utilisation du hook useAction pour gérer l'action serveur updateQuote
    const { execute: executeUpdateQuote, isLoading } = useAction(updateQuote, {
        onSuccess: (data) => {
            const message = data?.data?.data?.message || "Devis mis à jour avec succès";
            if (data?.data?.success) {
                toast.success(message);
                router.push(paths.dashboard.quotes.detail(quote.id));
            } else {
                toast.error(message);
            }
        },
        onError: (error) => {
            toast.error(error || "Une erreur est survenue");
        }
    });

    // Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Assurons-nous que createdAt et dueDate sont bien des objets Date
        const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
        const dueDateDate = dueDate instanceof Date ? dueDate : new Date(dueDate);

        // Préparer les données du formulaire
        const formData = {
            id: quote.id,
            clientId,
            createdAt: createdAtDate,
            dueDate: dueDateDate,
            status,
            items: items.map(item => ({
                id: item.id,
                productId: item.productId,
                name: item.name,
                description: item.description || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
            })),
            discount: discountValue > 0 ? {
                type: discountType,
                value: discountValue,
            } : undefined,
            notes,
        };
        // Exécuter l'action serveur
        executeUpdateQuote(formData);
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Bouton retour */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() => router.push(paths.dashboard.quotes.detail(quote.id))}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au devis
                </Button>

                {/* Titre de la page */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Modifier le devis #{quote.number || quote.id}</h1>
                    <p className="text-muted-foreground mt-1">
                        Modifiez les informations du devis et enregistrez vos changements.
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informations générales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Client */}
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Select value={clientId} onValueChange={setClientId}>
                                        <SelectTrigger id="client" className={errors.clientId ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Sélectionner un client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem className="cursor-pointer" key={client.id} value={client.id}>
                                                    {client.name} ({client.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.clientId && <p className="text-sm font-medium text-destructive">{errors.clientId}</p>}
                                </div>

                                {/* Statut */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Statut</Label>
                                    <Select value={status} onValueChange={(value) => setStatus(value as DevisStatus)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Sélectionner un statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem className="cursor-pointer" value="draft">Brouillon</SelectItem>
                                            <SelectItem className="cursor-pointer" value="sent">Envoyé</SelectItem>
                                            <SelectItem className="cursor-pointer" value="accepted">Accepté</SelectItem>
                                            <SelectItem className="cursor-pointer" value="rejected">Refusé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date de création */}
                                <div className="space-y-2">
                                    <Label htmlFor="createdAt">Date de création</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="createdAt"
                                                variant={"outline"}
                                                className={cn("w-full pl-3 text-left font-normal", !createdAt && "text-muted-foreground")}
                                            >
                                                {createdAt ? (
                                                    format(createdAt, "dd MMMM yyyy", {
                                                        locale: fr,
                                                    })
                                                ) : (
                                                    <span>Sélectionner une date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={createdAt}
                                                onSelect={(date) => date && setCreatedAt(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Date d'échéance */}
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="dueDate"
                                                variant={"outline"}
                                                className={cn("w-full pl-3 text-left font-normal", !dueDate && "text-muted-foreground")}
                                            >
                                                {dueDate ? (
                                                    format(dueDate, "dd MMMM yyyy", {
                                                        locale: fr,
                                                    })
                                                ) : (
                                                    <span>Sélectionner une date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dueDate}
                                                onSelect={(date) => date && setDueDate(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lignes de devis */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Lignes de devis</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une ligne
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full">
                                <div className="min-w-[800px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[250px]">Produit/Service</TableHead>
                                                <TableHead className="w-[250px]">Description</TableHead>
                                                <TableHead className="w-[100px] text-center">Quantité</TableHead>
                                                <TableHead className="w-[150px] text-right">Prix unitaire</TableHead>
                                                <TableHead className="w-[100px] text-right">TVA (%)</TableHead>
                                                <TableHead className="w-[150px] text-right">Total HT</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Select
                                                                value={item.productId}
                                                                onValueChange={(value) => handleProductChange(index, value)}
                                                            >
                                                                <SelectTrigger
                                                                    className={errors[`items.${index}.productId`] ? "border-destructive" : ""}
                                                                >
                                                                    <SelectValue placeholder="Sélectionner un produit" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {products.map((product) => (
                                                                        <SelectItem className="cursor-pointer" key={product.id} value={product.id}>
                                                                            {product.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors[`items.${index}.productId`] && (
                                                                <p className="text-xs font-medium text-destructive">
                                                                    {errors[`items.${index}.productId`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Textarea
                                                            value={item.description}
                                                            onChange={(e) => updateItemField(index, "description", e.target.value)}
                                                            placeholder="Description"
                                                            className="min-h-[60px] resize-none"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    updateItemField(index, "quantity", Number.parseFloat(e.target.value) || 0)
                                                                }
                                                                className={cn(
                                                                    "text-center",
                                                                    errors[`items.${index}.quantity`] ? "border-destructive" : "",
                                                                )}
                                                            />
                                                            {errors[`items.${index}.quantity`] && (
                                                                <p className="text-xs font-medium text-destructive">
                                                                    {errors[`items.${index}.quantity`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                value={item.unitPrice}
                                                                onChange={(e) =>
                                                                    updateItemField(index, "unitPrice", Number.parseFloat(e.target.value) || 0)
                                                                }
                                                                className={cn(
                                                                    "text-right",
                                                                    errors[`items.${index}.unitPrice`] ? "border-destructive" : "",
                                                                )}
                                                            />
                                                            {errors[`items.${index}.unitPrice`] && (
                                                                <p className="text-xs font-medium text-destructive">
                                                                    {errors[`items.${index}.unitPrice`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.1"
                                                                value={item.taxRate}
                                                                onChange={(e) =>
                                                                    updateItemField(index, "taxRate", Number.parseFloat(e.target.value) || 0)
                                                                }
                                                                className={cn(
                                                                    "text-right",
                                                                    errors[`items.${index}.taxRate`] ? "border-destructive" : "",
                                                                )}
                                                            />
                                                            {errors[`items.${index}.taxRate`] && (
                                                                <p className="text-xs font-medium text-destructive">
                                                                    {errors[`items.${index}.taxRate`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatAmount(item.quantity * item.unitPrice)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                            disabled={items.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Supprimer</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Résumé et notes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Conditions, informations supplémentaires..."
                                        className="min-h-[150px]"
                                    />
                                    <p className="text-sm text-muted-foreground">Ces notes seront visibles sur le devis.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Résumé */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Résumé</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Sous-total, TVA et Total */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sous-total HT</span>
                                        <span>{formatAmount(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">TVA</span>
                                        <span>{formatAmount(calculateTaxes())}</span>
                                    </div>
                                </div>

                                {/* Remise */}
                                <div className="space-y-2">
                                    <Label>Remise</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={discountType}
                                            onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}
                                        >
                                            <SelectTrigger className="w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem className="cursor-pointer" value="percentage">%</SelectItem>
                                                <SelectItem className="cursor-pointer" value="fixed">€</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="w-2/3 space-y-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(Number.parseFloat(e.target.value) || 0)}
                                                className={errors.discountValue ? "border-destructive" : ""}
                                            />
                                            {errors.discountValue && (
                                                <p className="text-xs font-medium text-destructive">{errors.discountValue}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Remise appliquée</span>
                                        <span>-{formatAmount(calculateDiscount())}</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Total */}
                                <div className="flex justify-between font-medium text-lg">
                                    <span>Total TTC</span>
                                    <span>{formatAmount(calculateTotal())}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4">
                        <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline">
                                    Annuler
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Annuler les modifications</DialogTitle>
                                    <DialogDescription>
                                        Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmCancel(false)}>
                                        Continuer l&apos;édition
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setConfirmCancel(false)
                                            router.push(paths.dashboard.quotes.detail(quote.id))
                                        }}
                                    >
                                        Abandonner les modifications
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span>Enregistrement...</span>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

