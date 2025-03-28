import { createAuthClient } from "better-auth/client"

// This is a client-side only file
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
})

export { authClient }