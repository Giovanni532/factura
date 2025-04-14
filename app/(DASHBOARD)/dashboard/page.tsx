import React, { Suspense } from 'react'
import { SectionCards } from './section-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardData } from '@/types/dashboard'
import { cache } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cookies } from 'next/headers'

// Fonction mise en cache qui récupère les données du dashboard via l'API
const getDashboardData = cache(async () => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        console.error('Failed to fetch dashboard data:', response.status);
        return {
            user: { id: "", name: "Utilisateur", email: "" },
            stats: {
                revenue: { total: 0, trend: 0 },
                clients: { total: 0, trend: 0 },
                quotes: { total: 0, trend: 0 },
                unpaidInvoices: { total: 0, trend: 0 }
            },
            charts: {
                monthlyRevenue: []
            }
        };
    }

    const data = await response.json();

    return data;
});

// Composant pour les graphiques avec chargement retardé
async function DashboardCharts() {
    const dashboardData = await getDashboardData();

    return (
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
    // Récupérer les données du dashboard
    const apiData = await getDashboardData();

    // Construire l'objet de données pour les cartes
    const dashboardData: DashboardData = {
        cards: {
            revenue: apiData.stats.revenue,
            clients: apiData.stats.clients,
            quotes: apiData.stats.quotes,
            unpaidInvoices: apiData.stats.unpaidInvoices
        },
        charts: {
            monthlyRevenue: apiData.charts.monthlyRevenue,
            invoiceStatus: apiData.charts?.invoiceStatus || []
        },
        user: apiData.user
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <h1 className='text-2xl font-bold'>Bonjour {dashboardData.user.name} 👋</h1>
                <p className='text-sm text-muted-foreground'>
                    Vous pouvez accéder à vos factures, réclamations et autres documents ici.
                </p>
            </div>

            {/* Cartes avec les statistiques */}
            <SectionCards data={dashboardData} />

            {/* Graphiques chargés de façon différée */}
            <Suspense fallback={<ChartsLoadingFallback />}>
                <DashboardCharts />
            </Suspense>
        </div>
    )
}
