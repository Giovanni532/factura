import { getUser } from "@/actions/auth"
import { getUserInvoices } from "@/actions/facture"
import DataTableInvoice from "./data-table-invoice"

export async function generateMetadata() {
    return {
        title: "Factures | Factura",
        description: "Gérer vos factures",
    }
}

export async function generateStaticParams() {
    const response = await getUserInvoices({});
    if (!response?.data?.invoices) {
        return [];
    }
    return response.data.invoices.map((invoice) => ({ invoiceId: invoice.id }));
}

export default async function InvoicesPage() {
    // Vérifier que l'utilisateur est connecté
    const user = await getUser()

    // Récupérer les factures de l'utilisateur
    const userId = user.id as string
    const response = await getUserInvoices({ userId })

    // Si la réponse contient des erreurs, on affiche quand même la page avec un tableau vide
    const invoices = response?.data?.invoices || []

    return <DataTableInvoice invoices={invoices} />
}