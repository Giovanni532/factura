import { getUser } from '@/actions/auth'
import React from 'react'
import { SectionCards } from './section-cards'

export default async function DashboardPage() {
    const user = await getUser()
    const fakeData = [
        {
            id: '1',
            client: 'John Doe',
            montant: 100,
            statut: 'Brouillon',
            echeance: '2024-01-01',
        },
        {
            id: '2',
            client: 'Jane Doe',
            montant: 200,
            statut: 'Envoyé',
            echeance: '2024-01-01',
        },

    ]
    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 ml-6'>
                <h1 className='text-2xl font-bold'>Bonjour {user?.name} 👋</h1>
                <p className='text-sm text-muted-foreground'>
                    Vous pouvez accéder à vos factures, réclamations et autres documents ici.
                </p>
            </div>
            <SectionCards />
        </div>
    )
}
