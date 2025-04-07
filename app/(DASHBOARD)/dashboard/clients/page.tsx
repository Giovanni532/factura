import React from 'react'
import { getUser } from '@/actions/auth'
import { getClientsByUserId } from '@/actions/client'
import ClientTable from '@/components/clients/client-table'

export default async function ClientsPage() {
    const user = await getUser()

    const response = await getClientsByUserId({ userId: user.id as string })
    const clients = response?.data?.clients || []

    return (
        <ClientTable clients={clients} />
    )
}
