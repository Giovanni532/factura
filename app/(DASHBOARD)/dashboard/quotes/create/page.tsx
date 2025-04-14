import { getClientsByUserId } from "@/actions/client"
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const user = await response.json();
    const dataClients = await getClientsByUserId({ userId: user?.id ?? "" })
    const clients = dataClients?.data?.clients ?? []
    const dataProducts = await getProductsByUserId({ userId: user?.id ?? "" })
    const products = dataProducts?.data?.items ?? []
    return <QuoteCreatePage clients={clients} products={products} />
}