import React from 'react'
import { SubscriptionPlans } from '@/components/subscription-plan'
import { getUser } from '@/actions/auth'

export default async function SubscriptionPage() {
    const user = await getUser()

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">Abonnement</h1>
            <SubscriptionPlans currentPlan={user?.subscription?.plan.toLowerCase() || 'free'} />
        </div>
    )
}
