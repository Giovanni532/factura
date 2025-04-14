import QuoteCreatePage from "./quote-create"
import { getProductsByUserId } from "@/actions/produit"
import { Metadata } from "next"
import { cookies } from "next/headers"
export const metadata: Metadata = {
    title: "Créer un devis | Factura",
    description: "Créer un devis",
}

export default async function CreateQuotePage() {
    const allCookies = await cookies()
    const responseUser = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })

    const responseClients = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/clients`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })

    const user = await responseUser.json();
    const dataClients = await responseClients.json();
    const clients = dataClients?.clients ?? []
    const dataProducts = await getProductsByUserId({ userId: user?.id ?? "" })
    const products = dataProducts?.data?.items ?? []
    return <QuoteCreatePage clients={clients} products={products} />
}