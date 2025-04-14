import React from 'react'
import { getProductsByUserId } from '@/actions/produit'
import ItemTable from '@/components/items/item-table'
import { cache } from 'react'
import { cookies } from 'next/headers'

// Fonction mise en cache pour récupérer les articles
const getItemsData = cache(async () => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const user = await response.json();
    if (!user || !user.id) {
        return []
    }

    const responseProducts = await getProductsByUserId({ userId: user.id })
    return responseProducts?.data?.items || []
})

// Revalidation toutes les heures
export const revalidate = 3600;

export default async function ItemsPage() {
    const items = await getItemsData()

    return <ItemTable items={items} />
}
