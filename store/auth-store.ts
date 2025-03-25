import { create } from 'zustand'
import { getSession, signIn, signOut, signUp } from '@/lib/auth-client'

interface User {
    id?: string
    name?: string | null
    email?: string
    image?: string | null
}

interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    setUser: (user: User | null) => void
    setIsAuthenticated: (isAuthenticated: boolean) => void
    setIsLoading: (isLoading: boolean) => void
    login: typeof signIn.email
    register: typeof signUp.email
    logout: typeof signOut
    checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => set({ user }),
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setIsLoading: (isLoading) => set({ isLoading }),

    login: signIn.email,
    register: signUp.email,
    logout: signOut,

    checkAuth: async () => {
        set({ isLoading: true })
        try {
            const { data: session, error } = await getSession()
            if (error || !session) {
                set({ isAuthenticated: false, user: null })
            } else {
                set({
                    isAuthenticated: true,
                    user: {
                        id: session.user?.id,
                        name: session.user?.name,
                        email: session.user?.email,
                        image: session.user?.image
                    }
                })
            }
        } catch (error) {
            set({ isAuthenticated: false, user: null })
        } finally {
            set({ isLoading: false })
        }
    }
})) 