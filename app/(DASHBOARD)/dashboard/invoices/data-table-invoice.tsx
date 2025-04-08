"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    DialogTitle
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Download,
    Eye,
    Edit,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { Invoice, deleteInvoice } from '@/actions/facture'
import { paths } from '@/paths'
import { InvoicePdfGenerator } from '@/components/invoices/invoice-pdf-generator'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { getInvoiceById } from '@/actions/facture'

// Mapping des statuts pour l'affichage
const statusLabels: Record<string, { label: string, color: string }> = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    paid: { label: "Payée", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    overdue: { label: "En retard", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    canceled: { label: "Annulée", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" }
};

// Type pour les statuts des factures
type InvoiceStatus = "pending" | "paid" | "overdue" | "canceled" | "all";

// Composant pour afficher le badge de statut
function StatusBadge({ status }: { status: string }) {
    const { label, color } = statusLabels[status as keyof typeof statusLabels] ||
        { label: "Inconnu", color: "bg-gray-100 text-gray-800" };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

// Formater le montant en euros
function formatAmount(amount: number) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Composant à afficher quand il n'y a pas de factures
function EmptyState() {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="rounded-full bg-muted p-6 mb-4">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                >
                    <svg
                        className="h-10 w-10 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </motion.div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune facture trouvée</h3>
            <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore créé de factures ou aucune facture ne correspond à votre recherche.
            </p>
            <Button onClick={() => router.push(paths.dashboard.invoices.create)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une nouvelle facture
            </Button>
        </motion.div>
    );
}

export default function DataTableInvoice({ invoices: initialInvoices }: { invoices: Invoice[] }) {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [isDeleting, setIsDeleting] = useState(false);
    const [invoiceToDeleteId, setInvoiceToDeleteId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
    const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Mettre à jour les factures quand les données initiales changent
    useEffect(() => {
        setInvoices(initialInvoices);
    }, [initialInvoices]);

    // Filtrer les factures selon la recherche et le statut
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            // Filtre de recherche
            const matchesSearch = searchQuery === '' ||
                invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (invoice.client.company && invoice.client.company.toLowerCase().includes(searchQuery.toLowerCase()));

            // Filtre de statut
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, statusFilter]);

    // Calculer le nombre total de pages
    const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));

    // Obtenir les factures pour la page courante
    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInvoices, currentPage, itemsPerPage]);

    // Gérer le changement de page
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Gérer la suppression d'une facture
    const handleDeleteInvoice = (id: string) => {
        setInvoiceToDeleteId(id);
        setDeleteDialogOpen(true);
    };

    // Confirmer la suppression
    const confirmDeleteInvoice = async () => {
        if (!invoiceToDeleteId) return;

        try {
            setIsDeleting(true);
            await deleteInvoice({ id: invoiceToDeleteId });
            setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== invoiceToDeleteId));
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Erreur lors de la suppression de la facture:", error);
        } finally {
            setIsDeleting(false);
            setInvoiceToDeleteId(null);
        }
    };

    // Gérer le téléchargement du PDF
    const handleDownloadPdf = (id: string) => {
        try {
            setDownloadingPdfId(id);

            // Rediriger vers la page de détail avec un paramètre pour télécharger le PDF
            // Cette approche utilise le composant invoice-detail.tsx qui a déjà la logique de génération de PDF
            window.open(`${paths.dashboard.invoices.detail(id)}?download=true`, '_blank');

            // Réinitialiser l'état après un petit délai
            setTimeout(() => {
                setDownloadingPdfId(null);
            }, 1000);
        } catch (error) {
            console.error("Erreur lors de l'ouverture du PDF:", error);
            toast.error("Erreur lors de l'ouverture du PDF");
            setDownloadingPdfId(null);
        }
    };

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
                        Factures
                    </motion.h1>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="default" onClick={() => router.push(paths.dashboard.invoices.create)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle facture
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

                    {/* Select pour filtrer par statut */}
                    <div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="all">Toutes les factures</SelectItem>
                                <SelectItem className="cursor-pointer" value="pending">En attente</SelectItem>
                                <SelectItem className="cursor-pointer" value="paid">Payées</SelectItem>
                                <SelectItem className="cursor-pointer" value="overdue">En retard</SelectItem>
                                <SelectItem className="cursor-pointer" value="canceled">Annulées</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tableau des factures */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle>Liste des factures</CardTitle>
                        <CardDescription>{filteredInvoices.length} factures trouvées</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {filteredInvoices.length === 0 ? (
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
                                            {paginatedInvoices.map((invoice, index) => (
                                                <motion.tr
                                                    key={invoice.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <TableCell className="font-medium">{invoice.number}</TableCell>
                                                    <TableCell>
                                                        <div>{invoice.client.name}</div>
                                                        {invoice.client.company && (
                                                            <div className="text-sm text-muted-foreground">{invoice.client.company}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{format(invoice.createdAt, "dd MMM yyyy", { locale: fr })}</TableCell>
                                                    <TableCell>{format(invoice.dueDate, "dd MMM yyyy", { locale: fr })}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatAmount(invoice.amount)}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={invoice.status} />
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
                                                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(paths.dashboard.invoices.detail(invoice.id))}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Voir
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(paths.dashboard.invoices.edit(invoice.id))}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Modifier
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleDownloadPdf(invoice.id)}
                                                                    disabled={downloadingPdfId === invoice.id}
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    {downloadingPdfId === invoice.id ? "Génération..." : "Télécharger PDF"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                                    onClick={() => handleDeleteInvoice(invoice.id)}
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
                        {filteredInvoices.length > 0 && (
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
                                        Affichage de {Math.min(filteredInvoices.length, (currentPage - 1) * itemsPerPage + 1)} à{" "}
                                        {Math.min(filteredInvoices.length, currentPage * itemsPerPage)} sur {filteredInvoices.length} factures
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
                            Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteInvoice} disabled={isDeleting}>
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 