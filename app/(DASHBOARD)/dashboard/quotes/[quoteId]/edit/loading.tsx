import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function EditDevisLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Bouton retour */}
                <div className="w-fit">
                    <Skeleton className="h-9 w-32" />
                </div>

                {/* Titre de la page */}
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Informations générales */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lignes de devis */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <Skeleton className="h-7 w-36" />
                        <Skeleton className="h-9 w-36" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-7 gap-4 pb-2 border-b">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-10" />
                            </div>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="grid grid-cols-7 gap-4 py-2 border-b last:border-0">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-8 w-8 rounded-md mx-auto" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Résumé et notes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[150px] w-full" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardContent>
                    </Card>

                    {/* Résumé */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-16" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 w-1/3" />
                                    <Skeleton className="h-10 w-2/3" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between">
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-7 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    )
}

