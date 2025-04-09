import React from 'react'
import { getUser } from '@/actions/auth'
import { getClientsByUserId } from '@/actions/client'
import ClientTable from '@/components/clients/client-table'
import { cache } from 'react'

// Fonction mise en cache pour récupérer les clients
const getClientsData = cache(async () => {
    const user = await getUser()

    if (!user?.id) {
        return []
    }

    const response = await getClientsByUserId({ userId: user.id as string })
    return response?.data?.clients || []
})

// Revalidation toutes les heures
export const revalidate = 3600;

export default async function ClientsPage() {
    const clients = await getClientsData()

    return (
        <ClientTable clients={clients} />
    )
}
