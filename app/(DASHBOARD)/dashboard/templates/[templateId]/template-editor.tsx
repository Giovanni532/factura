"use client"

import React, { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Template } from '@prisma/client'
import { useAction } from '@/hooks/use-action'
import { updateTemplate } from '@/actions/template'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChevronLeft, Save, Eye, FileEdit, Palette, PenTool } from 'lucide-react'
import { paths } from '@/paths'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type TemplateEditorProps = {
    template: Template
}

// Dimensions d'une feuille A4 en pixels (à 96dpi)
const A4_WIDTH = 795; // 210mm
const A4_HEIGHT = 1123; // 297mm

export default function TemplateEditor({ template }: TemplateEditorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isEditorMode = searchParams.get('editor') !== null
    const [isPending, startTransition] = useTransition()

    // État local pour les champs du formulaire
    const [name, setName] = useState(template.name)
    const [description, setDescription] = useState(template.description || '')
    const [type, setType] = useState<"INVOICE" | "QUOTE" | "BOTH">(template.type as "INVOICE" | "QUOTE" | "BOTH")
    const [content, setContent] = useState(template.content)
    const [isDefault, setIsDefault] = useState(template.isDefault)

    // État pour les couleurs
    const [selectedColor, setSelectedColor] = useState('#0f766e')

    // Options de couleurs
    const colorOptions = [
        { name: 'Teal', value: '#0f766e' },
        { name: 'Blue', value: '#1e40af' },
        { name: 'Purple', value: '#6b21a8' },
        { name: 'Red', value: '#b91c1c' },
        { name: 'Green', value: '#15803d' },
        { name: 'Orange', value: '#c2410c' },
        { name: 'Gray', value: '#4b5563' },
        { name: 'Pink', value: '#db2777' },
        { name: 'Yellow', value: '#d97706' },
    ]

    // Extraire la couleur du template au chargement initial
    useEffect(() => {
        try {
            const jsonContent = JSON.parse(content);
            if (jsonContent && typeof jsonContent === 'object' && jsonContent.color) {
                setSelectedColor(jsonContent.color);
            }
        } catch (e) {
            // Si ce n'est pas du JSON valide, on continue avec la couleur par défaut
        }
    }, [content]);

    // Rediriger vers l'éditeur visuel avancé
    const redirectToVisualEditor = () => {
        // Stocker l'ID du template dans les params
        router.push(`/dashboard/templates/editor?templateId=${template.id}`);
    };

    // Activer/désactiver le mode éditeur
    const toggleEditorMode = () => {
        if (isEditorMode) {
            router.push(`/dashboard/templates/${template.id}`);
        } else {
            router.push(`/dashboard/templates/${template.id}?editor`);
        }
    };

    // Remplacer les variables {{var}} par des valeurs de test
    const renderPreview = useCallback((htmlContent: string) => {
        let content = htmlContent;

        // Vérifier si le contenu est un JSON valide
        try {
            const jsonContent = JSON.parse(content);

            // Si c'est un JSON avec une structure spécifique (elements, color, etc.)
            if (jsonContent && typeof jsonContent === 'object') {
                // Si c'est un template créé avec l'éditeur avancé
                if (jsonContent.elements && Array.isArray(jsonContent.elements)) {
                    // Générer un HTML à partir des éléments du template
                    let generatedHtml = `
                    <div style="font-family: Arial, sans-serif; position: relative; width: 100%; height: 100%; padding-left: 20px;">
                    `;

                    // Utiliser la couleur déjà dans l'état pour l'affichage
                    const displayColor = selectedColor;

                    // Trier les éléments par zIndex pour un rendu correct des superpositions
                    const sortedElements = [...jsonContent.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

                    // Parcourir les éléments et les rendre
                    sortedElements.forEach((element: any) => {
                        if (element.type === "company") {
                            let companyData;
                            try {
                                companyData = JSON.parse(element.content);
                            } catch {
                                companyData = {
                                    name: 'Votre Entreprise',
                                    address: 'Adresse de l\'entreprise',
                                    city: 'Ville',
                                    postalCode: 'Code postal',
                                    email: 'email@entreprise.com'
                                };
                            }

                            generatedHtml += `
                                <div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; color: ${element.color || '#000'}; text-align: ${element.textAlign || 'left'};">
                                    <div style="font-size: ${element.fontSize || 16}px; font-weight: bold; color: ${element.color || displayColor};">
                                        ${companyData.name || 'Votre Entreprise'}
                                    </div>
                                    <div style="font-size: 14px; color: #666;">
                                        ${companyData.address || ''}<br/>
                                        ${companyData.city || ''}, ${companyData.postalCode || ''}<br/>
                                        ${companyData.email || ''}
                                    </div>
                                </div>
                            `;
                        } else if (element.type === "client") {
                            let clientData;
                            try {
                                clientData = JSON.parse(element.content);
                            } catch {
                                clientData = {
                                    name: 'Client Test',
                                    company: 'Entreprise Client',
                                    address: 'Adresse client',
                                    city: 'Ville client',
                                    postalCode: 'Code postal'
                                };
                            }

                            generatedHtml += `
                                <div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; color: ${element.color || '#000'}; text-align: ${element.textAlign || 'left'};">
                                    <div style="font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 4px;">
                                        Adressé à:
                                    </div>
                                    <div style="font-size: ${element.fontSize || 16}px; font-weight: medium;">
                                        ${clientData.name || 'Client Test'}
                                    </div>
                                    <div style="font-size: 14px; color: #666;">
                                        ${clientData.company || ''}<br/>
                                        ${clientData.address || ''}<br/>
                                        ${clientData.city || ''}, ${clientData.postalCode || ''}
                                    </div>
                                </div>
                            `;
                        } else if (element.type === "text") {
                            generatedHtml += `
                                <div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; color: ${element.color || displayColor}; text-align: ${element.textAlign || 'left'}; font-size: ${element.fontSize || 16}px; font-weight: ${element.fontWeight || 'normal'};">
                                    ${element.content || ''}
                                </div>
                            `;
                        } else if (element.type === "line") {
                            generatedHtml += `
                                <div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: 2px; background-color: ${element.color || displayColor};"></div>
                            `;
                        } else if (element.type === "items") {
                            try {
                                let items = [];
                                try {
                                    items = JSON.parse(element.content);
                                } catch {
                                    items = [
                                        { name: 'Article 1', description: 'Description de l\'article', quantity: 1, unitPrice: 100 },
                                        { name: 'Article 2', description: 'Description de l\'article', quantity: 2, unitPrice: 50 }
                                    ];
                                }

                                generatedHtml += `
                                    <div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px;">
                                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                            <thead>
                                                <tr style="border-bottom: 1px solid #ddd; text-align: left; color: ${element.color || displayColor};">
                                                    <th style="padding: 8px;">Article</th>
                                                    <th style="padding: 8px;">Description</th>
                                                    <th style="padding: 8px; text-align: right;">Qté</th>
                                                    <th style="padding: 8px; text-align: right;">Prix unit.</th>
                                                    <th style="padding: 8px; text-align: right;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                `;

                                let total = 0;
                                items.forEach((item: any) => {
                                    const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                                    total += itemTotal;
                                    generatedHtml += `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            <td style="padding: 8px;">${item.name || ''}</td>
                                            <td style="padding: 8px; color: #666;">${item.description || ''}</td>
                                            <td style="padding: 8px; text-align: right;">${item.quantity || 0}</td>
                                            <td style="padding: 8px; text-align: right;">${(item.unitPrice || 0).toFixed(2)} €</td>
                                            <td style="padding: 8px; text-align: right;">${itemTotal.toFixed(2)} €</td>
                                        </tr>
                                    `;
                                });

                                generatedHtml += `
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="3"></td>
                                                    <td style="padding: 8px; text-align: right; font-weight: bold; color: ${element.color || displayColor};">Total:</td>
                                                    <td style="padding: 8px; text-align: right; font-weight: bold; color: ${element.color || displayColor};">${total.toFixed(2)} €</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                `;
                            } catch (e) {
                                generatedHtml += `<div style="color: red; position: absolute; left: ${element.x}px; top: ${element.y}px;">Erreur de rendu des produits</div>`;
                            }
                        } else if (element.type === "footer") {
                            generatedHtml += `
                                <div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; color: ${element.color || displayColor}; text-align: ${element.textAlign || 'center'}; font-size: ${element.fontSize || 14}px; border-top: 1px solid #eee; padding-top: 8px;">
                                    ${element.content || 'Merci pour votre confiance !'}
                                </div>
                            `;
                        }
                    });

                    generatedHtml += `</div>`;
                    return generatedHtml;
                }

                // Si c'est un autre format JSON, on essaie de le rendre de manière basique
                return `<div style="padding: 20px 40px; font-family: system-ui;">${content}</div>`;
            }
        } catch (e) {
            // Si ce n'est pas du JSON valide, on continue avec le HTML normal
        }

        // Remplacer les variables par des valeurs de test
        return `<div style="padding: 20px 40px;">${content
            .replace(/\{\{user\.name\}\}/g, 'Client Test')
            .replace(/\{\{user\.company\}\}/g, 'Entreprise Test')
            .replace(/\{\{user\.address\}\}/g, '123 Rue Client')
            .replace(/\{\{user\.city\}\}/g, 'Ville Client')
            .replace(/\{\{user\.postalCode\}\}/g, '75000')
            .replace(/\{\{user\.country\}\}/g, 'France')
            .replace(/\{\{user\.email\}\}/g, 'client@exemple.com')
            .replace(/\{\{user\.phone\}\}/g, '01 23 45 67 89')
            .replace(/\{\{business\.name\}\}/g, 'Votre Entreprise')
            .replace(/\{\{business\.address\}\}/g, '456 Rue Entreprise')
            .replace(/\{\{business\.city\}\}/g, 'Ville Entreprise')
            .replace(/\{\{business\.postalCode\}\}/g, '69000')
            .replace(/\{\{business\.country\}\}/g, 'France')
            .replace(/\{\{business\.email\}\}/g, 'contact@votre-entreprise.com')
            .replace(/\{\{business\.phone\}\}/g, '01 98 76 54 32')
            .replace(/\{\{invoice\.number\}\}/g, 'FACT-2023-001')
            .replace(/\{\{invoice\.date\}\}/g, new Date().toLocaleDateString('fr-FR'))
            .replace(/\{\{invoice\.dueDate\}\}/g, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'))
            .replace(/\{\{invoice\.totalHT\}\}/g, '1000,00€')
            .replace(/\{\{invoice\.totalTVA\}\}/g, '200,00€')
            .replace(/\{\{invoice\.totalTTC\}\}/g, '1200,00€')}</div>`;
    }, [selectedColor]);

    // Utilisation du hook useAction pour l'update
    const { execute, isLoading } = useAction(updateTemplate, {
        onSuccess: (data) => {
            toast.success("Template mis à jour avec succès")
            router.refresh() // Pour mettre à jour les données sans recharger la page
        },
        onError: (error) => {
            toast.error(error || "Erreur lors de la mise à jour du template")
        }
    })

    // Fonction de soumission du formulaire
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        execute({
            id: template.id,
            name,
            description,
            type,
            content,
            isDefault
        })
    }

    // Retour à la liste des templates
    const handleBack = () => {
        router.push(paths.dashboard.templates.list)
    }

    // Variable pour désactiver les contrôles pendant le chargement
    const isSubmitting = isLoading || isPending

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Navigation */}
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={handleBack}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Retour aux templates
                    </Button>

                    {isEditorMode && (
                        <Button variant="outline" onClick={toggleEditorMode} className="ml-auto">
                            <Eye className="h-4 w-4 mr-2" />
                            Mode aperçu
                        </Button>
                    )}

                    {!isEditorMode && (
                        <Button variant="outline" onClick={toggleEditorMode} className="ml-auto">
                            <FileEdit className="h-4 w-4 mr-2" />
                            Mode édition
                        </Button>
                    )}
                </div>

                {/* Titre */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {template.name}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isEditorMode ? "Édition du template" : "Aperçu du template"}
                    </p>
                </div>

                {/* Contenu principal - Différent selon le mode */}
                {isEditorMode ? (
                    // Mode édition
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Modifier le template</CardTitle>
                                <CardDescription>
                                    Personnalisez votre template selon vos besoins
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={type}
                                            onValueChange={(value: "INVOICE" | "QUOTE" | "BOTH") => setType(value)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Sélectionner un type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INVOICE">Facture</SelectItem>
                                                <SelectItem value="QUOTE">Devis</SelectItem>
                                                <SelectItem value="BOTH">Les deux</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={isSubmitting}
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isDefault"
                                            checked={isDefault}
                                            onCheckedChange={setIsDefault}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor="isDefault">Définir comme template par défaut</Label>
                                    </div>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <Palette className="h-4 w-4 mr-1" />
                                                Couleur principale
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64">
                                            <div className="grid grid-cols-3 gap-2">
                                                {colorOptions.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        type="button"
                                                        className={cn(
                                                            "h-8 w-full rounded-md border transition-all hover:scale-105",
                                                            selectedColor === color.value ? "ring-2 ring-black dark:ring-white" : ""
                                                        )}
                                                        style={{ backgroundColor: color.value }}
                                                        onClick={() => setSelectedColor(color.value)}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="content">Contenu HTML</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleEditorMode}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Prévisualiser
                                        </Button>
                                    </div>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        disabled={isSubmitting}
                                        className="font-mono"
                                        rows={20}
                                    />
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>
                                            Le contenu doit être au format HTML. Utilisez des variables comme:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-gray-50 rounded-md text-xs">
                                            <div>
                                                <p className="font-semibold mb-1">Informations client</p>
                                                <p>{`{{ user.name }} `} - Nom du client</p>
                                                <p>{`{ { user.company } } `} - Société du client</p>
                                                <p>{`{ { user.address } } `} - Adresse</p>
                                                <p>{`{ { user.city } } `} - Ville</p>
                                                <p>{`{ { user.postalCode } } `} - Code postal</p>
                                                <p>{`{ { user.country } } `} - Pays</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold mb-1">Informations facture</p>
                                                <p>{`{ { invoice.number } } `} - Numéro</p>
                                                <p>{`{ { invoice.date } } `} - Date d'émission</p>
                                                <p>{`{ { invoice.dueDate } } `} - Date d'échéance</p>
                                                <p>{`{ { invoice.totalHT } } `} - Montant HT</p>
                                                <p>{`{ { invoice.totalTVA } } `} - Montant TVA</p>
                                                <p>{`{ { invoice.totalTTC } } `} - Montant TTC</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold mb-1">Informations entreprise</p>
                                                <p>{`{ { business.name } } `} - Nom de l'entreprise</p>
                                                <p>{`{ { business.email } } `} - Email</p>
                                                <p>{`{ { business.phone } } `} - Téléphone</p>
                                                <p>{`{ { business.address } } `} - Adresse</p>
                                                <p>{`{ { business.city } } `} - Ville</p>
                                                <p>{`{ { business.postalCode } } `} - Code postal</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={handleBack}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                ) : (
                    // Mode aperçu
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex justify-between items-center w-full mb-2">
                            <Button
                                onClick={redirectToVisualEditor}
                                variant="outline"
                                className="flex items-center"
                            >
                                <PenTool className="h-4 w-4 mr-2" />
                                Utiliser l'éditeur visuel avancé
                            </Button>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-md shadow-md overflow-auto w-full" style={{ maxWidth: '100%' }}>
                            <div
                                className="bg-white mx-auto shadow-lg"
                                style={{
                                    width: `${A4_WIDTH} px`,
                                    height: `${A4_HEIGHT} px`,
                                    borderTop: `4px solid ${selectedColor} `,
                                    position: 'relative',
                                    padding: '20px',
                                    overflowY: 'auto',
                                    maxWidth: '100%',
                                    transform: 'scale(0.7)',
                                    transformOrigin: 'top center',
                                    margin: '0 auto'
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: renderPreview(content)
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 