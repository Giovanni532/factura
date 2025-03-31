import React from 'react'
import ProfilePageClient from './profile-page'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function ProfilePage() {
    await sleep(2000)
    return (
            <ProfilePageClient />
    )
}
