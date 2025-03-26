"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function DevisLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/30" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>

                <Card>
                    <CardHeader className="pb-0">
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="border-b pb-4 mb-4">
                                <div className="grid grid-cols-7 gap-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-8 ml-auto" />
                                </div>
                            </div>

                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="py-4 border-b last:border-0">
                                    <div className="grid grid-cols-7 gap-4 items-center">
                                        <Skeleton className="h-5 w-28" />
                                        <div>
                                            <Skeleton className="h-5 w-32 mb-1" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-20 ml-auto" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                                    </div>
                                </div>
                            ))}

                            {/* Pagination Skeleton */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-4 w-48 hidden sm:block" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <Skeleton key={index} className="h-8 w-8 rounded-md" />
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

