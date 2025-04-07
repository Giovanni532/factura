import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export default function InvoicesLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header loading */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Filtres loading */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Table loading */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-32" /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="space-y-4">
                                {/* Table header */}
                                <div className="grid grid-cols-7 gap-4 py-4 border-b">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-5 w-20 ml-auto" />
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-10 ml-auto" />
                                </div>

                                {/* Table rows */}
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-7 gap-4 py-4 border-b">
                                        <Skeleton className="h-5 w-16" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-28" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-16 ml-auto" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination loading */}
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-4 w-48 hidden sm:block" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <div className="flex gap-1">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton key={i} className="h-8 w-8 rounded-md" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 