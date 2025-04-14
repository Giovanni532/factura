import React from 'react'
import { getClientsByUserId } from '@/actions/client'
import ClientTable from '@/components/clients/client-table'
import { cache } from 'react'
import { cookies } from 'next/headers'
// Fonction mise en cache pour récupérer les clients
const getClientsData = cache(async () => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const user = await response.json();
    if (!user?.id) {
        return []
    }

    const responseClients = await getClientsByUserId({ userId: user.id as string })
    return responseClients?.data?.clients || []
})

// Revalidation toutes les heures
export const revalidate = 3600;

export default async function ClientsPage() {
    const clients = await getClientsData()

    return (
        <ClientTable clients={clients} />
    )
}
