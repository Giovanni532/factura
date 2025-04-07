import { getClientsByUserId } from "@/actions/client"
import QuoteCreatePage from "./quote-create"
import { getUser } from "@/actions/auth"
import { getProductsByUserId } from "@/actions/produit"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Créer un devis | Factura",
    description: "Créer un devis",
}

export default async function CreateQuotePage() {
    const user = await getUser()
    const dataClients = await getClientsByUserId({ userId: user?.id ?? "" })
    const clients = dataClients?.data?.clients ?? []
    const dataProducts = await getProductsByUserId({ userId: user?.id ?? "" })
    const products = dataProducts?.data?.items ?? []

    return <QuoteCreatePage clients={clients} products={products} />
}