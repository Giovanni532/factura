import { getUser } from "@/actions/auth"
import { getUserInvoices } from "@/actions/facture"
import DataTableInvoice from "./data-table-invoice"
import { cache } from 'react'

// Fonction mise en cache pour récupérer les factures
const getInvoicesData = cache(async () => {
    // Vérifier que l'utilisateur est connecté
    const user = await getUser()

    if (!user?.id) {
        return []
    }

    // Récupérer les factures de l'utilisateur
    const response = await getUserInvoices({ userId: user.id as string })
    return response?.data?.invoices || []
})

// Revalidation toutes les heures
export const revalidate = 3600;

export async function generateMetadata() {
    return {
        title: "Factures | Factura",
        description: "Gérer vos factures",
    }
}

export async function generateStaticParams() {
    const invoices = await getInvoicesData();

    if (!invoices.length) {
        return [];
    }

    return invoices.map((invoice) => ({ invoiceId: invoice.id }));
}

export default async function InvoicesPage() {
    const invoices = await getInvoicesData();
    return <DataTableInvoice invoices={invoices} />
}