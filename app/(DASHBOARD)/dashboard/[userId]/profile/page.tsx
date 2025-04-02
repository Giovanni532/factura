import React from 'react'
import ProfilePageClient from './profile-page'
import { getUser } from '@/actions/auth'
import { UserProfile } from '@/lib/utils'

export async function generateMetadata() {
    const user = await getUser();
    if (!user?.id) {
        return [];
    }
    return {
        title: `Profil ${user.firstName} ${user.lastName} | Factura`,
        description: `Voir le profil de l'utilisateur ${user.firstName} ${user.lastName}`,
    }
}

export default async function ProfilePage() {
    const user = await getUser()
    return (
        <ProfilePageClient user={user as UserProfile} />
    )
}
