import React from 'react'
import { SectionCards } from './section-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { InvoiceChart } from '@/components/dashboard/invoice-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRevenueStats, getClientStats, getQuoteStats, getUnpaidInvoicesTotal, getMonthlyRevenueData, getInvoiceStatusDistribution } from '@/actions/dashboard'
import { DashboardData, UserInfo } from '@/types/dashboard'

// Fonction qui récupère toutes les données du dashboard
async function getDashboardData(): Promise<DashboardData> {
    // Récupérer toutes les données du dashboard en parallèle
    const [
        revenueResult,
        clientsResult,
        quotesResult,
        unpaidResult,
        revenueChartResult,
        invoiceStatusResult
    ] = await Promise.all([
        getRevenueStats({}),
        getClientStats({}),
        getQuoteStats({}),
        getUnpaidInvoicesTotal({}),
        getMonthlyRevenueData({}),
        getInvoiceStatusDistribution({})
    ]);

    // Récupérer les infos utilisateur à partir du premier résultat
    const userInfo: UserInfo = revenueResult?.data?.user || {
        id: "",
        name: "Utilisateur",
        email: ""
    };

    // Extraire les données ou utiliser des valeurs par défaut
    const dashboardData: DashboardData = {
        cards: {
            revenue: {
                total: revenueResult?.data?.total || 0,
                trend: revenueResult?.data?.trend || 0
            },
            clients: {
                total: clientsResult?.data?.total || 0,
                trend: clientsResult?.data?.trend || 0
            },
            quotes: {
                total: quotesResult?.data?.total || 0,
                trend: quotesResult?.data?.trend || 0
            },
            unpaidInvoices: {
                total: unpaidResult?.data?.total || 0,
                trend: unpaidResult?.data?.trend || 0
            }
        },
        charts: {
            monthlyRevenue: revenueChartResult?.data?.data || [],
            invoiceStatus: invoiceStatusResult?.data?.data || []
        },
        user: userInfo
    };

    // Vérifier s'il y a des erreurs dans les résultats
    const hasErrors = [
        revenueResult?.serverError,
        clientsResult?.serverError,
        quotesResult?.serverError,
        unpaidResult?.serverError,
        revenueChartResult?.serverError,
        invoiceStatusResult?.serverError
    ].some(error => error !== undefined);

    if (hasErrors) {
        console.error('Dashboard data error:', [
            revenueResult?.serverError,
            clientsResult?.serverError,
            quotesResult?.serverError,
            unpaidResult?.serverError,
            revenueChartResult?.serverError,
            invoiceStatusResult?.serverError
        ]);
    }

    return dashboardData;
}

export default async function DashboardPage() {
    // Récupérer les données du dashboard
    const dashboardData = await getDashboardData();

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <h1 className='text-2xl font-bold'>Bonjour {dashboardData.user.name} 👋</h1>
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
