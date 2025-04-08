"use client"

import React, { useState, useRef } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
    ArrowLeft,
    Download,
    Pencil,
    Copy,
    Printer,
    MoreHorizontal,
    Trash2,
    CheckCircle,
    AlertCircle,
    Clock,
    XCircle,
    Plus,
    Send
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { downloadInvoicePdf, deleteInvoice, addPayment, deletePayment, duplicateInvoice } from '@/actions/facture'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { cn, formatCurrency } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { paths } from '@/paths'

const paymentSchema = z.object({
    amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Le montant doit être un nombre positif"
    }),
    method: z.string().min(1, "Veuillez sélectionner une méthode de paiement"),
    paidAt: z.date()
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface InvoiceDetailProps {
    invoice: any;
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
    const router = useRouter()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: String(invoice.remainingAmount),
            method: "CARD",
            paidAt: new Date()
        }
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return (
                    <Badge className="bg-emerald-500 dark:bg-emerald-600 capitalize text-white">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Payée
                    </Badge>
                )
            case "OVERDUE":
                return (
                    <Badge className="bg-red-500 dark:bg-red-600 capitalize text-white">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        En retard
                    </Badge>
                )
            case "PENDING":
                return (
                    <Badge className="bg-amber-500 dark:bg-amber-600 capitalize text-white">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        En attente
                    </Badge>
                )
            case "CANCELED":
                return (
                    <Badge className="bg-slate-500 dark:bg-slate-600 capitalize text-white">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Annulée
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handleDuplicate = async () => {
        try {
            setIsDuplicating(true)
            const result = await duplicateInvoice({ id: invoice.id })

            if (result?.data?.success) {
                toast.success("Facture dupliquée avec succès")
                // Rediriger vers la nouvelle facture
                router.push(paths.dashboard.invoices.detail(result?.data?.invoice?.id))
            } else {
                toast.error("Erreur lors de la duplication de la facture")
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la duplication de la facture")
        } finally {
            setIsDuplicating(false)
        }
    }

    const handlePrint = async () => {
        try {
            setIsPrinting(true)
            const result = await downloadInvoicePdf({ id: invoice.id })

            if (result?.data?.success) {
                // Option 1: Téléchargement direct si l'API retourne un blob ou une URL de fichier
                if (result.data.pdfUrl) {
                    // Créer un iframe invisible pour charger et imprimer le PDF
                    if (iframeRef.current) {
                        iframeRef.current.src = result.data.pdfUrl
                        iframeRef.current.onload = () => {
                            try {
                                iframeRef.current?.contentWindow?.print()
                            } catch (e) {
                                // Fallback: ouvrir dans un nouvel onglet si l'impression directe échoue
                                window.open(result?.data?.pdfUrl, '_blank')
                            }
                            setIsPrinting(false)
                        }
                    } else {
                        // Fallback: ouvrir dans un nouvel onglet
                        window.open(result.data.pdfUrl, '_blank')
                        setIsPrinting(false)
                    }

                    toast.success("Facture prête pour impression")
                } else {
                    toast.error("Erreur lors de la génération du PDF")
                    setIsPrinting(false)
                }
            } else {
                toast.error(result?.data?.message || "Erreur lors de la génération du PDF")
                setIsPrinting(false)
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'impression de la facture")
            setIsPrinting(false)
        }
    }

    const handleDownload = async () => {
        try {
            const result = await downloadInvoicePdf({ id: invoice.id })

            if (result?.data?.success && result?.data?.pdfUrl) {
                // Créer un élément a temporaire pour le téléchargement
                const a = document.createElement('a')
                a.href = result?.data?.pdfUrl
                a.download = result?.data?.fileName || `Facture_${invoice.number}.pdf`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)

                toast.success("Téléchargement du PDF réussi")
            } else {
                toast.error(result?.data?.message || "Erreur lors du téléchargement du PDF")
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur lors du téléchargement de la facture")
        }
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteInvoice({ id: invoice.id })
            toast.success("Facture supprimée avec succès!")
            router.push(paths.dashboard.invoices.list)
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression de la facture")
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    const handleAddPayment = async (data: PaymentFormData) => {
        toast.promise(
            addPayment({
                invoiceId: invoice.id,
                amount: Number(data.amount),
                method: data.method,
                paidAt: data.paidAt
            }),
            {
                loading: "Enregistrement du paiement...",
                success: () => {
                    setIsPaymentDialogOpen(false)
                    form.reset()
                    router.refresh()
                    return "Paiement enregistré avec succès!"
                },
                error: (err) => err.message || "Erreur lors de l'enregistrement du paiement"
            }
        )
    }

    const handleDeletePayment = async (paymentId: string) => {
        toast.promise(
            deletePayment({ id: paymentId }),
            {
                loading: "Suppression du paiement...",
                success: () => {
                    setDeletingPaymentId(null)
                    router.refresh()
                    return "Paiement supprimé avec succès!"
                },
                error: "Erreur lors de la suppression du paiement"
            }
        )
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Retour */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Button
                        variant="ghost"
                        className="pl-0 flex items-center gap-2 text-foreground"
                        onClick={() => router.push(paths.dashboard.invoices.list)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux factures
                    </Button>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-background rounded-lg border shadow-sm p-8"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold">Facture #{invoice.number}</h1>
                                {getStatusBadge(invoice.status)}
                            </div>
                            <p className="text-muted-foreground">
                                Créée le {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(paths.dashboard.invoices.edit(invoice.id))}
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDuplicate}
                                disabled={isDuplicating}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {isDuplicating ? "Duplication..." : "Dupliquer"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={isPrinting}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                {isPrinting ? "Préparation..." : "Imprimer"}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                    >
                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                        <span>
                                            Plus
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setIsPaymentDialogOpen(true)} disabled={invoice.isPaid || invoice.status === "CANCELED"}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter un paiement
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Send className="h-4 w-4 mr-2" />
                                        Envoyer par email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Client et entreprise */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-1">
                            <h2 className="font-semibold text-lg mb-2">Client</h2>
                            <p className="font-medium">{invoice.client.name}</p>
                            {invoice.client.email && <p>{invoice.client.email}</p>}
                            {invoice.client.company && <p>{invoice.client.company}</p>}
                            {invoice.client.address && (
                                <p>
                                    {invoice.client.address}
                                    {invoice.client.city && `, ${invoice.client.city}`}
                                </p>
                            )}
                            {invoice.client.postalCode && invoice.client.country && (
                                <p>{invoice.client.postalCode}, {invoice.client.country}</p>
                            )}
                        </div>

                        {invoice.business && (
                            <div className="space-y-1">
                                <h2 className="font-semibold text-lg mb-2">Entreprise</h2>
                                <p className="font-medium">{invoice.business.name}</p>
                                {invoice.business.email && <p>{invoice.business.email}</p>}
                                <p>
                                    {invoice.business.address}
                                    {invoice.business.city && `, ${invoice.business.city}`}
                                </p>
                                <p>{invoice.business.postalCode}, {invoice.business.country}</p>
                                {invoice.business.taxId && <p>TVA: {invoice.business.taxId}</p>}
                            </div>
                        )}

                        <div className="space-y-1">
                            <h2 className="font-semibold text-lg mb-2">Dates</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Création:</span>
                                <span>{format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Échéance:</span>
                                <span>{format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: fr })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Produits et services */}
                    <div className="mb-8">
                        <h2 className="font-semibold text-lg mb-4">Produits et services</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2 text-left font-medium">Description</th>
                                        <th className="py-2 text-center font-medium">Quantité</th>
                                        <th className="py-2 text-right font-medium">Prix unitaire</th>
                                        <th className="py-2 text-right font-medium">TVA</th>
                                        <th className="py-2 text-right font-medium">Total HT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item: any) => (
                                        <tr key={item.id} className="border-b border-border">
                                            <td className="py-3">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.description && (
                                                        <p className="text-muted-foreground text-sm">{item.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">{item.quantity}</td>
                                            <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                            <td className="py-3 text-right">{invoice.vatRate || 20}%</td>
                                            <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Résumé */}
                    <div>
                        <h2 className="font-semibold text-lg mb-4">Résumé</h2>
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">Sous-total HT</span>
                                    <span className="font-medium">{formatCurrency(invoice.totalHT || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">TVA ({invoice.vatRate || 20}%)</span>
                                    <span className="font-medium">{formatCurrency(invoice.vatAmount || 0)}</span>
                                </div>
                                {invoice.status === "PAID" ? (
                                    <>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between py-1">
                                            <span className="font-medium">Total TTC</span>
                                            <span className="font-bold">{formatCurrency(invoice.total)}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-muted-foreground">Payé</span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.paidAmount)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {invoice.paidAmount > 0 && (
                                            <div className="flex justify-between py-1">
                                                <span className="text-muted-foreground">Payé</span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.paidAmount)}</span>
                                            </div>
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between py-1">
                                            <span className="font-medium">Total TTC</span>
                                            <span className="font-bold">{formatCurrency(invoice.total)}</span>
                                        </div>
                                        {invoice.paidAmount > 0 && (
                                            <div className="flex justify-between py-1">
                                                <span className="font-medium">Reste à payer</span>
                                                <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(invoice.remainingAmount)}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Paiements (si présents) */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <div className="mt-8">
                            <h2 className="font-semibold text-lg mb-4">Historique des paiements</h2>
                            <div className="space-y-2">
                                {invoice.payments.map((payment: any) => (
                                    <div key={payment.id} className="flex justify-between items-center border-b border-border pb-2">
                                        <div>
                                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(payment.paidAt), 'dd/MM/yyyy')} · {getPaymentMethod(payment.method)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeletingPaymentId(payment.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* IFrame invisible pour l'impression */}
            <iframe
                ref={iframeRef}
                style={{ display: 'none' }}
                title="Impression de facture"
            />

            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. La facture sera définitivement supprimée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete payment confirmation dialog */}
            <AlertDialog
                open={deletingPaymentId !== null}
                onOpenChange={(open) => !open && setDeletingPaymentId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action supprimera le paiement et mettra à jour le statut de la facture.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingPaymentId && handleDeletePayment(deletingPaymentId)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add payment dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ajouter un paiement</DialogTitle>
                        <DialogDescription>
                            Enregistrer un nouveau paiement pour cette facture.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleAddPayment)}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Montant</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    {...form.register("amount")}
                                />
                                {form.formState.errors.amount && (
                                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="method">Méthode de paiement</Label>
                                <Select
                                    onValueChange={(value) => form.setValue("method", value)}
                                    defaultValue={form.getValues("method")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une méthode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CARD">Carte bancaire</SelectItem>
                                        <SelectItem value="CASH">Espèces</SelectItem>
                                        <SelectItem value="TRANSFER">Virement</SelectItem>
                                        <SelectItem value="CHECK">Chèque</SelectItem>
                                        <SelectItem value="OTHER">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.method && (
                                    <p className="text-sm text-destructive">{form.formState.errors.method.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paidAt">Date de paiement</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.getValues("paidAt") ? (
                                                format(form.getValues("paidAt"), "dd/MM/yyyy")
                                            ) : (
                                                <span>Sélectionner une date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={form.getValues("paidAt")}
                                            onSelect={(date) => date && form.setValue("paidAt", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {form.formState.errors.paidAt && (
                                    <p className="text-sm text-destructive">{form.formState.errors.paidAt.message}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function getPaymentMethod(method: string) {
    switch (method) {
        case "CARD": return "Carte bancaire";
        case "CASH": return "Espèces";
        case "TRANSFER": return "Virement";
        case "CHECK": return "Chèque";
        case "OTHER": return "Autre";
        default: return method;
    }
} 