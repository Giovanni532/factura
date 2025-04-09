"use server"

import { prisma } from "@/lib/prisma";
import { useMutation } from "@/lib/safe-action";
import { z } from "zod";

// Types for our data
export interface StatData {
    total: number;
    trend: number;
}

export interface MonthlyData {
    month: string;
    revenue: number;
}

export interface StatusData {
    status: string;
    count: number;
}

// Type d'utilisateur simplifié pour les mutations
export interface UserInfo {
    id: string;
    name?: string | null;
    email: string;
}

// Types de retour augmentés avec les infos utilisateur
export interface StatDataWithUser extends StatData {
    user: UserInfo;
}

export interface MonthlyDataWithUser {
    data: MonthlyData[];
    user: UserInfo;
}

export interface StatusDataWithUser {
    data: StatusData[];
    user: UserInfo;
}

// Define the return type for the main function
export interface DashboardData {
    cards: {
        revenue: StatData;
        clients: StatData;
        quotes: StatData;
        unpaidInvoices: StatData;
    };
    charts: {
        monthlyRevenue: MonthlyData[];
        invoiceStatus: StatusData[];
    };
    user: UserInfo;
}

// Schemas pour les mutations
const emptySchema = z.object({});

// Fonction pour récupérer les infos de l'utilisateur
async function getUserInfo(userId: string): Promise<UserInfo> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    if (!user) {
        return {
            id: userId,
            name: "Utilisateur",
            email: ""
        };
    }

    return user;
}

// Calculate total revenue from paid invoices
export const getRevenueStats = useMutation(
    emptySchema,
    async (_: z.infer<typeof emptySchema>, { user, userId }: { user: any; userId: string }): Promise<StatDataWithUser> => {
        const currentDate = new Date();
        const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Get current month revenue
        const currentMonthRevenue = await prisma.payment.aggregate({
            where: {
                userId,
                paidAt: {
                    gte: firstDayCurrentMonth,
                    lte: currentDate
                }
            },
            _sum: {
                amount: true
            }
        });

        // Get previous month revenue
        const previousMonthRevenue = await prisma.payment.aggregate({
            where: {
                userId,
                paidAt: {
                    gte: firstDayPreviousMonth,
                    lte: lastDayPreviousMonth
                }
            },
            _sum: {
                amount: true
            }
        });

        const currentTotal = currentMonthRevenue._sum.amount || 0;
        const previousTotal = previousMonthRevenue._sum.amount || 0;

        // Calculate trend percentage
        let trend = 0;
        if (previousTotal > 0) {
            trend = ((currentTotal - previousTotal) / previousTotal) * 100;
        }

        // Get user info
        const userInfo = await getUserInfo(userId);

        return {
            total: currentTotal,
            trend: Math.round(trend * 10) / 10, // Round to 1 decimal place
            user: userInfo
        };
    }
);

// Get new clients stats
export const getClientStats = useMutation(
    emptySchema,
    async (_: z.infer<typeof emptySchema>, { userId }: { user: any; userId: string }): Promise<StatDataWithUser> => {
        const currentDate = new Date();
        const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Count clients created this month
        const currentMonthClients = await prisma.client.count({
            where: {
                userId,
                createdAt: {
                    gte: firstDayCurrentMonth,
                    lte: currentDate
                }
            }
        });

        // Count clients created last month
        const previousMonthClients = await prisma.client.count({
            where: {
                userId,
                createdAt: {
                    gte: firstDayPreviousMonth,
                    lte: lastDayPreviousMonth
                }
            }
        });

        // Calculate trend percentage
        let trend = 0;
        if (previousMonthClients > 0) {
            trend = ((currentMonthClients - previousMonthClients) / previousMonthClients) * 100;
        }

        // Get user info
        const userInfo = await getUserInfo(userId);

        return {
            total: currentMonthClients,
            trend: Math.round(trend * 10) / 10, // Round to 1 decimal place
            user: userInfo
        };
    }
);

// Get quote stats
export const getQuoteStats = useMutation(
    emptySchema,
    async (_: z.infer<typeof emptySchema>, { userId }: { user: any; userId: string }): Promise<StatDataWithUser> => {
        const currentDate = new Date();
        const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Count quotes created this month
        const currentMonthQuotes = await prisma.quote.count({
            where: {
                userId,
                createdAt: {
                    gte: firstDayCurrentMonth,
                    lte: currentDate
                }
            }
        });

        // Count quotes created last month
        const previousMonthQuotes = await prisma.quote.count({
            where: {
                userId,
                createdAt: {
                    gte: firstDayPreviousMonth,
                    lte: lastDayPreviousMonth
                }
            }
        });

        // Calculate trend percentage
        let trend = 0;
        if (previousMonthQuotes > 0) {
            trend = ((currentMonthQuotes - previousMonthQuotes) / previousMonthQuotes) * 100;
        }

        // Get user info
        const userInfo = await getUserInfo(userId);

        return {
            total: currentMonthQuotes,
            trend: Math.round(trend * 10) / 10, // Round to 1 decimal place
            user: userInfo
        };
    }
);

// Get unpaid invoices total
export const getUnpaidInvoicesTotal = useMutation(
    emptySchema,
    async (_: z.infer<typeof emptySchema>, { userId }: { user: any; userId: string }): Promise<StatDataWithUser> => {
        const currentDate = new Date();
        const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Get current unpaid invoices amount
        const currentUnpaidInvoices = await prisma.invoice.aggregate({
            where: {
                userId,
                status: {
                    in: ['PENDING', 'OVERDUE']
                },
                updatedAt: {
                    gte: firstDayCurrentMonth
                }
            },
            _sum: {
                total: true
            }
        });

        // Get previous month unpaid invoices
        const previousUnpaidInvoices = await prisma.invoice.aggregate({
            where: {
                userId,
                status: {
                    in: ['PENDING', 'OVERDUE']
                },
                updatedAt: {
                    gte: firstDayPreviousMonth,
                    lte: lastDayPreviousMonth
                }
            },
            _sum: {
                total: true
            }
        });

        const currentTotal = currentUnpaidInvoices._sum.total || 0;
        const previousTotal = previousUnpaidInvoices._sum.total || 0;

        // Calculate trend percentage
        let trend = 0;
        if (previousTotal > 0) {
            trend = ((currentTotal - previousTotal) / previousTotal) * 100;
        }

        // Get user info
        const userInfo = await getUserInfo(userId);

        return {
            total: currentTotal,
            trend: Math.round(trend * 10) / 10, // Round to 1 decimal place
            user: userInfo
        };
    }
);

// Get monthly revenue data for charts
export const getMonthlyRevenueData = useMutation(
    emptySchema,
    async (_: z.infer<typeof emptySchema>, { userId }: { user: any; userId: string }): Promise<MonthlyDataWithUser> => {
        const currentDate = new Date();
        const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

        // Get all payments in the last 6 months
        const payments = await prisma.payment.findMany({
            where: {
                userId,
                paidAt: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                amount: true,
                paidAt: true
            },
            orderBy: {
                paidAt: 'asc'
            }
        });

        // Group by month
        const months: MonthlyData[] = [];

        // Create array of last 6 months
        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + i, 1);
            const monthName = monthDate.toLocaleString('default', { month: 'long' });
            months.push({
                month: monthName,
                revenue: 0
            });
        }

        // Fill in the revenue data
        payments.forEach(payment => {
            const paymentMonth = payment.paidAt.toLocaleString('default', { month: 'long' });
            const monthIndex = months.findIndex(m => m.month === paymentMonth);
            if (monthIndex !== -1) {
                months[monthIndex].revenue += payment.amount;
            }
        });

        // Get user info
        const userInfo = await getUserInfo(userId);

        return {
            data: months,
            user: userInfo
        };
    }
);

// Get invoice status distribution for pie chart
export const getInvoiceStatusDistribution = useMutation(
    emptySchema,
    async (_: z.infer<typeof emptySchema>, { userId }: { user: any; userId: string }): Promise<StatusDataWithUser> => {
        // Count invoices by status
        const statuses = ['PENDING', 'PAID', 'OVERDUE', 'CANCELED'];
        const distribution: StatusData[] = [];

        for (const status of statuses) {
            const count = await prisma.invoice.count({
                where: {
                    userId,
                    status: status as any
                }
            });

            distribution.push({
                status,
                count
            });
        }

        // Get user info
        const userInfo = await getUserInfo(userId);

        return {
            data: distribution,
            user: userInfo
        };
    }
); 