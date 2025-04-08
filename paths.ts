export const paths = {
    home: "/",
    auth: {
        signIn: "/auth/sign-in",
        signUp: "/auth/sign-up",
        forgetPassword: "/auth/forget-password",
        resetPassword: "/auth/reset-password",
    },
    dashboard: {
        home: "/dashboard",
        profile: (userId: string) => `/dashboard/${userId}/profile`,

        quotes: {
            list: "/dashboard/quotes",
            create: "/dashboard/quotes/create",
            detail: (quoteId: string) => `/dashboard/quotes/${quoteId}`,
            edit: (quoteId: string) => `/dashboard/quotes/${quoteId}/edit`,
        },

        invoices: {
            list: "/dashboard/invoices",
            create: "/dashboard/invoices/create",
            detail: (invoiceId: string) => `/dashboard/invoices/${invoiceId}`,
            edit: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/edit`,
        },


        clients: {
            list: "/dashboard/clients",
        },

        items: {
            list: "/dashboard/items",
        },

        subscription: {
            index: (userId: string) => `/dashboard/${userId}/subscription`,
            invoices: {
                list: (userId: string) => `/dashboard/${userId}/subscription/invoices`,
                detail: (userId: string, invoiceId: string) => `/dashboard/${userId}/subscription/invoices/${invoiceId}`,
            },
        },
    },
}
