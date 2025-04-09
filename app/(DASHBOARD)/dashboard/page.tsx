import { getUser } from '@/actions/auth'
import { getDashboardData } from '@/actions/dashboard'
import React from 'react'
import { SectionCards } from './section-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { InvoiceChart } from '@/components/dashboard/invoice-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
    const [user, dashboardData] = await Promise.all([
        getUser(),
        getDashboardData()
    ]);

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <h1 className='text-2xl font-bold'>Bonjour {user?.firstName} {user?.lastName} 👋</h1>
                <p className='text-sm text-muted-foreground'>
                    Vous pouvez accéder à vos factures, réclamations et autres documents ici.
                </p>
            </div>
            <SectionCards data={dashboardData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenus mensuels</CardTitle>
                        <CardDescription>Évolution des revenus sur les 6 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={dashboardData.charts.monthlyRevenue} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Statut des factures</CardTitle>
                        <CardDescription>Répartition des factures par statut</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InvoiceChart data={dashboardData.charts.invoiceStatus} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
