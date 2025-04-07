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
import { Client } from '@prisma/client'
import DeleteClientButton from './delete-client-button'
import { CreateClientDialog } from './create-client-dialog'
import { EditClientDialog } from './edit-client-dialog'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClientTableProps {
    clients: Client[]
}

export default function ClientTable({ clients }: ClientTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrer les clients en fonction de la recherche
    const filteredClients = useMemo(() => {
        if (!searchQuery.trim()) return clients;

        const lowercaseQuery = searchQuery.toLowerCase();
        return clients.filter(client =>
            client.name.toLowerCase().includes(lowercaseQuery) ||
            client.email.toLowerCase().includes(lowercaseQuery) ||
            (client.company && client.company.toLowerCase().includes(lowercaseQuery)) ||
            (client.phone && client.phone.toLowerCase().includes(lowercaseQuery))
        );
    }, [clients, searchQuery]);

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
                        Clients
                    </motion.h1>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <CreateClientDialog />
                    </motion.div>
                </div>

                {/* Recherche */}
                <div className="w-full">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher par nom, email, entreprise..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tableau des clients */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle>Liste des clients</CardTitle>
                        <CardDescription>{filteredClients.length} clients trouvés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {filteredClients.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center p-8 text-center"
                                >
                                    {clients.length === 0 ? (
                                        <>
                                            <p className="text-muted-foreground mb-4">Vous n'avez pas encore de clients.</p>
                                            <CreateClientDialog />
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">Aucun client ne correspond à votre recherche.</p>
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
                                                <TableHead>Email</TableHead>
                                                <TableHead>Entreprise</TableHead>
                                                <TableHead>Téléphone</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredClients.map((client, index) => (
                                                <motion.tr
                                                    key={client.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <TableCell className="font-medium">{client.name}</TableCell>
                                                    <TableCell>{client.email}</TableCell>
                                                    <TableCell>{client.company || "-"}</TableCell>
                                                    <TableCell>{client.phone || "-"}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <EditClientDialog client={client} />
                                                            <DeleteClientButton clientId={client.id} clientName={client.name} />
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