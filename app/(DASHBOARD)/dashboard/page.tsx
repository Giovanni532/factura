import React, { Suspense } from 'react'
import { SectionCards } from './section-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { InvoiceChart } from '@/components/dashboard/invoice-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRevenueStats, getClientStats, getQuoteStats, getUnpaidInvoicesTotal, getMonthlyRevenueData, getInvoiceStatusDistribution } from '@/actions/dashboard'
import { DashboardData, UserInfo } from '@/types/dashboard'
import { cache } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Fonction mise en cache qui récupère les données essentielles pour le contenu visible en premier
const getEssentialDashboardData = cache(async () => {
    const [revenueResult, clientsResult, quotesResult, unpaidResult] = await Promise.all([
        getRevenueStats({}),
        getClientStats({}),
        getQuoteStats({}),
        getUnpaidInvoicesTotal({})
    ]);

    // Récupérer les infos utilisateur à partir du premier résultat
    const userInfo: UserInfo = revenueResult?.data?.user || {
        id: "",
        name: "Utilisateur",
        email: ""
    };

    // Extraire les données ou utiliser des valeurs par défaut
    return {
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
        user: userInfo
    };
});

// Fonction mise en cache qui récupère les données des graphiques (moins prioritaire pour le LCP)
const getChartData = cache(async () => {
    const [revenueChartResult, invoiceStatusResult] = await Promise.all([
        getMonthlyRevenueData({}),
        getInvoiceStatusDistribution({})
    ]);

    return {
        monthlyRevenue: revenueChartResult?.data?.data || [],
        invoiceStatus: invoiceStatusResult?.data?.data || []
    };
});

// Composant pour les graphiques avec chargement retardé
async function DashboardCharts() {
    const chartData = await getChartData();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Revenus mensuels</CardTitle>
                    <CardDescription>Évolution des revenus sur les 6 derniers mois</CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueChart data={chartData.monthlyRevenue} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Statut des factures</CardTitle>
                    <CardDescription>Répartition des factures par statut</CardDescription>
                </CardHeader>
                <CardContent>
                    <InvoiceChart data={chartData.invoiceStatus} />
                </CardContent>
            </Card>
        </div>
    );
}

// Fallback de chargement pour les graphiques
function ChartsLoadingFallback() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-60" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-60" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export const revalidate = 3600; // Revalider toutes les heures (3600 secondes)

export default async function DashboardPage() {
    // Ne récupérer que les données essentielles pour le contenu visible immédiatement
    const essentialData = await getEssentialDashboardData();

    // Construire l'objet de données pour les cartes
    const dashboardData: DashboardData = {
        cards: essentialData.cards,
        charts: { monthlyRevenue: [], invoiceStatus: [] }, // Sera remplacé par les vraies données lors du chargement
        user: essentialData.user
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <h1 className='text-2xl font-bold'>Bonjour {dashboardData.user.name} 👋</h1>
                <p className='text-sm text-muted-foreground'>
                    Vous pouvez accéder à vos factures, réclamations et autres documents ici.
                </p>
            </div>

            {/* Cartes chargées prioritairement */}
            <SectionCards data={dashboardData} />

            {/* Graphiques chargés de façon différée */}
            <Suspense fallback={<ChartsLoadingFallback />}>
                <DashboardCharts />
            </Suspense>
        </div>
    )
}
