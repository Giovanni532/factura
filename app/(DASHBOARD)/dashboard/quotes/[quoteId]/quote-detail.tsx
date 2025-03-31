"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArrowLeft, Calendar, Copy, Download, Edit, MoreHorizontal, Printer, Receipt, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

// Types
type DevisStatus = "draft" | "sent" | "accepted" | "rejected" | "converted"
type DevisItem = {
    id: string
    name: string
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
}

type Devis = {
    id: string
    number: string
    client: {
        name: string
        email: string
        address: {
            street: string
            city: string
            postalCode: string
            country: string
        }
    }
    company: {
        name: string
        email: string
        address: {
            street: string
            city: string
            postalCode: string
            country: string
        }
        logo?: string
        taxId: string
    }
    items: DevisItem[]
    createdAt: Date
    dueDate: Date
    status: DevisStatus
    discount?: {
        type: "percentage" | "fixed"
        value: number
    }
    notes?: string
}

// Données de démonstration
export const devisData: Devis = {
    id: "1",
    number: "Q-1021",
    client: {
        name: "Martin Dupont",
        email: "martin.dupont@example.com",
        address: {
            street: "123 Rue de la Paix",
            city: "Paris",
            postalCode: "75001",
            country: "France",
        },
    },
    company: {
        name: "Ma Société SAS",
        email: "contact@masociete.com",
        address: {
            street: "45 Avenue des Champs-Élysées",
            city: "Paris",
            postalCode: "75008",
            country: "France",
        },
        taxId: "FR 76 123 456 789",
    },
    items: [
        {
            id: "item-1",
            name: "Développement site web",
            description: "Création d'un site web responsive avec CMS",
            quantity: 1,
            unitPrice: 2500,
            taxRate: 20,
        },
        {
            id: "item-2",
            name: "Maintenance mensuelle",
            description: "Maintenance technique et mises à jour de sécurité",
            quantity: 12,
            unitPrice: 150,
            taxRate: 20,
        },
        {
            id: "item-3",
            name: "Hébergement premium",
            description: "Hébergement haute disponibilité avec sauvegarde quotidienne",
            quantity: 1,
            unitPrice: 350,
            taxRate: 20,
        },
    ],
    createdAt: new Date(2023, 5, 15),
    dueDate: new Date(2023, 6, 15),
    status: "sent",
    discount: {
        type: "percentage",
        value: 10,
    },
    notes:
        "Ce devis est valable 30 jours à compter de sa date d'émission. Le paiement est dû dans les 15 jours suivant l'acceptation du devis.",
}

// Composant pour afficher le statut avec un badge
const StatusBadge = ({ status }: { status: DevisStatus }) => {
    const statusConfig = {
        draft: {
            label: "Brouillon",
            variant: "secondary" as const,
        },
        sent: {
            label: "Envoyé",
            variant: "default" as const,
        },
        accepted: {
            label: "Accepté",
            variant: "default" as const,
        },
        rejected: {
            label: "Refusé",
            variant: "destructive" as const,
        },
        converted: {
            label: "Converti en facture",
            variant: "outline" as const,
        },
    }

    const config = statusConfig[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
}

// Composant principal de la page de détail du devis
export default function DevisDetailPage({ id }: { id: string }) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [convertDialogOpen, setConvertDialogOpen] = useState(false)
    const devis = devisData // Dans une vraie application, vous récupéreriez le devis par son ID

    // Calculs financiers
    const calculateSubtotal = () => {
        return devis.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    }

    const calculateTaxes = () => {
        return devis.items.reduce((total, item) => total + (item.quantity * item.unitPrice * item.taxRate) / 100, 0)
    }

    const calculateDiscount = () => {
        if (!devis.discount) return 0
        const subtotal = calculateSubtotal()
        return devis.discount.type === "percentage" ? (subtotal * devis.discount.value) / 100 : devis.discount.value
    }

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTaxes() - calculateDiscount()
    }

    // Formater le montant en euros
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(amount)
    }

    // Gérer la suppression d'un devis
    const handleDeleteDevis = () => {
        setDeleteDialogOpen(true)
    }

    const confirmDeleteDevis = () => {
        // Logique de suppression ici
        console.log(`Devis ${devis.id} supprimé`)
        setDeleteDialogOpen(false)
        router.push("/devis") // Redirection vers la liste des devis
    }

    // Gérer la conversion en facture
    const handleConvertToInvoice = () => {
        setConvertDialogOpen(true)
    }

    const confirmConvertToInvoice = () => {
        // Logique de conversion ici
        console.log(`Devis ${devis.id} converti en facture`)
        setConvertDialogOpen(false)
        // Redirection vers la facture nouvellement créée
        // router.push(`/factures/${newInvoiceId}`)
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Bouton retour */}
                <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux devis
                </Button>
                {/* Contenu principal */}
                <Card className="w-full">
                    <CardContent className="p-6 sm:p-8">
                        {/* En-tête de la carte */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex flex-col gap-2">
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl font-bold tracking-tight"
                                >
                                    Devis #{devis.number}
                                </motion.h1>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={devis.status} />
                                    <span className="text-sm text-muted-foreground">
                                        Créé le {format(devis.createdAt, "dd MMMM yyyy", { locale: fr })}
                                    </span>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <Button variant="outline" size="sm" onClick={() => console.log("Modifier")}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => console.log("Dupliquer")}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Dupliquer
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => console.log("Imprimer")}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimer
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MoreHorizontal className="mr-2 h-4 w-4" />
                                            Plus
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleConvertToInvoice}>
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Convertir en facture
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => console.log("Télécharger PDF")}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Télécharger PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDeleteDevis}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Informations client et entreprise */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {/* Bloc client */}
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Client</h2>
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-medium">{devis.client.name}</div>
                                        <div className="text-sm text-muted-foreground">{devis.client.email}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div>{devis.client.address.street}</div>
                                        <div>
                                            {devis.client.address.postalCode} {devis.client.address.city}
                                        </div>
                                        <div>{devis.client.address.country}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloc entreprise */}
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Entreprise</h2>
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-medium">{devis.company.name}</div>
                                        <div className="text-sm text-muted-foreground">{devis.company.email}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div>{devis.company.address.street}</div>
                                        <div>
                                            {devis.company.address.postalCode} {devis.company.address.city}
                                        </div>
                                        <div>{devis.company.address.country}</div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium">TVA:</span> {devis.company.taxId}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Dates</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <span className="text-sm font-medium">Création:</span>{" "}
                                            <span className="text-sm">{format(devis.createdAt, "dd MMMM yyyy", { locale: fr })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <span className="text-sm font-medium">Échéance:</span>{" "}
                                            <span className="text-sm">{format(devis.dueDate, "dd MMMM yyyy", { locale: fr })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Tableau des produits */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-3">Produits et services</h2>
                            <ScrollArea className="w-full">
                                <div className="min-w-[600px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[300px]">Description</TableHead>
                                                <TableHead className="text-center">Quantité</TableHead>
                                                <TableHead className="text-right">Prix unitaire</TableHead>
                                                <TableHead className="text-right">TVA</TableHead>
                                                <TableHead className="text-right">Total HT</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {devis.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="align-top">
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-sm text-muted-foreground">{item.description}</div>
                                                    </TableCell>
                                                    <TableCell className="text-center align-top">{item.quantity}</TableCell>
                                                    <TableCell className="text-right align-top">{formatAmount(item.unitPrice)}</TableCell>
                                                    <TableCell className="text-right align-top">{item.taxRate}%</TableCell>
                                                    <TableCell className="text-right align-top">
                                                        {formatAmount(item.quantity * item.unitPrice)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Résumé financier */}
                            <div className="md:order-2">
                                <h2 className="text-lg font-semibold mb-3">Résumé</h2>
                                <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sous-total HT</span>
                                        <span>{formatAmount(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">TVA</span>
                                        <span>{formatAmount(calculateTaxes())}</span>
                                    </div>
                                    {devis.discount && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Remise
                                                {devis.discount.type === "percentage" ? ` (${devis.discount.value}%)` : ""}
                                            </span>
                                            <span>-{formatAmount(calculateDiscount())}</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium text-lg">
                                        <span>Total TTC</span>
                                        <span>{formatAmount(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {devis.notes && (
                                <div className="md:order-1">
                                    <h2 className="text-lg font-semibold mb-3">Notes</h2>
                                    <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">{devis.notes}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteDevis}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de conversion en facture */}
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convertir en facture</DialogTitle>
                        <DialogDescription>
                            Voulez-vous convertir ce devis en facture ? Une nouvelle facture sera créée avec les mêmes informations.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={confirmConvertToInvoice}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Convertir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

