"use client"
import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export default function Loading() {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Retour */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Button
                        variant="ghost"
                        className="pl-0 flex items-center gap-2 text-foreground"
                        disabled
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux factures
                    </Button>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-background rounded-lg border shadow-sm p-8"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <Skeleton className="h-4 w-64 mt-2" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-9 w-40" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </div>

                    {/* Client et entreprise */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-1">
                            <h2 className="font-semibold text-lg mb-2">Client</h2>
                            <Skeleton className="h-5 w-40 mb-1" />
                            <Skeleton className="h-4 w-56 mb-1" />
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-4 w-64 mb-1" />
                            <Skeleton className="h-4 w-40" />
                        </div>

                        <div className="space-y-1">
                            <h2 className="font-semibold text-lg mb-2">Entreprise</h2>
                            <Skeleton className="h-5 w-40 mb-1" />
                            <Skeleton className="h-4 w-56 mb-1" />
                            <Skeleton className="h-4 w-64 mb-1" />
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-4 w-32" />
                        </div>

                        <div className="space-y-1">
                            <h2 className="font-semibold text-lg mb-2">Dates</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Création:</span>
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Échéance:</span>
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>

                    {/* Produits et services */}
                    <div className="mb-8">
                        <h2 className="font-semibold text-lg mb-4">Produits et services</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2 text-left font-medium">Description</th>
                                        <th className="py-2 text-center font-medium">Quantité</th>
                                        <th className="py-2 text-right font-medium">Prix unitaire</th>
                                        <th className="py-2 text-right font-medium">TVA</th>
                                        <th className="py-2 text-right font-medium">Total HT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3].map((item) => (
                                        <tr key={item} className="border-b border-border">
                                            <td className="py-3">
                                                <div>
                                                    <Skeleton className="h-5 w-40 mb-1" />
                                                    <Skeleton className="h-4 w-64" />
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <Skeleton className="h-5 w-10 mx-auto" />
                                            </td>
                                            <td className="py-3 text-right">
                                                <Skeleton className="h-5 w-24 ml-auto" />
                                            </td>
                                            <td className="py-3 text-right">
                                                <Skeleton className="h-5 w-12 ml-auto" />
                                            </td>
                                            <td className="py-3 text-right">
                                                <Skeleton className="h-5 w-28 ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Résumé */}
                    <div>
                        <h2 className="font-semibold text-lg mb-4">Résumé</h2>
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">Sous-total HT</span>
                                    <Skeleton className="h-5 w-28" />
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">TVA</span>
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between py-1">
                                    <span className="font-medium">Total TTC</span>
                                    <Skeleton className="h-6 w-32" />
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">Payé</span>
                                    <Skeleton className="h-5 w-28" />
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="font-medium">Reste à payer</span>
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historique des paiements */}
                    <div className="mt-8">
                        <h2 className="font-semibold text-lg mb-4">Historique des paiements</h2>
                        <div className="space-y-2">
                            {[1, 2].map((payment) => (
                                <div key={payment} className="flex justify-between items-center border-b border-border pb-2">
                                    <div>
                                        <Skeleton className="h-5 w-32 mb-1" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
