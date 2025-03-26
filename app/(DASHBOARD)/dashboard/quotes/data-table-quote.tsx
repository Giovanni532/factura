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

// Types
type DevisStatus = "draft" | "sent" | "accepted" | "rejected" | "converted"
type Devis = {
    id: string
    number: string
    client: {
        name: string
        company?: string
    }
    createdAt: Date
    dueDate: Date
    amount: number
    status: DevisStatus
}

// Données de démonstration
const devisData: Devis[] = [
    {
        id: "1",
        number: "DEV-2023-001",
        client: {
            name: "Jean Dupont",
            company: "Dupont Consulting",
        },
        createdAt: new Date(2023, 5, 15),
        dueDate: new Date(2023, 6, 15),
        amount: 1250.0,
        status: "sent",
    },
    {
        id: "2",
        number: "DEV-2023-002",
        client: {
            name: "Marie Martin",
            company: "Martin Design",
        },
        createdAt: new Date(2023, 5, 20),
        dueDate: new Date(2023, 6, 20),
        amount: 3450.75,
        status: "accepted",
    },
    {
        id: "3",
        number: "DEV-2023-003",
        client: {
            name: "Pierre Lefebvre",
        },
        createdAt: new Date(2023, 6, 1),
        dueDate: new Date(2023, 7, 1),
        amount: 750.5,
        status: "draft",
    },
    {
        id: "4",
        number: "DEV-2023-004",
        client: {
            name: "Sophie Bernard",
            company: "Bernard & Associés",
        },
        createdAt: new Date(2023, 6, 10),
        dueDate: new Date(2023, 7, 10),
        amount: 5200.0,
        status: "converted",
    },
    {
        id: "5",
        number: "DEV-2023-005",
        client: {
            name: "Thomas Petit",
            company: "Petit Entreprise",
        },
        createdAt: new Date(2023, 6, 15),
        dueDate: new Date(2023, 7, 15),
        amount: 1800.25,
        status: "rejected",
    },
]

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

export default function DataTableQuote() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<DevisStatus | "all">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [devisToDelete, setDevisToDelete] = useState<string | null>(null)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const router = useRouter()

    const handlePageChange = (newPage: number) => {
        // Animation de sortie
        setCurrentPage(newPage)
    }

    // Filtrer les devis en fonction de la recherche et du statut
    const filteredDevis = devisData.filter((devis) => {
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
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(amount)
    }

    // Gérer la suppression d'un devis
    const handleDeleteDevis = (id: string) => {
        setDevisToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDeleteDevis = () => {
        // Logique de suppression ici
        console.log(`Devis ${devisToDelete} supprimé`)
        setDeleteDialogOpen(false)
        setDevisToDelete(null)
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
            <Button onClick={() => console.log("Créer un nouveau devis")}>
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
                        <Button size="default" onClick={() => console.log("Nouveau devis")}>
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
                                <SelectItem value="all">Tous les devis</SelectItem>
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="sent">Envoyé</SelectItem>
                                <SelectItem value="accepted">Accepté</SelectItem>
                                <SelectItem value="rejected">Refusé</SelectItem>
                                <SelectItem value="converted">Converti en facture</SelectItem>
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
                                <SelectItem value="all">Tous les devis</SelectItem>
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="sent">Envoyé</SelectItem>
                                <SelectItem value="accepted">Accepté</SelectItem>
                                <SelectItem value="rejected">Refusé</SelectItem>
                                <SelectItem value="converted">Converti en facture</SelectItem>
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
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => router.push(paths.dashboard.quotes.detail(devis.id))}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Voir
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => router.push(paths.dashboard.quotes.edit(devis.id))}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Modifier
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => console.log(`Dupliquer devis ${devis.id}`)}>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Dupliquer
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => console.log(`Télécharger devis ${devis.id}`)}>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Télécharger
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
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
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteDevis}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

