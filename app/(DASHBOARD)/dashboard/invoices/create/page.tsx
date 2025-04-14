import { getClientsByUserId } from "@/actions/client"
import { getProductsByUserId } from "@/actions/produit"
import InvoiceForm from "./invoice-form"
import { User } from "@prisma/client"
import { cookies } from "next/headers"

export default async function CreateInvoicePage() {
    // Vérifier que l'utilisateur est connecté
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        credentials: 'include',
        headers: {
            Cookie: allCookies.toString(),
        },
        cache: 'no-store'
    })
    const user = await response.json();
    // Récupérer les clients de l'utilisateur
    const clientsResponse = await getClientsByUserId({ userId: user.id as string })
    const clients = clientsResponse?.data?.clients || []

    // Récupérer les produits de l'utilisateur
    const productsResponse = await getProductsByUserId({ userId: user.id as string })
    const products = productsResponse?.data?.items || []

    return (
        <InvoiceForm
            clients={clients}
            products={products}
            user={user as unknown as User}
        />
    )
}