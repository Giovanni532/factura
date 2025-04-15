"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
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
    Eye,
    Edit,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Star,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { deleteTemplate, setDefaultTemplate } from '@/actions/template'
import { paths } from '@/paths'
import { toast } from 'sonner'
import { Template } from '@prisma/client'

// Type pour les filtres de type de template
type TemplateType = "BOTH" | "INVOICE" | "QUOTE";

// Mapping des types pour l'affichage
const typeLabels: Record<string, { label: string, color: string }> = {
    BOTH: { label: "Tous les types", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    INVOICE: { label: "Facture", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    QUOTE: { label: "Devis", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
};

// Composant pour afficher le badge de type
function TypeBadge({ type }: { type: string }) {
    const { label, color } = typeLabels[type as keyof typeof typeLabels] ||
        { label: "Inconnu", color: "bg-gray-100 text-gray-800" };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

// Composant à afficher quand il n'y a pas de templates
function EmptyState() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
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
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun template trouvé</h3>
            <p className="text-muted-foreground mb-6">
                Vous n&apos;avez pas encore créé de templates ou aucun template ne correspond à votre recherche.
            </p>
            <Button onClick={() => router.push(paths.dashboard.templates.create)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un nouveau template
            </Button>
        </div>
    );
}

export default function DataTableTemplate({ templates: initialTemplates }: { templates: Template[] }) {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSettingDefault, setIsSettingDefault] = useState(false);
    const [templateToDeleteId, setTemplateToDeleteId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<TemplateType>("BOTH");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Mettre à jour les templates quand les données initiales changent
    useEffect(() => {
        setTemplates(initialTemplates);
    }, [initialTemplates]);

    // Filtrer les templates selon la recherche et le type
    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            // Filtre de recherche
            const matchesSearch = searchQuery === '' ||
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()));

            // Filtre de type
            const matchesType = typeFilter === "BOTH" || template.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [templates, searchQuery, typeFilter]);

    // Calculer le nombre total de pages
    const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / itemsPerPage));

    // Obtenir les templates pour la page courante
    const paginatedTemplates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTemplates.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTemplates, currentPage, itemsPerPage]);

    // Gérer le changement de page
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Gérer la suppression d'un template
    const handleDeleteTemplate = (id: string) => {
        setTemplateToDeleteId(id);
        setDeleteDialogOpen(true);
    };

    // Confirmer la suppression
    const confirmDeleteTemplate = async () => {
        if (!templateToDeleteId) return;

        try {
            setIsDeleting(true);
            const result = await deleteTemplate({ id: templateToDeleteId });

            if (result && typeof result === 'object' && result.data && result.data.success) {
                setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== templateToDeleteId));
                toast.success("Template supprimé avec succès");
            } else {
                const errorMessage = result?.data?.error && typeof result?.data === 'object' && 'error' in result?.data
                    ? String(result.data.error)
                    : "Erreur lors de la suppression du template";
                toast.error(errorMessage);
            }
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Erreur lors de la suppression du template:", error);
            toast.error("Une erreur s'est produite lors de la suppression");
        } finally {
            setIsDeleting(false);
            setTemplateToDeleteId(null);
        }
    };

    // Définir un template comme défaut
    const handleSetAsDefault = async (id: string) => {
        try {
            setIsSettingDefault(true);
            const result = await setDefaultTemplate({ id });
            if (result && typeof result === 'object' && result.data && result.data.success) {
                // Récupérer le type du template qu'on vient de définir comme défaut
                // à partir de l'état actuel puisque le résultat peut ne pas inclure toutes les données
                const updatedTemplateType = templates.find(t => t.id === id)?.type;

                if (updatedTemplateType) {
                    // Mettre à jour l'état local des templates
                    setTemplates(prevTemplates =>
                        prevTemplates.map(template => ({
                            ...template,
                            isDefault: template.id === id ? true :
                                template.type === updatedTemplateType ? false : template.isDefault
                        }))
                    );
                }

                toast.success("Template défini comme modèle par défaut");
            } else {
                const errorMessage = result?.data?.error && typeof result?.data === 'object' && 'error' in result?.data
                    ? String(result.data.error)
                    : "Erreur lors de la définition comme modèle par défaut";
                toast.error(errorMessage);
            }
        } catch (_error) {
            toast.error("Une erreur s'est produite");
        } finally {
            setIsSettingDefault(false);
        }
    };

    // Voir les détails d'un template
    const handleViewDetails = (id: string) => {
        router.push(paths.dashboard.templates.detail(id));
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Templates
                    </h1>
                    <Button size="default" onClick={() => router.push(paths.dashboard.templates.create)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau template
                    </Button>
                </div>

                {/* Filtres et recherche */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher des templates..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Revenir à la première page lors d'une recherche
                            }}
                        />
                    </div>
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => {
                            setTypeFilter(value as TemplateType);
                            setCurrentPage(1); // Revenir à la première page lors d'un changement de filtre
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrer par type" />
                        </SelectTrigger>
                        <SelectContent className="cursor-pointer">
                            <SelectItem value="BOTH" className="cursor-pointer">Tous les types</SelectItem>
                            <SelectItem value="INVOICE" className="cursor-pointer">Factures</SelectItem>
                            <SelectItem value="QUOTE" className="cursor-pointer">Devis</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tableau des templates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vos templates</CardTitle>
                        <CardDescription>
                            Gérez vos templates de factures et devis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredTemplates.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Date de création</TableHead>
                                            <TableHead>Par défaut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTemplates.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">{template.name}</TableCell>
                                                <TableCell>
                                                    <TypeBadge type={template.type} />
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(template.createdAt), 'dd MMMM yyyy', { locale: fr })}
                                                </TableCell>
                                                <TableCell>
                                                    {template.isDefault ? (
                                                        <span className="flex items-center">
                                                            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                                            Oui
                                                        </span>
                                                    ) : "Non"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Ouvrir le menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewDetails(template.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Modifier
                                                            </DropdownMenuItem>
                                                            {!template.isDefault && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleSetAsDefault(template.id)}
                                                                    disabled={isSettingDefault}
                                                                >
                                                                    <Star className="mr-2 h-4 w-4" />
                                                                    Définir par défaut
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteTemplate(template.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Supprimer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center space-x-6 mt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Précédent
                                        </Button>
                                        <span className="text-sm">
                                            Page {currentPage} sur {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Suivant
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialogue de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteTemplate}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 