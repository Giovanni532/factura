import { getClientsByUserId } from "@/actions/client"
import QuoteCreatePage from "./quote-create"
import { getUser } from "@/actions/auth"
import { getProductsByUserId } from "@/actions/produit"

export default async function CreateQuotePage() {
    const user = await getUser()
    const dataClients = await getClientsByUserId({ userId: user?.id ?? "" })
    const clients = dataClients?.data?.data.clients ?? []
    const dataProducts = await getProductsByUserId({ userId: user?.id ?? "" })
    const products = dataProducts?.data?.data.items ?? []

    console.log(clients)
    return <QuoteCreatePage clients={clients} products={products} />
}