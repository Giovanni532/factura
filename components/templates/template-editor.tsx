import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { cn } from '@/lib/utils'
import {
    Loader2, Plus, Trash2, Move, Type,
    Building, User, ShoppingCart, FileText, Palette,
    UserCircle,
    ListChecks,
    ImagesIcon
} from 'lucide-react'
import { motion, useDragControls, PanInfo } from 'framer-motion'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion"

import { toast } from 'sonner'
import Image from 'next/image'
import { createTemplate } from '@/actions/template'

// Example company data
const exampleCompany = {
    name: 'Your Company',
    address: '123 Business St',
    city: 'Cityville',
    postalCode: '12345',
    country: 'Country',
    email: 'contact@yourcompany.com',
    phone: '+1 234 567 8900',
    logoUrl: '/placeholder-logo.png',
}

// Example client data
const exampleClient = {
    name: 'Jane Doe',
    company: 'Factura Inc.',
    address: '456 Client Ave',
    city: 'Clientville',
    postalCode: '67890',
    country: 'Country',
    email: 'jane.doe@factura.com',
    phone: '+1 098 765 4321',
}

// Example items
const exampleItems = [
    { name: 'Website Design', description: 'Design of company website', quantity: 1, unitPrice: 1200 },
    { name: 'SEO Services', description: 'Search engine optimization', quantity: 10, unitPrice: 50 },
    { name: 'Content Writing', description: 'Blog posts and website content', quantity: 5, unitPrice: 100 },
]

type TemplateEditorProps = {
    initialData?: any
    templateType?: 'INVOICE' | 'QUOTE' | 'BOTH'
    onSave?: (data: any) => void
    onCancel?: () => void
    isSubmitting?: boolean
    businessData?: any
    userData?: any
}

// Types d'éléments qu'on peut ajouter au template
type ElementType = 'text' | 'image' | 'line' | 'section' | 'table' | 'company' | 'client' | 'items' | 'footer'

// Un élément du template
interface TemplateElement {
    id: string
    type: ElementType
    content: string
    x: number
    y: number
    width: number
    height: number
    color?: string
    fontSize?: number
    fontWeight?: string
    zIndex: number
    rotation?: number
    textAlign?: 'left' | 'center' | 'right'
    tableStyle?: 'standard' | 'compact' | 'modern' | 'minimal'
}

// Add the editor context hook
const useEditor = () => {
    // This is just a mock implementation, you should use your actual editor context
    const addElement = (element: any) => {
        console.log('Adding element', element)
        // Implement your actual addElement logic here
    }

    return { addElement }
}

// Utility function to generate unique IDs
const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
}

// Dimensions d'une feuille A4 en pixels (à 96dpi)
const A4_WIDTH = 795; // 210mm
const A4_HEIGHT = 1123; // 297mm

// Alias for the Image icon since it conflicts with the HTML Image element
const ImageIcon = Image

export default function TemplateEditor({
    initialData,
    templateType = 'BOTH',
    onSave,
    onCancel,
    isSubmitting = false,
    businessData,
    userData
}: TemplateEditorProps) {
    // État local du canvas
    const [selectedColor, setSelectedColor] = useState('#0f766e')
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [templateName, setTemplateName] = useState(initialData?.name || '')
    const [templateDescription, setTemplateDescription] = useState(initialData?.description || '')
    const [templateTypeState, setTemplateTypeState] = useState(templateType)
    const [elements, setElements] = useState<TemplateElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)

    // Ref pour le canvas
    const canvasRef = useRef<HTMLDivElement>(null)

    // Gestionnaire pour la suppression via le clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
                // Vérifier que l'événement ne vient pas d'un champ de texte
                const activeElement = document.activeElement;
                const isInputOrTextarea = activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    (activeElement && activeElement.hasAttribute('contenteditable'));

                if (!isInputOrTextarea) {
                    removeElement(selectedElement);
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement]);

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

    // Gestionnaire pour la sauvegarde
    const handleOpenSaveDialog = () => {
        setShowSaveDialog(true)
    }

    const handleSave = () => {
        if (onSave) {
            // Collecter tous les éléments et leur position
            const templateData = {
                name: templateName,
                description: templateDescription,
                type: templateTypeState,
                content: JSON.stringify({
                    color: selectedColor,
                    elements: elements,
                    // Ajouter d'autres paramètres de template si nécessaire
                }),
                isDefault: false
            }

            onSave(templateData)
            setShowSaveDialog(false)
        }
    }

    // Fonction pour sauvegarder directement avec l'action createTemplate
    const saveTemplateToDatabase = async () => {
        // Valider que le template a un nom
        if (!templateName.trim()) {
            toast.error("Le nom du template est requis");
            return;
        }

        try {
            // Collecter tous les éléments et leur position
            const templateData = {
                name: templateName,
                description: templateDescription,
                type: templateTypeState,
                content: JSON.stringify({
                    color: selectedColor,
                    elements: elements,
                }),
                isDefault: false
            };

            // Si onSave est défini, utiliser la fonction de rappel (comme dans handleSave)
            if (onSave) {
                onSave(templateData);
            } else {
                // Sinon, utiliser directement l'action createTemplate
                // Cette partie ne serait utilisée que si le composant est utilisé directement sans callback
                const result = await createTemplate(templateData);

                if (result && 'success' in result && result.success) {
                    toast.success("Template sauvegardé avec succès");
                    // Rediriger vers la liste des templates ou faire autre chose
                } else {
                    const errorMessage = result && 'error' in result && typeof result.error === 'string'
                        ? result.error
                        : "Erreur lors de la sauvegarde du template";
                    toast.error(errorMessage);
                }
            }

            setShowSaveDialog(false);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            toast.error("Une erreur s'est produite lors de la sauvegarde du template");
        }
    };

    // Ajout d'un nouvel élément au canvas
    const addElement = (type: ElementType) => {
        let newElement: TemplateElement = {
            id: `element-${Date.now()}`,
            type,
            content: type === 'text' ? 'Nouveau texte' : '',
            x: 50,
            y: 50,
            width: type === 'text' ? 150 : 100,
            height: type === 'text' ? 40 : 100,
            color: selectedColor,
            fontSize: 16,
            fontWeight: 'normal',
            zIndex: elements.length + 1,
            rotation: 0,
            textAlign: 'left',
            tableStyle: 'standard'
        }

        // Personnaliser l'élément selon son type
        switch (type) {
            case 'company':
                // Utiliser les données de l'entreprise si disponibles, sinon utiliser l'exemple
                const companyData = businessData ? {
                    name: businessData.name || 'Your Company',
                    address: businessData.address || '',
                    city: businessData.city || '',
                    postalCode: businessData.postalCode || '',
                    country: businessData.country || '',
                    email: businessData.email || '',
                    logoUrl: businessData.logoUrl || '/placeholder-logo.png',
                } : exampleCompany;

                newElement = {
                    ...newElement,
                    content: JSON.stringify(companyData),
                    width: 250,
                    height: 130
                }
                break
            case 'client':
                // Utiliser les données de l'utilisateur connecté pour le client
                const clientData = userData ? {
                    name: `${userData.firstName || ''} ${userData.lastName || ''}` || 'Nom du client',
                    company: businessData?.name || 'Société du client',
                    address: userData.address || 'Adresse du client',
                    city: userData.city || 'Ville',
                    postalCode: userData.postalCode || 'Code postal',
                    country: userData.country || 'Pays',
                    email: userData.email || 'client@example.com',
                    phone: userData.phone || '+33 1 23 45 67 89',
                } : exampleClient;

                newElement = {
                    ...newElement,
                    content: JSON.stringify(clientData),
                    width: 250,
                    height: 130
                }
                break
            case 'items':
                newElement = {
                    ...newElement,
                    content: JSON.stringify(exampleItems),
                    width: 600,
                    height: 200
                }
                break
            case 'footer':
                newElement = {
                    ...newElement,
                    content: 'Merci pour votre confiance ! Pour toute question, contactez-nous.',
                    width: 500,
                    height: 50,
                    fontSize: 14
                }
                break
        }

        setElements([...elements, newElement])
        setSelectedElement(newElement.id)
    }

    // Suppression d'un élément
    const removeElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id))
        if (selectedElement === id) {
            setSelectedElement(null)
        }
    }

    // Mise à jour des propriétés d'un élément
    const updateElement = (id: string, properties: Partial<TemplateElement>) => {
        setElements(elements.map(el =>
            el.id === id ? { ...el, ...properties } : el
        ))
    }

    // Trouver l'élément sélectionné
    const getSelectedElement = () => {
        return elements.find(el => el.id === selectedElement)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Barre d'outils et éléments disponibles */}
            <div className="flex items-center justify-between p-2 rounded-md">
                <div className="flex space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Ajouter un élément
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-medium mb-2">Éléments de base</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addElement('text')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <Type className="h-4 w-4" />
                                        <span className="text-xs">Texte</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addElement('line')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <div className="w-4 h-[2px] bg-current" />
                                        <span className="text-xs">Ligne</span>
                                    </Button>
                                </div>

                                <h4 className="font-medium mb-2 mt-4">Blocs prédéfinis</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addElement('company')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <Building className="h-4 w-4" />
                                        <span className="text-xs">Entreprise</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addElement('client')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="text-xs">Client</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addElement('items')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        <span className="text-xs">Produits</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addElement('footer')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        <span className="text-xs">Pied de page</span>
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Palette className="h-4 w-4" />
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
            </div>

            {/* Espace de travail principal */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Propriétés de l'élément sélectionné */}
                <Card className="md:w-1/4 w-full">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">Propriétés</h3>

                        {selectedElement ? (
                            <div className="space-y-3">
                                {getSelectedElement()?.type === 'text' && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <Label>Texte</Label>
                                            <Textarea
                                                value={getSelectedElement()?.content || ''}
                                                onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                                                className="h-20"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label>Taille de police</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="range"
                                                    min={8}
                                                    max={48}
                                                    step={1}
                                                    value={getSelectedElement()?.fontSize || 16}
                                                    onChange={(e) => updateElement(selectedElement, {
                                                        fontSize: parseInt(e.target.value)
                                                    })}
                                                    className="flex-1"
                                                />
                                                <span className="text-sm">{getSelectedElement()?.fontSize}px</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label>Style</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Button
                                                    size="sm"
                                                    variant={getSelectedElement()?.fontWeight === 'bold' ? 'default' : 'outline'}
                                                    onClick={() => updateElement(selectedElement, {
                                                        fontWeight: getSelectedElement()?.fontWeight === 'bold' ? 'normal' : 'bold'
                                                    })}
                                                    className="w-10 font-bold"
                                                >
                                                    B
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {getSelectedElement()?.type === 'footer' && (
                                    <div>
                                        <Label>Texte du pied de page</Label>
                                        <Textarea
                                            value={getSelectedElement()?.content || ''}
                                            onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                                            className="h-20"
                                        />
                                    </div>
                                )}

                                {getSelectedElement()?.type === 'items' && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <Label>Style du tableau</Label>
                                            <Select
                                                value={getSelectedElement()?.tableStyle || 'standard'}
                                                onValueChange={(value: 'standard' | 'compact' | 'modern' | 'minimal') =>
                                                    updateElement(selectedElement, { tableStyle: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir un style" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Standard</SelectItem>
                                                    <SelectItem value="compact">Compact</SelectItem>
                                                    <SelectItem value="modern">Moderne</SelectItem>
                                                    <SelectItem value="minimal">Minimal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label className="flex justify-between items-center">
                                                <span>Produits</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const items = JSON.parse(getSelectedElement()?.content || '[]');
                                                        items.push({
                                                            name: 'Nouveau produit',
                                                            description: 'Description du produit',
                                                            quantity: 1,
                                                            unitPrice: 0
                                                        });
                                                        updateElement(selectedElement, {
                                                            content: JSON.stringify(items)
                                                        });
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Ajouter
                                                </Button>
                                            </Label>
                                            <div className="max-h-52 overflow-y-auto border rounded p-2 mt-1">
                                                {JSON.parse(getSelectedElement()?.content || '[]').map((item: any, index: number) => (
                                                    <div key={index} className="border-b pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                                                        <div className="flex justify-between mb-1 items-center">
                                                            <span className="font-medium text-sm">Produit {index + 1}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => {
                                                                    const items = JSON.parse(getSelectedElement()?.content || '[]');
                                                                    items.splice(index, 1);
                                                                    updateElement(selectedElement, {
                                                                        content: JSON.stringify(items)
                                                                    });
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 mb-1">
                                                            <div>
                                                                <Label className="text-xs">Nom</Label>
                                                                <Input
                                                                    value={item.name}
                                                                    className="text-xs h-7"
                                                                    onChange={(e) => {
                                                                        const items = JSON.parse(getSelectedElement()?.content || '[]');
                                                                        items[index].name = e.target.value;
                                                                        updateElement(selectedElement, {
                                                                            content: JSON.stringify(items)
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Description</Label>
                                                                <Input
                                                                    value={item.description}
                                                                    className="text-xs h-7"
                                                                    onChange={(e) => {
                                                                        const items = JSON.parse(getSelectedElement()?.content || '[]');
                                                                        items[index].description = e.target.value;
                                                                        updateElement(selectedElement, {
                                                                            content: JSON.stringify(items)
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <Label className="text-xs">Quantité</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.quantity}
                                                                    className="text-xs h-7"
                                                                    onChange={(e) => {
                                                                        const items = JSON.parse(getSelectedElement()?.content || '[]');
                                                                        items[index].quantity = parseInt(e.target.value) || 0;
                                                                        updateElement(selectedElement, {
                                                                            content: JSON.stringify(items)
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Prix unitaire</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={item.unitPrice}
                                                                    className="text-xs h-7"
                                                                    onChange={(e) => {
                                                                        const items = JSON.parse(getSelectedElement()?.content || '[]');
                                                                        items[index].unitPrice = parseFloat(e.target.value) || 0;
                                                                        updateElement(selectedElement, {
                                                                            content: JSON.stringify(items)
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {JSON.parse(getSelectedElement()?.content || '[]').length === 0 && (
                                                    <div className="text-center text-gray-500 py-4 text-sm">
                                                        Aucun produit. Cliquez sur Ajouter pour en créer un.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col gap-2">
                                    <Label>Couleur</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                className={cn(
                                                    "h-6 w-full rounded-md border transition-all hover:scale-105",
                                                    getSelectedElement()?.color === color.value ? "ring-2 ring-black dark:ring-white" : ""
                                                )}
                                                style={{ backgroundColor: color.value }}
                                                onClick={() => updateElement(selectedElement, { color: color.value })}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Section d'alignement pour tous les types de blocs */}
                                <div className="flex flex-col gap-2">
                                    <Label>Alignement</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            size="sm"
                                            variant={getSelectedElement()?.textAlign === 'left' ? 'default' : 'outline'}
                                            onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                                            className="w-10"
                                        >
                                            ←
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={getSelectedElement()?.textAlign === 'center' ? 'default' : 'outline'}
                                            onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                                            className="w-10"
                                        >
                                            ↔
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={getSelectedElement()?.textAlign === 'right' ? 'default' : 'outline'}
                                            onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                                            className="w-10"
                                        >
                                            →
                                        </Button>
                                    </div>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="dimensions">
                                        <AccordionTrigger>Dimensions</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <Label>Largeur</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min={10}
                                                                value={Math.round(getSelectedElement()?.width || 100)}
                                                                onChange={(e) => updateElement(selectedElement, {
                                                                    width: parseInt(e.target.value)
                                                                })}
                                                                className="flex-1 p-2 border rounded"
                                                            />
                                                            <span className="text-sm">px</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Hauteur</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min={10}
                                                                value={Math.round(getSelectedElement()?.height || 100)}
                                                                onChange={(e) => updateElement(selectedElement, {
                                                                    height: parseInt(e.target.value)
                                                                })}
                                                                className="flex-1 p-2 border rounded"
                                                            />
                                                            <span className="text-sm">px</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label>Rotation</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="range"
                                                            min={0}
                                                            max={360}
                                                            step={1}
                                                            value={getSelectedElement()?.rotation || 0}
                                                            onChange={(e) => updateElement(selectedElement, {
                                                                rotation: parseInt(e.target.value)
                                                            })}
                                                            className="flex-1"
                                                        />
                                                        <span className="text-sm">{getSelectedElement()?.rotation || 0}°</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeElement(selectedElement)}
                                    className="flex items-center gap-1 mt-4"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                </Button>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm italic">
                                Sélectionnez un élément pour modifier ses propriétés
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Canvas d'édition */}
                <div className="md:w-3/4 w-full">
                    <Card>
                        <CardContent className="p-4 h-[750px] overflow-auto bg-gray-100 flex justify-center">
                            <div
                                ref={canvasRef}
                                className="bg-white relative shadow-lg overflow-hidden"
                                style={{
                                    width: `${A4_WIDTH}px`,
                                    height: `${A4_HEIGHT}px`,
                                    borderTop: `4px solid ${selectedColor}`
                                }}
                                onClick={() => setSelectedElement(null)}
                            >
                                {/* Éléments du template */}
                                {elements.map((element) => (
                                    <DraggableElement
                                        key={element.id}
                                        element={element}
                                        isSelected={selectedElement === element.id}
                                        onSelect={() => setSelectedElement(element.id)}
                                        onUpdate={(properties) => updateElement(element.id, properties)}
                                        canvasBounds={{ width: A4_WIDTH, height: A4_HEIGHT }}
                                    />
                                ))}

                                {/* Template par défaut en fond si pas d'éléments */}
                                {elements.length === 0 && (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <div className="text-center">
                                            <Plus className="h-12 w-12 mx-auto mb-2" />
                                            <p className="text-lg">Ajoutez des éléments depuis la barre d'outils</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Annuler
                    </Button>
                )}
                <Button onClick={handleOpenSaveDialog} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        "Enregistrer le template"
                    )}
                </Button>
            </div>

            {/* Modal de sauvegarde */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enregistrer le template</DialogTitle>
                        <DialogDescription>
                            Nommez et décrivez votre template pour le retrouver facilement plus tard.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="templateName">Nom du template</Label>
                            <Input
                                id="templateName"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Mon template personnalisé"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="templateDescription">Description</Label>
                            <Textarea
                                id="templateDescription"
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Un template professionnel pour mes factures et devis"
                                rows={3}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="templateType">Type de template</Label>
                            <Select
                                value={templateTypeState}
                                onValueChange={(value: 'INVOICE' | 'QUOTE' | 'BOTH') => setTemplateTypeState(value)}
                            >
                                <SelectTrigger id="templateType">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INVOICE">Facture uniquement</SelectItem>
                                    <SelectItem value="QUOTE">Devis uniquement</SelectItem>
                                    <SelectItem value="BOTH">Facture et devis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={saveTemplateToDatabase} disabled={!templateName}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                "Enregistrer"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Composant pour un élément déplaçable
function DraggableElement({
    element,
    isSelected,
    onSelect,
    onUpdate,
    canvasBounds
}: {
    element: TemplateElement,
    isSelected: boolean,
    onSelect: () => void,
    onUpdate: (properties: Partial<TemplateElement>) => void,
    canvasBounds: { width: number, height: number }
}) {
    const dragControls = useDragControls()
    const [resizing, setResizing] = useState(false)

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Calculer les nouvelles positions en respectant les limites du canvas
        let newX = element.x + info.offset.x;
        let newY = element.y + info.offset.y;

        // Empêcher l'élément de sortir des limites du canvas
        newX = Math.max(0, Math.min(newX, canvasBounds.width - element.width));
        newY = Math.max(0, Math.min(newY, canvasBounds.height - element.height));

        onUpdate({
            x: newX,
            y: newY
        });
    }

    // Empêcher la propagation du clic pour sélectionner l'élément
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect()
    }

    // Gestionnaires de redimensionnement
    const startResize = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation()
        e.preventDefault()

        setResizing(true)

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = element.width
        const startHeight = element.height
        const startPosX = element.x
        const startPosY = element.y

        const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault() // Éviter les comportements par défaut du navigateur

            // Calculer les deltas par rapport à la position initiale
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            let newWidth = startWidth
            let newHeight = startHeight
            let newX = startPosX
            let newY = startPosY

            const updates: Partial<TemplateElement> = {}

            // Appliquer les changements selon la direction
            if (direction.includes('e')) {
                newWidth = Math.max(30, startWidth + deltaX)
                // Limiter la largeur pour ne pas dépasser le canvas
                newWidth = Math.min(newWidth, canvasBounds.width - startPosX)
                updates.width = newWidth
            }
            if (direction.includes('w')) {
                const widthChange = -deltaX
                newWidth = Math.max(30, startWidth - widthChange)
                // Calculer la nouvelle position X
                newX = startPosX + deltaX
                // Limiter la position X pour ne pas sortir à gauche
                newX = Math.max(0, newX)
                // Recalculer la largeur en fonction de la position
                newWidth = Math.min(newWidth, canvasBounds.width - newX)
                updates.width = newWidth
                updates.x = newX
            }
            if (direction.includes('s')) {
                newHeight = Math.max(20, startHeight + deltaY)
                // Limiter la hauteur pour ne pas dépasser le canvas
                newHeight = Math.min(newHeight, canvasBounds.height - startPosY)
                updates.height = newHeight
            }
            if (direction.includes('n')) {
                const heightChange = -deltaY
                newHeight = Math.max(20, startHeight - heightChange)
                // Calculer la nouvelle position Y
                newY = startPosY + deltaY
                // Limiter la position Y pour ne pas sortir en haut
                newY = Math.max(0, newY)
                // Recalculer la hauteur en fonction de la position
                newHeight = Math.min(newHeight, canvasBounds.height - newY)
                updates.height = newHeight
                updates.y = newY
            }

            // Appliquer les mises à jour en une seule fois
            if (Object.keys(updates).length > 0) {
                onUpdate(updates)
            }
        }

        const handleMouseUp = () => {
            setResizing(false)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <motion.div
            drag={!resizing}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={handleDragEnd}
            initial={{ x: element.x, y: element.y }}
            style={{
                position: 'absolute',
                zIndex: element.zIndex,
                width: element.width,
                height: element.height,
                rotate: element.rotation
            }}
            className={cn(
                "cursor-move",
                isSelected && "outline outline-2 outline-blue-500"
            )}
            onClick={handleClick}
        >
            {element.type === 'text' && (
                <p style={{
                    color: element.color,
                    fontSize: `${element.fontSize}px`,
                    fontWeight: element.fontWeight,
                    textAlign: element.textAlign || 'left',
                    width: '100%'
                }}>
                    {element.content}
                </p>
            )}

            {element.type === 'line' && (
                <div className="w-full h-[2px]" style={{ background: element.color }}></div>
            )}

            {element.type === 'company' && (
                <div className="p-2 w-full" style={{ textAlign: element.textAlign || 'left' }}>
                    <div className="flex justify-center mb-2" style={{ justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center' }}>
                        <Image src={JSON.parse(element.content).logoUrl} alt="Image business" width={100} height={100} />
                    </div>
                    <div className="text-lg font-bold" style={{ color: element.color }}>
                        {JSON.parse(element.content).name}
                    </div>
                    <div className="text-sm text-gray-500">
                        {JSON.parse(element.content).address}<br />
                        {JSON.parse(element.content).city}, {JSON.parse(element.content).postalCode}<br />
                        {JSON.parse(element.content).email}
                    </div>
                </div>
            )}

            {element.type === 'client' && (
                <div className="p-2 w-full" style={{ textAlign: element.textAlign || 'left' }}>
                    <div className="text-sm font-semibold uppercase text-gray-500 mb-1">
                        Adressé à:
                    </div>
                    <div className="font-medium">{JSON.parse(element.content).name}</div>
                    <div className="text-sm text-gray-500">
                        {JSON.parse(element.content).company}<br />
                        {JSON.parse(element.content).address}<br />
                        {JSON.parse(element.content).city}, {JSON.parse(element.content).postalCode}
                    </div>
                </div>
            )}

            {element.type === 'items' && (
                <div className="w-full overflow-x-auto" style={{ textAlign: element.textAlign || 'left' }}>
                    <table className={cn(
                        "w-full text-left text-xs",
                        element.tableStyle === 'modern' && "border-collapse border-0 shadow-sm",
                        element.tableStyle === 'compact' && "border-collapse border",
                        element.tableStyle === 'minimal' && "border-collapse border-0"
                    )} style={{
                        margin: element.textAlign === 'center' ? '0 auto' : element.textAlign === 'right' ? '0 0 0 auto' : '0'
                    }}>
                        <thead>
                            <tr className={cn(
                                element.tableStyle === 'standard' && "border-b text-xs uppercase text-gray-500",
                                element.tableStyle === 'modern' && "bg-gray-100 text-xs uppercase",
                                element.tableStyle === 'compact' && "border-b bg-gray-50 text-xs uppercase",
                                element.tableStyle === 'minimal' && "border-b-2 text-xs uppercase"
                            )}>
                                <th className={cn(
                                    element.tableStyle === 'standard' && "py-2 pr-2",
                                    element.tableStyle === 'modern' && "p-3",
                                    element.tableStyle === 'compact' && "p-1 border",
                                    element.tableStyle === 'minimal' && "py-2 pr-2"
                                )}>Article</th>
                                <th className={cn(
                                    element.tableStyle === 'standard' && "p-2",
                                    element.tableStyle === 'modern' && "p-3",
                                    element.tableStyle === 'compact' && "p-1 border",
                                    element.tableStyle === 'minimal' && "p-2"
                                )}>Description</th>
                                <th className={cn(
                                    element.tableStyle === 'standard' && "p-2 text-right",
                                    element.tableStyle === 'modern' && "p-3 text-right",
                                    element.tableStyle === 'compact' && "p-1 border text-right",
                                    element.tableStyle === 'minimal' && "p-2 text-right"
                                )}>Qté</th>
                                <th className={cn(
                                    element.tableStyle === 'standard' && "p-2 text-right",
                                    element.tableStyle === 'modern' && "p-3 text-right",
                                    element.tableStyle === 'compact' && "p-1 border text-right",
                                    element.tableStyle === 'minimal' && "p-2 text-right"
                                )}>Prix unit.</th>
                                <th className={cn(
                                    element.tableStyle === 'standard' && "p-2 text-right",
                                    element.tableStyle === 'modern' && "p-3 text-right",
                                    element.tableStyle === 'compact' && "p-1 border text-right",
                                    element.tableStyle === 'minimal' && "p-2 text-right"
                                )}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {JSON.parse(element.content).map((item: any, index: number) => (
                                <tr key={index} className={cn(
                                    element.tableStyle === 'standard' && "border-b text-gray-800",
                                    element.tableStyle === 'modern' && "border-b text-gray-800 hover:bg-gray-50",
                                    element.tableStyle === 'compact' && "border-b text-gray-800",
                                    element.tableStyle === 'minimal' && "border-b text-gray-800"
                                )}>
                                    <td className={cn(
                                        element.tableStyle === 'standard' && "py-2 pr-2 font-medium",
                                        element.tableStyle === 'modern' && "p-3 font-medium",
                                        element.tableStyle === 'compact' && "p-1 border font-medium",
                                        element.tableStyle === 'minimal' && "py-2 pr-2 font-medium"
                                    )}>{item.name}</td>
                                    <td className={cn(
                                        element.tableStyle === 'standard' && "p-2 text-gray-500",
                                        element.tableStyle === 'modern' && "p-3 text-gray-500",
                                        element.tableStyle === 'compact' && "p-1 border text-gray-500",
                                        element.tableStyle === 'minimal' && "p-2 text-gray-500"
                                    )}>{item.description}</td>
                                    <td className={cn(
                                        element.tableStyle === 'standard' && "p-2 text-right",
                                        element.tableStyle === 'modern' && "p-3 text-right",
                                        element.tableStyle === 'compact' && "p-1 border text-right",
                                        element.tableStyle === 'minimal' && "p-2 text-right"
                                    )}>{item.quantity}</td>
                                    <td className={cn(
                                        element.tableStyle === 'standard' && "p-2 text-right",
                                        element.tableStyle === 'modern' && "p-3 text-right",
                                        element.tableStyle === 'compact' && "p-1 border text-right",
                                        element.tableStyle === 'minimal' && "p-2 text-right"
                                    )}>{item.unitPrice.toFixed(2)} €</td>
                                    <td className={cn(
                                        element.tableStyle === 'standard' && "p-2 text-right",
                                        element.tableStyle === 'modern' && "p-3 text-right",
                                        element.tableStyle === 'compact' && "p-1 border text-right",
                                        element.tableStyle === 'minimal' && "p-2 text-right"
                                    )}>{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className={cn(
                                element.tableStyle === 'modern' && "bg-gray-50",
                                element.tableStyle === 'compact' && "border-t"
                            )}>
                                <td colSpan={3} className={cn(
                                    element.tableStyle === 'compact' && "border"
                                )}></td>
                                <td className={cn(
                                    element.tableStyle === 'standard' && "p-2 text-right font-medium",
                                    element.tableStyle === 'modern' && "p-3 text-right font-medium",
                                    element.tableStyle === 'compact' && "p-1 border text-right font-medium",
                                    element.tableStyle === 'minimal' && "p-2 text-right font-medium"
                                )}>Total:</td>
                                <td className={cn(
                                    element.tableStyle === 'standard' && "p-2 text-right font-bold",
                                    element.tableStyle === 'modern' && "p-3 text-right font-bold",
                                    element.tableStyle === 'compact' && "p-1 border text-right font-bold",
                                    element.tableStyle === 'minimal' && "p-2 text-right font-bold"
                                )}>
                                    {JSON.parse(element.content).reduce((sum: number, item: any) =>
                                        sum + (item.quantity * item.unitPrice), 0).toFixed(2)} €
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {element.type === 'footer' && (
                <div
                    className="w-full text-sm text-gray-500 border-t pt-2"
                    style={{
                        color: element.color,
                        textAlign: element.textAlign || 'center'
                    }}
                >
                    {element.content}
                </div>
            )}

            {isSelected && (
                <>
                    <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-1 rounded-full">
                        <Move className="h-3 w-3" />
                    </div>

                    {/* Poignées de redimensionnement */}
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize"
                        onMouseDown={(e) => startResize(e, 'se')} />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-s-resize"
                        onMouseDown={(e) => startResize(e, 's')} />
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-e-resize"
                        onMouseDown={(e) => startResize(e, 'e')} />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize"
                        onMouseDown={(e) => startResize(e, 'sw')} />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize"
                        onMouseDown={(e) => startResize(e, 'ne')} />
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize"
                        onMouseDown={(e) => startResize(e, 'nw')} />
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-n-resize"
                        onMouseDown={(e) => startResize(e, 'n')} />
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-w-resize"
                        onMouseDown={(e) => startResize(e, 'w')} />
                </>
            )}
        </motion.div>
    )
}

function ToolbarSection({ businessData, userData }: { businessData?: any, userData?: any }) {
    const editor = useEditor()

    const addPredefinedBlock = (type: string) => {
        let blockProps = {}

        switch (type) {
            case 'company':
                // Use business data if available
                let companyContent = 'Your Company Name\nAddress Line 1\nAddress Line 2\nCity, State ZIP\nPhone: (123) 456-7890\nEmail: contact@company.com'

                if (businessData) {
                    companyContent = `${businessData.name || 'Your Company Name'}\n`;
                    companyContent += `${businessData.address || 'Address Line 1'}\n`;
                    companyContent += `${businessData.city || 'City'}, ${businessData.postalCode || 'Postal Code'}\n`;
                    companyContent += `${businessData.country || 'Country'}\n`;
                    companyContent += `Phone: ${userData?.phone || '(123) 456-7890'}\n`;
                    companyContent += `Email: ${userData?.email || 'contact@company.com'}`;
                }

                blockProps = {
                    id: generateId(),
                    type: 'text',
                    content: companyContent,
                    position: { x: 50, y: 50 },
                    size: { width: 300, height: 120 },
                    style: { fontSize: 12, textAlign: 'left', fontWeight: 'normal' }
                }
                toast("Company block added")
                break

            case 'client':
                // Use client data from the connected user
                let clientContent = 'Bill To:';

                if (userData) {
                    clientContent += `\n${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                    clientContent += `\n${userData.address || ''}`;
                    clientContent += `\n${userData.city || ''}, ${userData.postalCode || ''}`;
                    clientContent += `\n${userData.country || ''}`;
                    clientContent += `\n${userData.phone || ''}`;
                    clientContent += `\n${userData.email || ''}`;
                } else {
                    clientContent += '\n[Client Name]\n[Client Address Line 1]\n[Client Address Line 2]\n[City, State ZIP]\n[Phone]\n[Email]';
                }

                blockProps = {
                    id: generateId(),
                    type: 'text',
                    content: clientContent,
                    position: { x: 50, y: 200 },
                    size: { width: 300, height: 120 },
                    style: { fontSize: 12, textAlign: 'left', fontWeight: 'normal' }
                }
                toast("Client block added")
                break

            case 'items':
                blockProps = {
                    id: generateId(),
                    type: 'text',
                    content: 'Item Description\tQty\tRate\tAmount\n-----------------------\t---\t------\t--------\nItem 1\t1\t$100\t$100\nItem 2\t2\t$50\t$100\nItem 3\t3\t$25\t$75\n\nSubtotal: $275\nTax (10%): $27.50\nTotal: $302.50',
                    position: { x: 50, y: 350 },
                    size: { width: 500, height: 200 },
                    style: { fontSize: 12, textAlign: 'left', fontWeight: 'normal', fontFamily: 'monospace' }
                }
                toast("Items list block added")
                break

            case 'footer':
                blockProps = {
                    id: generateId(),
                    type: 'text',
                    content: 'Thank you for your business!\nPayment is due within 30 days of invoice date.\nPlease make checks payable to Your Company Name.\nQuestions? Contact us at billing@company.com',
                    position: { x: 50, y: 600 },
                    size: { width: 500, height: 80 },
                    style: { fontSize: 12, textAlign: 'center', fontWeight: 'normal', fontStyle: 'italic' }
                }
                toast("Footer block added")
                break

            default:
                return
        }

        editor.addElement(blockProps)
    }

    return (
        <div className="border-b p-4 flex flex-col gap-4">
            <Tabs defaultValue="elements">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                    <TabsTrigger value="blocks">Blocks</TabsTrigger>
                </TabsList>
                <TabsContent value="elements" className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" className="justify-start" onClick={() => {
                        editor.addElement({
                            id: generateId(),
                            type: 'text',
                            content: 'New Text',
                            position: { x: 100, y: 100 },
                            size: { width: 200, height: 50 },
                            style: {}
                        })
                    }}>
                        <Type className="mr-2 h-4 w-4" />
                        <span>Text</span>
                    </Button>

                    <Button variant="outline" className="justify-start" onClick={() => {
                        editor.addElement({
                            id: generateId(),
                            type: 'image',
                            src: '/placeholder-image.jpg',
                            position: { x: 100, y: 200 },
                            size: { width: 200, height: 200 },
                            style: {}
                        })
                    }}>
                        <ImagesIcon className="mr-2 h-4 w-4" />
                        <span>Image</span>
                    </Button>
                </TabsContent>

                <TabsContent value="blocks" className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" className="justify-start" onClick={() => addPredefinedBlock('company')}>
                        <Building className="mr-2 h-4 w-4" />
                        <span>Company Info</span>
                    </Button>

                    <Button variant="outline" className="justify-start" onClick={() => addPredefinedBlock('client')}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Client Info</span>
                    </Button>

                    <Button variant="outline" className="justify-start" onClick={() => addPredefinedBlock('items')}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>Items List</span>
                    </Button>

                    <Button variant="outline" className="justify-start" onClick={() => addPredefinedBlock('footer')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Footer</span>
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    )
} 