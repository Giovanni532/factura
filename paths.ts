export const paths = {
    home: "/",
    auth: {
        signIn: "/auth/sign-in",
        signUp: "/auth/sign-up",
    },
    dashboard: {
        home: "/dashboard",
        profile: (userId: string) => `/dashboard/${userId}/profile`,
    },
}
