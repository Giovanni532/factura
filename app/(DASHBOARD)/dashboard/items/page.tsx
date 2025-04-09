import React from 'react'
import { getUser } from '@/actions/auth'
import { getProductsByUserId } from '@/actions/produit'
import ItemTable from '@/components/items/item-table'
import { redirect } from 'next/navigation'
import { cache } from 'react'

// Fonction mise en cache pour récupérer les articles
const getItemsData = cache(async () => {
    const user = await getUser()

    if (!user || !user.id) {
        return []
    }

    const response = await getProductsByUserId({ userId: user.id })
    return response?.data?.items || []
})

// Revalidation toutes les heures
export const revalidate = 3600;

export default async function ItemsPage() {
    const user = await getUser()

    if (!user || !user.id) {
        redirect('/login')
    }

    const items = await getItemsData()

    return <ItemTable items={items} />
}
