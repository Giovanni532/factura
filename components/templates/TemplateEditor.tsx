import React, { useState, useRef, useEffect, useMemo } from 'react'
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
    Loader2, Plus, Trash2, Move, Edit2, Type, Image,
    Building, User, ShoppingCart, FileText, Palette,
    ArrowUpDown,
    Bold,
    ChevronDown,
    CornerDownRight,
    CreditCard,
    Italic,
    Layers,
    LayoutPanelLeft,
    ListOrdered,
    BookOpen,
    UserCircle,
    ListChecks
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from 'sonner'
import tinycolor2 from "tinycolor2"
import Image2 from 'next/image'

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
    name: 'Client Name',
    company: 'Client Company',
    address: '456 Client Ave',
    city: 'Clientville',
    postalCode: '67890',
    country: 'Country',
    email: 'client@example.com',
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

// Alias for the Image icon since it conflicts with the HTML Image element
const ImageIcon = Image

export default function TemplateEditor({
    initialData,
    templateType = 'BOTH',
    onSave,
    onCancel,
    isSubmitting = false
}: TemplateEditorProps) {
    // État local du canvas
    const [selectedColor, setSelectedColor] = useState('#0f766e')
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [templateName, setTemplateName] = useState(initialData?.name || '')
    const [templateDescription, setTemplateDescription] = useState(initialData?.description || '')
    const [templateTypeState, setTemplateTypeState] = useState(templateType)
    const [activeTab, setActiveTab] = useState('design')
    const [elements, setElements] = useState<TemplateElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)

    // Ref pour le canvas
    const canvasRef = useRef<HTMLDivElement>(null)

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
            }

            onSave(templateData)
            setShowSaveDialog(false)
        }
    }

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
            rotation: 0
        }

        // Personnaliser l'élément selon son type
        switch (type) {
            case 'company':
                newElement = {
                    ...newElement,
                    content: JSON.stringify(exampleCompany),
                    width: 250,
                    height: 130
                }
                break
            case 'client':
                newElement = {
                    ...newElement,
                    content: JSON.stringify(exampleClient),
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
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
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
                                        onClick={() => addElement('image')}
                                        className="flex flex-col items-center gap-1 h-auto py-2"
                                    >
                                        <Image className="h-4 w-4" />
                                        <span className="text-xs">Image</span>
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
                                        <div>
                                            <Label>Texte</Label>
                                            <Textarea
                                                value={getSelectedElement()?.content || ''}
                                                onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                                                className="h-20"
                                            />
                                        </div>
                                        <div>
                                            <Label>Taille de police</Label>
                                            <div className="flex items-center gap-2">
                                                <input
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
                                        <div>
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

                                <div>
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

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="dimensions">
                                        <AccordionTrigger>Dimensions</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label>Largeur</Label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min={10}
                                                                value={getSelectedElement()?.width || 100}
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
                                                            <input
                                                                type="number"
                                                                min={10}
                                                                value={getSelectedElement()?.height || 100}
                                                                onChange={(e) => updateElement(selectedElement, {
                                                                    height: parseInt(e.target.value)
                                                                })}
                                                                className="flex-1 p-2 border rounded"
                                                            />
                                                            <span className="text-sm">px</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Rotation</Label>
                                                    <div className="flex items-center gap-2">
                                                        <input
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
                        <CardContent className="p-0 h-[650px] relative">
                            <div
                                ref={canvasRef}
                                className="bg-white w-full h-full p-6 overflow-auto relative"
                                style={{ borderTop: `4px solid ${selectedColor}` }}
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
                        <div>
                            <Label htmlFor="templateName">Nom du template</Label>
                            <Input
                                id="templateName"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Mon template personnalisé"
                            />
                        </div>
                        <div>
                            <Label htmlFor="templateDescription">Description</Label>
                            <Textarea
                                id="templateDescription"
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Un template professionnel pour mes factures et devis"
                                rows={3}
                            />
                        </div>
                        <div>
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
                        <Button onClick={handleSave} disabled={!templateName}>
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
    onUpdate
}: {
    element: TemplateElement,
    isSelected: boolean,
    onSelect: () => void,
    onUpdate: (properties: Partial<TemplateElement>) => void
}) {
    const dragControls = useDragControls()

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        onUpdate({
            x: element.x + info.offset.x,
            y: element.y + info.offset.y
        })
    }

    // Empêcher la propagation du clic pour sélectionner l'élément
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect()
    }

    return (
        <motion.div
            drag
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
                    fontWeight: element.fontWeight
                }}>
                    {element.content}
                </p>
            )}

            {element.type === 'image' && (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <Image className="h-1/3 w-1/3 text-gray-400" />
                </div>
            )}

            {element.type === 'line' && (
                <div className="w-full h-[2px]" style={{ background: element.color }}></div>
            )}

            {element.type === 'company' && (
                <div className="p-2">
                    <div className="text-lg font-bold" style={{ color: element.color }}>
                        {JSON.parse(element.content).name}
                    </div>
                    <div className="text-sm text-gray-500">
                        {JSON.parse(element.content).address}<br />
                        {JSON.parse(element.content).city}, {JSON.parse(element.content).postalCode}<br />
                        {JSON.parse(element.content).email} | {JSON.parse(element.content).phone}
                    </div>
                </div>
            )}

            {element.type === 'client' && (
                <div className="p-2">
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
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b text-xs uppercase text-gray-500">
                                <th className="py-2 pr-2">Article</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Qté</th>
                                <th className="p-2 text-right">Prix unit.</th>
                                <th className="p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {JSON.parse(element.content).map((item: any, index: number) => (
                                <tr key={index} className="border-b text-gray-800">
                                    <td className="py-2 pr-2 font-medium">{item.name}</td>
                                    <td className="p-2 text-gray-500">{item.description}</td>
                                    <td className="p-2 text-right">{item.quantity}</td>
                                    <td className="p-2 text-right">{item.unitPrice.toFixed(2)} €</td>
                                    <td className="p-2 text-right">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3}></td>
                                <td className="p-2 text-right font-medium">Total:</td>
                                <td className="p-2 text-right font-bold">
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
                    className="w-full text-center text-sm text-gray-500 border-t pt-2"
                    style={{ color: element.color }}
                >
                    {element.content}
                </div>
            )}

            {isSelected && (
                <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-1 rounded-full">
                    <Move className="h-3 w-3" />
                </div>
            )}
        </motion.div>
    )
}

function ToolbarSection() {
    const editor = useEditor()

    const addPredefinedBlock = (type: string) => {
        let blockProps = {}

        switch (type) {
            case 'company':
                blockProps = {
                    id: generateId(),
                    type: 'text',
                    content: 'Your Company Name\nAddress Line 1\nAddress Line 2\nCity, State ZIP\nPhone: (123) 456-7890\nEmail: contact@company.com',
                    position: { x: 50, y: 50 },
                    size: { width: 300, height: 120 },
                    style: { fontSize: 12, textAlign: 'left', fontWeight: 'normal' }
                }
                toast("Company block added")
                break

            case 'client':
                blockProps = {
                    id: generateId(),
                    type: 'text',
                    content: 'Bill To:\n[Client Name]\n[Client Address Line 1]\n[Client Address Line 2]\n[City, State ZIP]\n[Phone]\n[Email]',
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
                        <Image className="mr-2 h-4 w-4" />
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