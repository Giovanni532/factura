"use client"

import React, { useState, useMemo } from 'react'
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
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"
import { Item } from '@prisma/client'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import DeleteProductButton from './delete-product-button'
import { CreateProductDialog } from './create-product-dialog'
import { EditProductDialog } from './edit-product-dialog'

interface ItemTableProps {
    items: Item[]
}

export default function ItemTable({ items }: ItemTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Formatage du prix unitaire
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    // Filtrer les produits en fonction de la recherche
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;

        const lowercaseQuery = searchQuery.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(lowercaseQuery) ||
            (item.description && item.description.toLowerCase().includes(lowercaseQuery))
        );
    }, [items, searchQuery]);

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
                        Produits et Services
                    </motion.h1>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <CreateProductDialog />
                    </motion.div>
                </div>

                {/* Recherche */}
                <div className="w-full">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher par nom, description..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tableau des produits */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle>Liste des produits et services</CardTitle>
                        <CardDescription>{filteredItems.length} produits trouvés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {filteredItems.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center p-8 text-center"
                                >
                                    {items.length === 0 ? (
                                        <>
                                            <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore de produits ou services.</p>
                                            <CreateProductDialog />
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">Aucun produit ne correspond à votre recherche.</p>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-x-auto"
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nom</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Prix unitaire</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredItems.map((item, index) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell>{item.description || "-"}</TableCell>
                                                    <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <EditProductDialog item={item} />
                                                            <DeleteProductButton itemId={item.id} itemName={item.name} />
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 