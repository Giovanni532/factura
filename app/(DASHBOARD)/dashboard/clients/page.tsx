import React from 'react'
import { getUser } from '@/actions/auth'

export default async function ClientsPage() {
    const user = await getUser()
    return (
        <div>
            ClientsPage
        </div>
    )
}
