"use server"

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export interface MonthlyData {
    month: string;
    revenue: number;
}

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentDate = new Date();
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get current month revenue
    const currentMonthRevenue = await prisma.payment.aggregate({
        where: {
            userId: user.id,
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
            userId: user.id,
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
    let trendPercentage = 0;
    if (previousTotal > 0) {
        trendPercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
    }

    // Count clients created this month
    const currentMonthClients = await prisma.client.count({
        where: {
            userId: user.id,
            createdAt: {
                gte: firstDayCurrentMonth,
                lte: currentDate
            }
        }
    });

    // Count clients created last month
    const previousMonthClients = await prisma.client.count({
        where: {
            userId: user.id,
            createdAt: {
                gte: firstDayPreviousMonth,
                lte: lastDayPreviousMonth
            }
        }
    });

    // Calculate trend percentage
    let clientsTrendPercentage = 0;
    if (previousMonthClients > 0) {
        clientsTrendPercentage = ((currentMonthClients - previousMonthClients) / previousMonthClients) * 100;
    }

    const currentMonthQuotes = await prisma.quote.count({
        where: {
            userId: user.id,
            createdAt: {
                gte: firstDayCurrentMonth,
                lte: currentDate
            }
        }
    });

    // Count quotes created last month
    const previousMonthQuotes = await prisma.quote.count({
        where: {
            userId: user.id,
            createdAt: {
                gte: firstDayPreviousMonth,
                lte: lastDayPreviousMonth
            }
        }
    });

    // Calculate trend percentage
    let quotesTrendPercentage = 0;
    if (previousMonthQuotes > 0) {
        quotesTrendPercentage = ((currentMonthQuotes - previousMonthQuotes) / previousMonthQuotes) * 100;
    }

    const currentUnpaidInvoices = await prisma.invoice.aggregate({
        where: {
            userId: user.id,
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
            userId: user.id,
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

    const currentUnpaidInvoicesTotal = currentUnpaidInvoices._sum.total || 0;
    const previousUnpaidInvoicesTotal = previousUnpaidInvoices._sum.total || 0;

    // Calculate trend percentage
    let unpaidInvoicesTrendPercentage = 0;
    if (previousUnpaidInvoicesTotal > 0) {
        unpaidInvoicesTrendPercentage = ((currentUnpaidInvoicesTotal - previousUnpaidInvoicesTotal) / previousUnpaidInvoicesTotal) * 100;
    }

    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

    // Get all payments in the last 6 months
    const payments = await prisma.payment.findMany({
        where: {
            userId: user.id,
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


    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        stats: {
            revenue: {
                total: currentTotal,
                trend: Math.round(trendPercentage * 10) / 10,
            },
            clients: {
                total: currentMonthClients,
                trend: Math.round(clientsTrendPercentage * 10) / 10,
            },
            quotes: {
                total: currentMonthQuotes,
                trend: Math.round(quotesTrendPercentage * 10) / 10,
            },
            unpaidInvoices: {
                total: currentUnpaidInvoicesTotal,
                trend: Math.round(unpaidInvoicesTrendPercentage * 10) / 10,
            }
        },
        charts: {
            monthlyRevenue: months,
        }
    });
}