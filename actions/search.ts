"use server"

import { prisma } from "@/lib/prisma"
import { useMutation } from "@/lib/safe-action"
import { z } from "zod"

// Define the search query schema
const searchSchema = z.object({
    query: z.string().min(1).max(100),
})

// Define the types for the search results
export type SearchResult = {
    id: string;
    type: "invoice" | "quote" | "client";
    title: string;
    description: string;
    url: string;
    createdAt?: Date;
}

export type SearchResponse = {
    results: SearchResult[];
}

export const search = useMutation(
    searchSchema,
    async ({ query }, { userId }) => {
        try {
            if (!userId) {
                throw new Error("Vous n'êtes pas autorisé à effectuer cette recherche");
            }

            // Trim and prepare the search query
            const searchTerm = query.trim();

            if (!searchTerm) {
                return { data: { results: [] } };
            }

            // Search in clients
            const clients = await prisma.client.findMany({
                where: {
                    userId,
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { company: { contains: searchTerm, mode: 'insensitive' } },
                        { phone: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                },
                take: 5, // Limit results
            });

            // Search in invoices
            const invoices = await prisma.invoice.findMany({
                where: {
                    userId,
                    OR: [
                        { id: { contains: searchTerm, mode: 'insensitive' } },
                        {
                            client: {
                                OR: [
                                    { name: { contains: searchTerm, mode: 'insensitive' } },
                                    { company: { contains: searchTerm, mode: 'insensitive' } },
                                ]
                            }
                        },
                        {
                            invoiceItems: {
                                some: {
                                    item: {
                                        name: { contains: searchTerm, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    client: true,
                },
                take: 5, // Limit results
            });

            // Search in quotes
            const quotes = await prisma.quote.findMany({
                where: {
                    userId,
                    OR: [
                        { id: { contains: searchTerm, mode: 'insensitive' } },
                        {
                            client: {
                                OR: [
                                    { name: { contains: searchTerm, mode: 'insensitive' } },
                                    { company: { contains: searchTerm, mode: 'insensitive' } },
                                ]
                            }
                        },
                        {
                            quoteItems: {
                                some: {
                                    item: {
                                        name: { contains: searchTerm, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    client: true,
                },
                take: 5, // Limit results
            });

            // Format client results
            const clientResults: SearchResult[] = clients.map(client => ({
                id: client.id,
                type: "client",
                title: client.name,
                description: client.company || client.email,
                url: `/dashboard/clients/${client.id}`,
                createdAt: client.createdAt,
            }));

            // Format invoice results
            const invoiceResults: SearchResult[] = invoices.map(invoice => ({
                id: invoice.id,
                type: "invoice",
                title: `Facture FAC-${invoice.id.slice(0, 8)}`,
                description: `${invoice.client.name} - ${invoice.total.toFixed(2)} €`,
                url: `/dashboard/invoices/${invoice.id}`,
                createdAt: invoice.createdAt,
            }));

            // Format quote results
            const quoteResults: SearchResult[] = quotes.map(quote => ({
                id: quote.id,
                type: "quote",
                title: `Devis DEV-${quote.id.slice(0, 8)}`,
                description: `${quote.client.name} - ${quote.total.toFixed(2)} €`,
                url: `/dashboard/quotes/${quote.id}`,
                createdAt: quote.createdAt,
            }));

            // Combine and sort results by creation date (newest first)
            const results = [...clientResults, ...invoiceResults, ...quoteResults]
                .sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return b.createdAt.getTime() - a.createdAt.getTime();
                });

            return { data: { results } };
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            throw error;
        }
    }
); 