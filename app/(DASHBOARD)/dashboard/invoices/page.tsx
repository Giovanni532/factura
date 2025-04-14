import { getUserInvoices } from "@/actions/facture"
import DataTableInvoice from "./data-table-invoice"
import { cache } from 'react'
import { cookies } from "next/headers"

// Fonction mise en cache pour récupérer les factures
const getInvoicesData = cache(async () => {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`,
        {
            credentials: 'include',
            headers: {
                Cookie: allCookies.toString(),
            },
        }
    )
    const user = await response.json();
    if (!user?.id) {
        return []
    }

    // Récupérer les factures de l'utilisateur
    const responseInvoices = await getUserInvoices({ userId: user.id as string })
    return responseInvoices?.data?.invoices || []
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