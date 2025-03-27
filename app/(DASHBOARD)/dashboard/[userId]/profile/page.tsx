import React from 'react'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function ProfilePage() {
    await sleep(2000)
    return (
        <div>ProfilePage</div>
    )
}
