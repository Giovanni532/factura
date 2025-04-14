import React from 'react'
import ProfilePageClient from './profile-page'
import { UserProfile } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function generateMetadata() {
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
        return [];
    }
    return {
        title: `Profil ${user.firstName} ${user.lastName} | Factura`,
        description: `Voir le profil de l'utilisateur ${user.firstName} ${user.lastName}`,
    }
}

export default async function ProfilePage() {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
    })
    const user = await response.json();
    return (
        <ProfilePageClient user={user as UserProfile} />
    )
}
