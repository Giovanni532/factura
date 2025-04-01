"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    Edit,
    Eye,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { paths } from "@/paths"
import { Quote, duplicateQuote, deleteQuote, getQuoteById } from "@/actions/quote"
import { useAction } from "@/hooks/use-action"
import { toast } from "sonner"
import { QuotePdfGenerator } from "@/components/quotes/quote-pdf-generator"
import { formatCurrency } from "@/lib/utils"

// Types
type DevisStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED"
type Devis = Quote

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

interface DataTableQuoteProps {
    quotes: Devis[]
}

export default function DataTableQuote({ quotes }: DataTableQuoteProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<DevisStatus | "all">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [devisToDelete, setDevisToDelete] = useState<string | null>(null)
    const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const router = useRouter()

    // Bind server actions with the useAction hook
    const { execute: executeDuplicate, isLoading: isDuplicating } = useAction<{ id: string }, any>(duplicateQuote as any, {
        onSuccess: (data) => {
            // Then safely access the quoteId property
            const quoteId = data?.quoteId || data?.data?.quoteId;

            if (quoteId) {
                toast.success("Devis dupliqué avec succès", {
                    description: `Vous pouvez modifier le devis dupliqué avec l'ID ${quoteId}`,
                });
                router.push(paths.dashboard.quotes.detail(quoteId));
            } else {
                toast.error("Erreur lors de la duplication du devis");
            }
            setDuplicatingId(null);
        },
        onError: (error) => {
            toast.error(error);
            setDuplicatingId(null);
        }
    });

    const { execute: executeDelete, isLoading: isDeleting } = useAction<{ id: string }, any>(deleteQuote as any, {
        onSuccess: (data) => {
            toast.success("Devis supprimé avec succès");
            setDeleteDialogOpen(false);
            setDevisToDelete(null);
            router.refresh(); // Refresh the page to show updated list
        },
        onError: (error) => {
            toast.error(error);
            setDeleteDialogOpen(false);
            setDevisToDelete(null);
        }
    });

    const { execute: executeGetQuote } = useAction<{ id: string }, any>(getQuoteById as any, {
        onSuccess: async (data) => {
            try {
                console.log("Raw data received:", data);
                console.log("Data structure:", Object.keys(data || {}));

                // Extraire les détails du devis quelle que soit la structure
                // La réponse peut être dans data.quote, data.data.quote ou directement dans data
                let quoteDetail = null;

                if (data?.quote) {
                    quoteDetail = data.quote;
                } else if (data?.data?.quote) {
                    quoteDetail = data.data.quote;
                } else if (data && typeof data === 'object' && 'id' in data && 'number' in data && 'items' in data) {
                    // Le devis est directement dans data
                    quoteDetail = data;
                }

                console.log("Extracted quote detail:", quoteDetail);

                if (!quoteDetail) {
                    toast.error("Impossible de récupérer les détails du devis");
                    setDownloadingPdfId(null);
                    return;
                }

                // Définir les fonctions de calcul
                const calculateSubtotal = () => {
                    return quoteDetail.items.reduce((total: number, item: any) =>
                        total + (item.quantity * item.unitPrice), 0);
                };

                const calculateTaxes = () => {
                    return quoteDetail.items.reduce((total: number, item: any) =>
                        total + ((item.quantity * item.unitPrice * item.taxRate) / 100), 0);
                };

                const calculateDiscount = () => {
                    if (!quoteDetail.discount) return 0;
                    const subtotal = calculateSubtotal();
                    return quoteDetail.discount.type === "percentage"
                        ? (subtotal * quoteDetail.discount.value) / 100
                        : quoteDetail.discount.value;
                };

                const calculateTotal = () => {
                    return calculateSubtotal() + calculateTaxes() - calculateDiscount();
                };

                // Générer et télécharger le PDF
                const pdfGenerator = new QuotePdfGenerator(
                    quoteDetail,
                    formatCurrency,
                    calculateSubtotal,
                    calculateTaxes,
                    calculateDiscount,
                    calculateTotal
                );

                toast.info("Finalisation du PDF...");
                await pdfGenerator.generateAndDownload();
                toast.success("PDF téléchargé avec succès");
            } catch (error) {
                console.error("Erreur détaillée lors du téléchargement du PDF:", error);
                toast.error("Échec du téléchargement du PDF. Veuillez réessayer.");
            } finally {
                setDownloadingPdfId(null);
            }
        },
        onError: (error) => {
            console.error("Erreur lors de la récupération des données:", error);
            toast.error("Impossible de récupérer les données du devis");
            setDownloadingPdfId(null);
        }
    });

    const handlePageChange = (newPage: number) => {
        // Animation de sortie
        setCurrentPage(newPage)
    }

    // Filtrer les devis en fonction de la recherche et du statut
    const filteredDevis = quotes.filter((devis) => {
        const matchesSearch =
            devis.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            devis.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (devis.client.company && devis.client.company.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === "all" || devis.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Pagination
    const totalPages = Math.ceil(filteredDevis.length / itemsPerPage)
    const paginatedDevis = filteredDevis.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Formater le montant en euros
    const formatAmount = (amount: number) => {
        return formatCurrency(amount)
    }

    // Gérer la duplication d'un devis
    const handleDuplicateQuote = (id: string) => {
        setDuplicatingId(id);
        executeDuplicate({ id });
    }

    // Gérer le téléchargement du PDF
    const handleDownloadPdf = (id: string) => {
        if (!id) {
            toast.error("ID de devis invalide");
            return;
        }

        setDownloadingPdfId(id);
        toast.info("Préparation du PDF...");

        try {
            // Petit délai pour éviter les problèmes de concurrence
            setTimeout(() => {
                executeGetQuote({ id });
            }, 200);
        } catch (error) {
            console.error("Erreur lors du lancement du téléchargement:", error);
            toast.error("Une erreur est survenue lors du téléchargement");
            setDownloadingPdfId(null);
        }
    }

    // Gérer la suppression d'un devis
    const handleDeleteDevis = (id: string) => {
        setDevisToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDeleteDevis = () => {
        if (devisToDelete) {
            executeDelete({ id: devisToDelete });
        }
    }

    // Composant pour l'état vide
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
        >
            <div className="bg-muted/40 p-4 rounded-full mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Aucun devis trouvé</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
                Vous n'avez pas encore créé de devis ou aucun devis ne correspond à vos critères de recherche.
            </p>
            <Button onClick={() => router.push(paths.dashboard.quotes.create)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un devis
            </Button>
        </motion.div>
    )

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold tracking-tight"
                    >
                        Devis
                    </motion.h1>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Button size="default" onClick={() => router.push(paths.dashboard.quotes.create)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau devis
                        </Button>
                    </motion.div>
                </div>

                {/* Filtres et recherche */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher par numéro, client..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Select pour mobile et tablette */}
                    <div className="md:hidden">
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DevisStatus | "all")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="all">Tous les devis</SelectItem>
                                <SelectItem className="cursor-pointer" value="DRAFT">Brouillon</SelectItem>
                                <SelectItem className="cursor-pointer" value="SENT">Envoyé</SelectItem>
                                <SelectItem className="cursor-pointer" value="ACCEPTED">Accepté</SelectItem>
                                <SelectItem className="cursor-pointer" value="REJECTED">Refusé</SelectItem>
                                <SelectItem className="cursor-pointer" value="CONVERTED">Converti en facture</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tabs pour desktop */}
                    <div className="hidden md:block">
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DevisStatus | "all")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="all">Tous les devis</SelectItem>
                                <SelectItem className="cursor-pointer" value="DRAFT">Brouillon</SelectItem>
                                <SelectItem className="cursor-pointer" value="SENT">Envoyé</SelectItem>
                                <SelectItem className="cursor-pointer" value="ACCEPTED">Accepté</SelectItem>
                                <SelectItem className="cursor-pointer" value="REJECTED">Refusé</SelectItem>
                                <SelectItem className="cursor-pointer" value="CONVERTED">Converti en facture</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tableau des devis */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle>Liste des devis</CardTitle>
                        <CardDescription>{filteredDevis.length} devis trouvés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {filteredDevis.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <motion.div
                                    key={`page-${currentPage}-${itemsPerPage}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-x-auto"
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Numéro</TableHead>
                                                <TableHead>Client</TableHead>
                                                <TableHead>Date de création</TableHead>
                                                <TableHead>Échéance</TableHead>
                                                <TableHead className="text-right">Montant</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedDevis.map((devis, index) => (
                                                <motion.tr
                                                    key={devis.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <TableCell className="font-medium">{devis.number}</TableCell>
                                                    <TableCell>
                                                        <div>{devis.client.name}</div>
                                                        {devis.client.company && (
                                                            <div className="text-sm text-muted-foreground">{devis.client.company}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{format(devis.createdAt, "dd MMM yyyy", { locale: fr })}</TableCell>
                                                    <TableCell>{format(devis.dueDate, "dd MMM yyyy", { locale: fr })}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatAmount(devis.amount)}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={devis.status} />
                                                    </TableCell>
                                                    <TableCell className="text-right cursor-pointer">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(paths.dashboard.quotes.detail(devis.id))}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Voir
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(paths.dashboard.quotes.edit(devis.id))}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Modifier
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleDuplicateQuote(devis.id)}
                                                                    disabled={duplicatingId === devis.id}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    {duplicatingId === devis.id ? "Duplication..." : "Dupliquer"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleDownloadPdf(devis.id)}
                                                                    disabled={downloadingPdfId === devis.id}
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    {downloadingPdfId === devis.id ? "Génération..." : "Télécharger PDF"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                                    onClick={() => handleDeleteDevis(devis.id)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination */}
                        {filteredDevis.length > 0 && (
                            <motion.div
                                className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">Lignes par page:</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(value) => {
                                            setItemsPerPage(Number(value))
                                            setCurrentPage(1) // Retour à la première page lors du changement
                                        }}
                                    >
                                        <SelectTrigger className="w-[80px] h-8">
                                            <SelectValue placeholder="5" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                        Affichage de {Math.min(filteredDevis.length, (currentPage - 1) * itemsPerPage + 1)} à{" "}
                                        {Math.min(filteredDevis.length, currentPage * itemsPerPage)} sur {filteredDevis.length} devis
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.div
                                        whileHover={{ scale: currentPage > 1 ? 1.05 : 1 }}
                                        whileTap={{ scale: currentPage > 1 ? 0.95 : 1 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <motion.div
                                                key={page}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 * page }}
                                            >
                                                <Button
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: currentPage < totalPages ? 1.05 : 1 }}
                                        whileTap={{ scale: currentPage < totalPages ? 0.95 : 1 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>

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
        </div>
    )
}
