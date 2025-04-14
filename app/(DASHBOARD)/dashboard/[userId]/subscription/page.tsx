import React from 'react'
import { SubscriptionPlans } from '@/components/subscription-plan'
import { cookies } from 'next/headers'

export default async function SubscriptionPage() {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const user = await response.json();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">Abonnement</h1>
            <SubscriptionPlans currentPlan={user?.subscription?.plan.toLowerCase() || 'free'} />
        </div>
    )
}
