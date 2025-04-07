import { getUser } from "@/actions/auth"
import { getClientsByUserId } from "@/actions/client"
import { getProductsByUserId } from "@/actions/produit"
import InvoiceForm from "../invoice-form"
import { redirect } from "next/navigation"
import { User } from "@prisma/client"

export default async function CreateInvoicePage() {
    // Vérifier que l'utilisateur est connecté
    const user = await getUser()
    if (!user) {
        redirect("/login")
    }

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
