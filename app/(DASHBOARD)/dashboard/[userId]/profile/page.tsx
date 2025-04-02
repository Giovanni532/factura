import React from 'react'
import ProfilePageClient from './profile-page'
import { getUser } from '@/actions/auth'
import { UserProfile } from '@/lib/utils'

export default async function ProfilePage() {
    const user = await getUser()
    return (
        <ProfilePageClient user={user as UserProfile} />
    )
}
