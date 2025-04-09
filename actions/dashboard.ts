"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Types for our data
interface StatData {
    total: number;
    trend: number;
}

interface MonthlyData {
    month: string;
    revenue: number;
}

interface StatusData {
    status: string;
    count: number;
}

// Calculate total revenue from paid invoices
async function calculateRevenueStats(): Promise<StatData> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { total: 0, trend: 0 };

    const currentDate = new Date();
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get current month revenue
    const currentMonthRevenue = await prisma.payment.aggregate({
        where: {
            userId: session.user.id,
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
            userId: session.user.id,
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

    return {
        total: currentTotal,
        trend: Math.round(trend * 10) / 10 // Round to 1 decimal place
    };
}

// Get new clients stats
async function getClientStats(): Promise<StatData> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { total: 0, trend: 0 };

    const currentDate = new Date();
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Count clients created this month
    const currentMonthClients = await prisma.client.count({
        where: {
            userId: session.user.id,
            createdAt: {
                gte: firstDayCurrentMonth,
                lte: currentDate
            }
        }
    });

    // Count clients created last month
    const previousMonthClients = await prisma.client.count({
        where: {
            userId: session.user.id,
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

    return {
        total: currentMonthClients,
        trend: Math.round(trend * 10) / 10 // Round to 1 decimal place
    };
}

// Get quote stats
async function getQuoteStats(): Promise<StatData> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { total: 0, trend: 0 };

    const currentDate = new Date();
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Count quotes created this month
    const currentMonthQuotes = await prisma.quote.count({
        where: {
            userId: session.user.id,
            createdAt: {
                gte: firstDayCurrentMonth,
                lte: currentDate
            }
        }
    });

    // Count quotes created last month
    const previousMonthQuotes = await prisma.quote.count({
        where: {
            userId: session.user.id,
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

    return {
        total: currentMonthQuotes,
        trend: Math.round(trend * 10) / 10 // Round to 1 decimal place
    };
}

// Get unpaid invoices total
async function getUnpaidInvoicesTotal(): Promise<StatData> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { total: 0, trend: 0 };

    const currentDate = new Date();
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get current unpaid invoices amount
    const currentUnpaidInvoices = await prisma.invoice.aggregate({
        where: {
            userId: session.user.id,
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
            userId: session.user.id,
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

    return {
        total: currentTotal,
        trend: Math.round(trend * 10) / 10 // Round to 1 decimal place
    };
}

// Get monthly revenue data for charts
async function getMonthlyRevenueData(): Promise<MonthlyData[]> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return [];

    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

    // Get all payments in the last 6 months
    const payments = await prisma.payment.findMany({
        where: {
            userId: session.user.id,
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

    return months;
}

// Get invoice status distribution for pie chart
async function getInvoiceStatusDistribution(): Promise<StatusData[]> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return [];

    // Count invoices by status
    const statuses = ['PENDING', 'PAID', 'OVERDUE', 'CANCELED'];
    const distribution: StatusData[] = [];

    for (const status of statuses) {
        const count = await prisma.invoice.count({
            where: {
                userId: session.user.id,
                status: status as any
            }
        });

        distribution.push({
            status,
            count
        });
    }

    return distribution;
}

// Define the return type for the main function
interface DashboardData {
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
}

// Main function to get all dashboard data
export async function getDashboardData(): Promise<DashboardData> {
    const [
        revenueStats,
        clientStats,
        quoteStats,
        unpaidInvoicesStats,
        monthlyRevenueData,
        invoiceStatusDistribution
    ] = await Promise.all([
        calculateRevenueStats(),
        getClientStats(),
        getQuoteStats(),
        getUnpaidInvoicesTotal(),
        getMonthlyRevenueData(),
        getInvoiceStatusDistribution()
    ]);

    return {
        cards: {
            revenue: revenueStats,
            clients: clientStats,
            quotes: quoteStats,
            unpaidInvoices: unpaidInvoicesStats
        },
        charts: {
            monthlyRevenue: monthlyRevenueData,
            invoiceStatus: invoiceStatusDistribution
        }
    };
} 