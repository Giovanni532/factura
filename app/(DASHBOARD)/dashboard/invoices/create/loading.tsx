import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CreateInvoiceLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Formulaire de facture */}
                <Card>
                    <CardHeader className="pb-0">
                        <Skeleton className="h-7 w-64 mb-2" />
                        <Skeleton className="h-4 w-full max-w-md" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Section Client */}
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-32" />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* Détails de la facture */}
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* Produits */}
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-36" />

                                {/* En-tête du tableau des produits */}
                                <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-10 ml-auto" />
                                </div>

                                {/* Lignes de produits */}
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="grid grid-cols-5 gap-4 py-4 border-b">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <div className="flex justify-end">
                                            <Skeleton className="h-9 w-9" />
                                        </div>
                                    </div>
                                ))}

                                {/* Bouton ajouter */}
                                <div className="pt-2">
                                    <Skeleton className="h-10 w-40 mx-auto" />
                                </div>
                            </div>

                            {/* Totaux */}
                            <div className="flex justify-end space-y-2">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
