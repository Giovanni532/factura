import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TemplateDetailsLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Navigation */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Titre */}
                <div>
                    <Skeleton className="h-8 w-72 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Tabs et contenu */}
                <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="edit" disabled>
                            Éditer
                        </TabsTrigger>
                        <TabsTrigger value="preview" disabled>
                            Aperçu
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Skeleton className="h-6 w-40" />
                                </CardTitle>
                                <Skeleton className="h-4 w-72" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Champs du formulaire */}
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="space-y-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className={`h-10 w-full ${index === 3 ? 'h-40' : ''}`} />
                                    </div>
                                ))}

                                {/* Boutons */}
                                <div className="flex justify-between pt-4">
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-40" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 