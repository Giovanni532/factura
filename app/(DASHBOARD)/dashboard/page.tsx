import { getUser } from '@/actions/auth'
import React from 'react'

export default async function DashboardPage() {
    const user = await getUser()
    return (
        <div>
            <p>Bonjour {user?.name} 👋</p>
        </div>
    )
}
