import React from 'react'
import { getUser } from '@/actions/auth'
import { getProductsByUserId } from '@/actions/produit'
import ItemTable from '@/components/items/item-table'
import { redirect } from 'next/navigation'

export default async function ItemsPage() {
    const user = await getUser()

    if (!user || !user.id) {
        redirect('/login')
    }

    const response = await getProductsByUserId({ userId: user.id })
    // Récupérer les produits avec une structure de secours pour éviter les erreurs
    const items = response?.data?.items || []

    return <ItemTable items={items} />
}
