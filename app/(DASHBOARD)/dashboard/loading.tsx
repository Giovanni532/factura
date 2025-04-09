import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <div className='h-8 w-64 bg-muted rounded-md animate-pulse'></div>
                <div className='h-4 w-96 bg-muted rounded-md animate-pulse'></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardHeader className="relative">
                            <div className='h-4 w-32 bg-muted rounded-md animate-pulse'></div>
                            <div className='h-8 w-24 bg-muted rounded-md animate-pulse mt-2'></div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1">
                            <div className='h-4 w-36 bg-muted rounded-md animate-pulse'></div>
                            <div className='h-4 w-40 bg-muted rounded-md animate-pulse'></div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6 mt-4">
                {Array(2).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className='h-6 w-40 bg-muted rounded-md animate-pulse'></div>
                            <div className='h-4 w-60 bg-muted rounded-md animate-pulse'></div>
                        </CardHeader>
                        <CardContent>
                            <div className='h-[350px] w-full bg-muted/50 rounded-md animate-pulse'></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
