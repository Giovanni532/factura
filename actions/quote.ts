"use server"

import { useMutation } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { getUserQuotesSchema, getQuoteByIdSchema } from "@/validations/quotes-schema";

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

// Type for detailed quote info with address and items
export interface QuoteDetail {
    id: string;
    number: string;
    client: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
    };
    company: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
        logo?: string;
        taxId: string;
    };
    items: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    createdAt: Date;
    dueDate: Date;
    status: QuoteStatus;
    discount?: {
        type: "percentage" | "fixed";
        value: number;
    };
    notes?: string;
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
            return { quotes: [] };
        }
    }
);

// Server action to get a specific quote by ID
export const getQuoteById = useMutation(
    getQuoteByIdSchema,
    async (input, { userId }) => {
        try {
            // Fetch the quote by ID, ensuring it belongs to the current user
            const quote = await prisma.quote.findUnique({
                where: {
                    id: input.id,
                    userId: userId
                },
                include: {
                    client: true,
                    quoteItems: {
                        include: {
                            item: true
                        }
                    },
                    user: {
                        include: {
                            businesses: true
                        }
                    }
                }
            });

            // If quote doesn't exist or doesn't belong to the user
            if (!quote) {
                return { quote: null };
            }

            // Get the user's business info
            const business = quote.user.businesses[0]; // Assuming the user has at least one business

            // Extract client address components or provide defaults
            const clientAddress = quote.client.address?.split('\n') || [];
            const [street = "", cityInfo = "", country = ""] = clientAddress;
            const cityParts = cityInfo.split(' ');
            const postalCode = cityParts.length > 0 ? cityParts[0] : "";
            const city = cityParts.slice(1).join(' ') || "";

            // Extract business address components or provide defaults
            const businessAddress = business?.address?.split('\n') || [];
            const [bizStreet = "", bizCityInfo = "", bizCountry = ""] = businessAddress;
            const bizCityParts = bizCityInfo.split(' ');
            const bizPostalCode = bizCityParts.length > 0 ? bizCityParts[0] : "";
            const bizCity = bizCityParts.slice(1).join(' ') || "";

            // Format quote items
            const items = quote.quoteItems.map(qItem => ({
                id: qItem.id,
                name: qItem.item.name,
                description: qItem.item.description || "",
                quantity: qItem.quantity,
                unitPrice: qItem.unitPrice,
                taxRate: 20 // Default tax rate, could be stored in the DB in a real implementation
            }));

            // Create discount object if applicable
            // In this example implementation, we'll assume no discount is applied
            // A real implementation would use data from the database
            const discount = undefined;

            // Transform the database quote to the format expected by the frontend
            const formattedQuote: QuoteDetail = {
                id: quote.id,
                number: `DEV-${quote.id.slice(0, 8)}`,
                client: {
                    name: quote.client.name,
                    email: quote.client.email,
                    address: {
                        street: street,
                        city: city,
                        postalCode: postalCode,
                        country: country
                    }
                },
                company: {
                    name: business?.name || "Your Company",
                    email: quote.user.email || "contact@company.com",
                    address: {
                        street: bizStreet,
                        city: bizCity,
                        postalCode: bizPostalCode,
                        country: bizCountry
                    },
                    logo: business?.logoUrl || undefined,
                    taxId: "FR 76 123 456 789" // Example tax ID, could be stored in business model
                },
                items: items,
                createdAt: quote.createdAt,
                dueDate: quote.validUntil || new Date(),
                status: mapStatus(quote.status),
                discount: discount,
                notes: "Ce devis est valable 30 jours à compter de sa date d'émission. Le paiement est dû dans les 15 jours suivant l'acceptation du devis." // Example note
            };

            return { quote: formattedQuote };
        } catch (error) {
            console.error("Error fetching quote:", error);
            return { quote: null };
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
