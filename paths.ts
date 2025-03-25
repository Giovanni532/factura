export const paths = {
    home: "/",
    auth: {
        signIn: "/auth/sign-in",
        signUp: "/auth/sign-up",
    },
    dashboard: {
        home: "/dashboard",
        profile: (userId: string) => `/dashboard/${userId}/profile`,

        // Quotes (Devis)
        quotes: {
            list: "/dashboard/quotes",
            create: "/dashboard/quotes/create",
            detail: (quoteId: string) => `/dashboard/quotes/${quoteId}`,
            edit: (quoteId: string) => `/dashboard/quotes/${quoteId}/edit`,
            duplicate: (quoteId: string) => `/dashboard/quotes/${quoteId}/duplicate`,
            convertToInvoice: (quoteId: string) => `/dashboard/quotes/${quoteId}/convert-to-invoice`,
        },

        // Invoices (Factures)
        invoices: {
            list: "/dashboard/invoices",
            create: "/dashboard/invoices/create",
            detail: (invoiceId: string) => `/dashboard/invoices/${invoiceId}`,
            edit: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/edit`,
            send: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/send`,
            markAsPaid: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/mark-as-paid`,
            remind: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/remind`,
        },

        // Clients
        clients: {
            list: "/dashboard/clients",
            create: "/dashboard/clients/create",
            detail: (clientId: string) => `/dashboard/clients/${clientId}`,
            edit: (clientId: string) => `/dashboard/clients/${clientId}/edit`,
        },

        // Items (Produits/Services)
        items: {
            list: "/dashboard/items",
            create: "/dashboard/items/create",
            edit: (itemId: string) => `/dashboard/items/${itemId}/edit`,
        },

        // Payments
        payments: {
            list: "/dashboard/payments",
            detail: (paymentId: string) => `/dashboard/payments/${paymentId}`,
            refund: (paymentId: string) => `/dashboard/payments/${paymentId}/refund`,
        },

        // Abonnement / Billing
        billing: {
            index: "/dashboard/billing",
            upgrade: "/dashboard/billing/upgrade",
            invoiceDetail: (invoiceId: string) => `/dashboard/billing/invoices/${invoiceId}`,
        },
    },
}
