"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Item, QuoteItem } from "@prisma/client"

interface QuoteItemsSectionProps {
  items: QuoteItem[]
  errors: Record<string, string>
  onAdd: () => void
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
  products: Item[]
  itemDescriptions: Record<string, string>
  updateItemDescription: (index: number, description: string) => void
}

export function QuoteItemsSection({ items, errors, onAdd, onUpdate, onRemove, products, itemDescriptions, updateItemDescription }: QuoteItemsSectionProps) {
  // Fonction pour formater le prix
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Animation pour la carte
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  // Animation pour les lignes
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Fonction pour gérer le changement de produit
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      onUpdate(index, "itemId", productId)
      onUpdate(index, "description", product.description)
      onUpdate(index, "unitPrice", product.unitPrice)
    }
  }

  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lignes du devis</CardTitle>
            <CardDescription>
              Ajoutez les produits ou services que vous souhaitez inclure dans ce devis.
            </CardDescription>
          </div>
          <Button onClick={onAdd} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Ajouter une ligne
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Produit/Service</TableHead>
                    <TableHead className="w-[300px]">Description</TableHead>
                    <TableHead className="w-[100px] text-center">Quantité</TableHead>
                    <TableHead className="w-[150px] text-right">Prix unitaire</TableHead>
                    <TableHead className="w-[150px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Aucune ligne ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => (
                        <motion.tr
                          key={item.id || `item_${index}`}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="relative"
                        >
                          <TableCell>
                            <Select value={item.itemId} onValueChange={(value) => handleProductChange(index, value)}>
                              <SelectTrigger
                                className={errors[`quoteItems.${index}.itemId`] ? "border-destructive" : ""}
                              >
                                <SelectValue placeholder="Sélectionner un produit" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`quoteItems.${index}.itemId`] && (
                              <p className="text-xs font-medium text-destructive mt-1">
                                {errors[`quoteItems.${index}.itemId`]}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={itemDescriptions[item.id] || ""}
                              onChange={(e) => updateItemDescription(index, e.target.value)}
                              placeholder="Description"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => onUpdate(index, "quantity", Number.parseInt(e.target.value) || 0)}
                              className={cn(
                                "text-center",
                                errors[`quoteItems.${index}.quantity`] ? "border-destructive" : "",
                              )}
                            />
                            {errors[`quoteItems.${index}.quantity`] && (
                              <p className="text-xs font-medium text-destructive mt-1">
                                {errors[`quoteItems.${index}.quantity`]}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => onUpdate(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                              className={cn(
                                "text-right",
                                errors[`quoteItems.${index}.unitPrice`] ? "border-destructive" : "",
                              )}
                            />
                            {errors[`quoteItems.${index}.unitPrice`] && (
                              <p className="text-xs font-medium text-destructive mt-1">
                                {errors[`quoteItems.${index}.unitPrice`]}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemove(index)}
                              disabled={items.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}

