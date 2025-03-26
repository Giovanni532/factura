import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function DevisDetailLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Bouton retour */}
                <div className="w-fit">
                    <Skeleton className="h-9 w-32" />
                </div>

                {/* Contenu principal */}
                <Card className="w-full">
                    <CardContent className="p-6 sm:p-8">
                        {/* En-tête de la carte */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-10 w-48" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <Skeleton className="h-9 w-28" />
                                <Skeleton className="h-9 w-28" />
                                <Skeleton className="h-9 w-28" />
                                <Skeleton className="h-9 w-28" />
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Informations client et entreprise */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {/* Bloc client */}
                            <div>
                                <Skeleton className="h-7 w-24 mb-3" />
                                <div className="space-y-2">
                                    <div>
                                        <Skeleton className="h-5 w-40 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-48 mb-1" />
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </div>

                            {/* Bloc entreprise */}
                            <div>
                                <Skeleton className="h-7 w-32 mb-3" />
                                <div className="space-y-2">
                                    <div>
                                        <Skeleton className="h-5 w-40 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-48 mb-1" />
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div>
                                <Skeleton className="h-7 w-24 mb-3" />
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Skeleton className="h-4 w-4 mr-2" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <div className="flex items-center">
                                        <Skeleton className="h-4 w-4 mr-2" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Tableau des produits */}
                        <div className="mb-6">
                            <Skeleton className="h-7 w-48 mb-3" />
                            <div className="space-y-4">
                                <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="grid grid-cols-5 gap-4 py-2 border-b last:border-0">
                                        <div>
                                            <Skeleton className="h-5 w-full mb-1" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                        <Skeleton className="h-5 w-1/2 mx-auto" />
                                        <Skeleton className="h-5 w-3/4 ml-auto" />
                                        <Skeleton className="h-5 w-1/2 ml-auto" />
                                        <Skeleton className="h-5 w-3/4 ml-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Résumé financier */}
                            <div className="md:order-2">
                                <Skeleton className="h-7 w-24 mb-3" />
                                <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="h-px bg-border my-2" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-6 w-28" />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="md:order-1">
                                <Skeleton className="h-7 w-24 mb-3" />
                                <div className="bg-muted/30 p-4 rounded-md">
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mb-2" />
                                    <Skeleton className="h-4 w-4/6" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

