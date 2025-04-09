// Type d'utilisateur simplifié
export interface UserInfo {
    id: string;
    name?: string | null;
    email: string;
}

// Types for dashboard statistics
export interface StatData {
    total: number;
    trend: number;
}

// Type for monthly revenue data
export interface MonthlyData {
    month: string;
    revenue: number;
}

// Type for status distribution data
export interface StatusData {
    status: string;
    count: number;
}

// Dashboard data structure
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