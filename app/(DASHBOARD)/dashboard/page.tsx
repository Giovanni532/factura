import { getUser } from '@/actions/auth'
import React from 'react'
import { SectionCards } from './section-cards'

export default async function DashboardPage() {
    const user = await getUser()

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <h1 className='text-2xl font-bold'>Bonjour {user?.firstName} {user?.lastName} 👋</h1>
                <p className='text-sm text-muted-foreground'>
                    Vous pouvez accéder à vos factures, réclamations et autres documents ici.
                </p>
            </div>
            <SectionCards />
        </div>
    )
}
