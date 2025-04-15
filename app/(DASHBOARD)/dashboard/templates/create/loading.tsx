import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CreateTemplateLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Bouton retour */}
                <div className="w-fit">
                    <Skeleton className="h-9 w-24" />
                </div>

                {/* Titre de la page */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                            {/* Panneau de gauche - Paramètres */}
                            <div className="flex-1 space-y-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Skeleton className="h-5 w-32 mb-2" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                            <div>
                                                <Skeleton className="h-5 w-32 mb-2" />
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                            <div>
                                                <Skeleton className="h-5 w-32 mb-2" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                <Skeleton className="h-10 w-full rounded-md" />
                                                <Skeleton className="h-10 w-full rounded-md" />
                                                <Skeleton className="h-10 w-full rounded-md" />
                                            </div>
                                            <div>
                                                <Skeleton className="h-5 w-32 mb-2" />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Skeleton className="h-8 w-full rounded-md" />
                                                    <Skeleton className="h-8 w-full rounded-md" />
                                                    <Skeleton className="h-8 w-full rounded-md" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end space-x-2">
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-48" />
                                </div>
                            </div>

                            {/* Panneau de droite - Prévisualisation */}
                            <div className="flex-1">
                                <Card className="h-[650px]">
                                    <CardContent className="p-0">
                                        <Skeleton className="h-full w-full" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 