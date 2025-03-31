"use server"

import { useMutation } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { getUserQuotesSchema } from "@/validations/quotes-schema";

// Type for status - matching the enum in the database
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED"

// Type for client data - matching the frontend expectations
export interface QuoteClient {
    name: string
    company?: string
}

// Type for quote data - matching the frontend expectations
export interface Quote {
    id: string
    number: string
    client: QuoteClient
    createdAt: Date
    dueDate: Date
    amount: number
    status: QuoteStatus
}

// Schema for getting user quotes
// Server action to get all quotes for the currently authenticated user
export const getUserQuotes = useMutation(
    getUserQuotesSchema,
    async (_input, { userId }) => {
        try {
            // Fetch quotes from database that belong to the current user
            const quotes = await prisma.quote.findMany({
                where: {
                    userId: userId
                },
                include: {
                    client: true,
                    quoteItems: {
                        include: {
                            item: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Transform database quotes to the format expected by the frontend
            const formattedQuotes: Quote[] = quotes.map(quote => ({
                id: quote.id,
                number: `DEV-${quote.id.slice(0, 8)}`, // Generate a number based on ID
                client: {
                    name: quote.client.name,
                    company: quote.client.company || undefined
                },
                createdAt: quote.createdAt,
                dueDate: quote.validUntil || new Date(), // Use validUntil or fallback to current date
                amount: quote.total,
                status: mapStatus(quote.status) // Convert database status to frontend status
            }));

            return { quotes: formattedQuotes };
        } catch (error) {
            console.error("Error fetching quotes:", error);
            throw new Error("Failed to fetch quotes");
        }
    }
);

// Helper function to map database status to frontend status
function mapStatus(status: any): QuoteStatus {
    // Map from database enum values to frontend expected values
    const statusMap: Record<string, QuoteStatus> = {
        'DRAFT': 'DRAFT',
        'SENT': 'SENT',
        'ACCEPTED': 'ACCEPTED',
        'REJECTED': 'REJECTED'
    };

    return statusMap[status] || 'DRAFT';
}
