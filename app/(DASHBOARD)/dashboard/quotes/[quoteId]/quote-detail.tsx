"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArrowLeft, Calendar, Copy, Download, Edit, MoreHorizontal, Printer, Receipt, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
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
import { paths } from "@/paths"
import { duplicateQuote, deleteQuote, convertQuoteToInvoice } from "@/actions/quote"
import { useAction } from "@/hooks/use-action"
import { QuotePdfGenerator } from "@/components/quotes/quote-pdf-generator"
import { QuotePrintService } from "@/components/quotes/quote-print-service"
import { formatCurrency } from "@/lib/utils"
import { QuoteStatus, QuoteDetail } from "@/app/(API)/api/dashboard/quotes/route"
// Types
type DevisStatus = QuoteStatus

// Types for server action results
interface ActionResult {
    success: boolean;
    message: string;
}

interface ConvertToInvoiceResult extends ActionResult {
    invoiceId?: string;
}

// Composant pour afficher le statut avec un badge
const StatusBadge = ({ status }: { status: DevisStatus }) => {
    const statusConfig = {
        DRAFT: {
            label: "Brouillon",
            variant: "secondary" as const,
        },
        SENT: {
            label: "Envoyé",
            variant: "default" as const,
        },
        ACCEPTED: {
            label: "Accepté",
            variant: "default" as const,
        },
        REJECTED: {
            label: "Refusé",
            variant: "destructive" as const,
        },
        CONVERTED: {
            label: "Converti en facture",
            variant: "outline" as const,
        },
    }

    const config = statusConfig[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
}

// Composant principal de la page de détail du devis
export default function QuoteDetailPage({ quote }: { quote: QuoteDetail }) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [convertDialogOpen, setConvertDialogOpen] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // Print styles
    useEffect(() => {
        // Add print styles to head
        const styleElement = document.createElement('style');
        styleElement.setAttribute('media', 'print');
        styleElement.innerHTML = `
            @page { size: A4; margin: 1.5cm; }
            body * { visibility: hidden; }
            .print-content, .print-content * { visibility: visible; }
            .print-content { position: absolute; left: 0; top: 0; width: 100%; }
            .print-hidden { display: none !important; }
            
            /* Reset some UI styles for print */
            .card { box-shadow: none !important; border: none !important; }
            .badge { border: 1px solid #ddd !important; padding: 2px 6px !important; }
            
            /* Improve table appearance */
            table { border-collapse: collapse; width: 100%; }
            th, td { padding: 8px; border-bottom: 1px solid #ddd; }
            th { font-weight: bold; text-align: left; }
            
            /* Let content flow naturally */
            @page { margin: 1.5cm; }
            html, body { height: auto; }
            .print-content { position: static; }
            
            /* Ensure table doesn't break across pages */
            .table { page-break-inside: avoid; }
            
            /* Add page breaks where needed */
            .page-break-after { page-break-after: always; }
        `;
        document.head.appendChild(styleElement);

        // Clean up
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Bind server actions with the useAction hook
    const { execute: executeDuplicate, isLoading: isDuplicating } = useAction<{ id: string }, any>(duplicateQuote as any, {
        onSuccess: (data) => {
            // Then safely access the quoteId property
            const quoteId = data?.quoteId || data?.data?.quoteId;

            if (quoteId) {
                toast.success("Devis dupliqué avec succès", {
                    description: `Vous pouvez désormais modifier le devis dupliqué avec l'ID ${quoteId}`,
                });
                router.push(paths.dashboard.quotes.detail(quoteId));
            } else {
                toast.error("Erreur lors de la duplication du devis");
            }
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const { execute: executeDelete, isLoading: isDeleting } = useAction<{ id: string }, ActionResult>(deleteQuote as any, {
        onSuccess: (_data) => {
            toast.success("Devis supprimé avec succès");
            setDeleteDialogOpen(false);
            router.push(paths.dashboard.quotes.list);
        },
        onError: (error) => {
            toast.error(error);
            setDeleteDialogOpen(false);
        }
    });

    const { execute: executeConvert, isLoading: isConverting } = useAction<{ id: string }, ConvertToInvoiceResult>(convertQuoteToInvoice as any, {
        onSuccess: (_data) => {
            toast.success("Devis converti en facture avec succès");
            setConvertDialogOpen(false);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error);
            setConvertDialogOpen(false);
        }
    });

    // Calculs financiers
    const calculateSubtotal = () => {
        return quote.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    }

    const calculateTaxes = () => {
        return quote.items.reduce((total, item) => total + (item.quantity * item.unitPrice * item.taxRate) / 100, 0)
    }

    const calculateDiscount = () => {
        if (!quote.discount) return 0
        const subtotal = calculateSubtotal()
        return quote.discount.type === "percentage" ? (subtotal * quote.discount.value) / 100 : quote.discount.value
    }

    // Remplacer par une fonction qui renvoie toujours le total du serveur
    const getServerTotal = () => {
        return quote.total;
    }

    // Formater le montant en euros
    const formatAmount = (amount: number) => {
        return formatCurrency(amount)
    }

    // Gérer la duplication d'un devis
    const handleDuplicateQuote = () => {
        executeDuplicate({ id: quote.id });
    }

    // Gérer l'impression d'un devis avec une meilleure mise en page
    const handlePrintQuote = async () => {
        const printService = new QuotePrintService(quote, formatAmount, calculateSubtotal, calculateTaxes, calculateDiscount, getServerTotal);
        printService.print(contentRef.current);
    };

    // Gérer le téléchargement du PDF avec jsPDF
    const handleDownloadPdf = async () => {
        toast.info("Génération du PDF en cours...");
        try {
            const pdfGenerator = new QuotePdfGenerator(quote, formatAmount, calculateSubtotal, calculateTaxes, calculateDiscount, getServerTotal);
            await pdfGenerator.generateAndDownload();
            toast.success("PDF généré avec succès");
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            toast.error("Erreur lors de la génération du PDF");
        }
    };

    // Gérer la suppression d'un devis
    const handleDeleteDevis = () => {
        setDeleteDialogOpen(true)
    }

    const confirmDeleteDevis = () => {
        executeDelete({ id: quote.id });
    }

    // Gérer la conversion en facture
    const handleConvertToInvoice = () => {
        setConvertDialogOpen(true)
    }

    const confirmConvertToInvoice = () => {
        executeConvert({ id: quote.id });
    }

    // Vérifier si le devis peut être converti
    const canBeConverted = quote.status !== "CONVERTED";
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Bouton retour */}
                <Button variant="ghost" size="sm" className="w-fit print-hidden" onClick={() => router.push(paths.dashboard.quotes.list)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux devis
                </Button>
                {/* Contenu principal */}
                <Card className="w-full">
                    <CardContent className="p-6 sm:p-8" ref={contentRef}>
                        {/* En-tête de la carte */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex flex-col gap-2">
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl font-bold tracking-tight"
                                >
                                    Devis #{quote.number}
                                </motion.h1>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={quote.status} />
                                    <span className="text-sm text-muted-foreground">
                                        Créé le {format(quote.createdAt, "dd MMMM yyyy", { locale: fr })}
                                    </span>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-wrap gap-2 sm:justify-end print-hidden">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(paths.dashboard.quotes.edit(quote.id))}
                                    disabled={quote.status === "CONVERTED"}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDuplicateQuote}
                                    disabled={isDuplicating}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    {isDuplicating ? "Duplication..." : "Dupliquer"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handlePrintQuote}>
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
                                        {canBeConverted && (
                                            <DropdownMenuItem onClick={handleConvertToInvoice} disabled={isConverting}>
                                                <Receipt className="mr-2 h-4 w-4" />
                                                {isConverting ? "Conversion..." : "Convertir en facture"}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={handleDownloadPdf}>
                                            <Download className="mr-2 h-4 w-4" />
                                            {"Télécharger PDF"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={handleDeleteDevis}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {isDeleting ? "Suppression..." : "Supprimer"}
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
                                        <div className="font-medium">{quote.client.name}</div>
                                        <div className="text-sm text-muted-foreground">{quote.client.email}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div>{quote.client.address.street}</div>
                                        <div>
                                            {quote.client.address.postalCode}, {quote.client.address.city}
                                        </div>
                                        <div>{quote.client.address.country}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloc entreprise */}
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Entreprise</h2>
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-medium">{quote.company.name}</div>
                                        <div className="text-sm text-muted-foreground">{quote.company.email}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div>{quote.company.address.street}</div>
                                        <div>
                                            {quote.company.address.postalCode}, {quote.company.address.city}
                                        </div>
                                        <div>{quote.company.address.country}</div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium">TVA:</span> {quote.company.taxId}
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
                                            <span className="text-sm">{format(quote.createdAt, "dd MMMM yyyy", { locale: fr })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <span className="text-sm font-medium">Échéance:</span>{" "}
                                            <span className="text-sm">{format(quote.dueDate, "dd MMMM yyyy", { locale: fr })}</span>
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
                                            {quote.items.map((item) => (
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
                                    {quote.discount?.type && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Remise
                                                {quote.discount.type === "percentage" ? ` (${quote.discount.value}%)` : ""}
                                            </span>
                                            <span>-{formatAmount(calculateDiscount())}</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium text-lg">
                                        <span>Total TTC</span>
                                        <span>{formatAmount(quote.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {quote.notes && (
                                <div className="md:order-1">
                                    <h2 className="text-lg font-semibold mb-3">Notes</h2>
                                    <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">{quote.notes}</div>
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
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteDevis} disabled={isDeleting}>
                            {isDeleting ? "Suppression..." : "Supprimer"}
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
                        <Button variant="outline" onClick={() => setConvertDialogOpen(false)} disabled={isConverting}>
                            Annuler
                        </Button>
                        <Button onClick={confirmConvertToInvoice} disabled={isConverting}>
                            <Receipt className="mr-2 h-4 w-4" />
                            {isConverting ? "Conversion..." : "Convertir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

