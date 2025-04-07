import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ClientsLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Barre de recherche */}
                <div className="w-full">
                    <div className="relative">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                {/* Tableau des clients */}
                <Card>
                    <CardHeader className="pb-0">
                        <Skeleton className="h-7 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4 space-y-4">
                            {/* En-tête du tableau */}
                            <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-24 ml-auto" />
                            </div>

                            {/* Rangées du tableau */}
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="grid grid-cols-5 gap-4 py-4 border-b">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-5 w-2/3" />
                                    <Skeleton className="h-5 w-1/2" />
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-9 w-9" />
                                        <Skeleton className="h-9 w-9" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 