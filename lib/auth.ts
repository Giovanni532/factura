import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, _request) => {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/resend/password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    url: url,
                    token: token,
                }),
            });
        },
        resetPasswordTokenExpiresIn: 3600, // 1 hour
    },
});