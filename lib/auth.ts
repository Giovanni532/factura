import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            try {
                const response = await fetch(`${baseUrl}/api/emails/reset-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        url,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error sending reset password email:', errorData);
                }
            } catch (error) {
                console.error('Error sending reset password email:', error);
            }
        },
        resetPasswordTokenExpiresIn: 3600, // 1 heure
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            try {
                const response = await fetch(`${baseUrl}/api/emails/verification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        url,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error sending verification email:', errorData);
                }
            } catch (error) {
                console.error('Error sending verification email:', error);
            }
        },
    },
});