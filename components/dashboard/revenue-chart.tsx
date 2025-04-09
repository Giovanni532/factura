"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MonthlyData } from "@/types/dashboard"

interface RevenueChartProps {
    data: MonthlyData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const chartConfig = {
        revenue: {
            label: "Revenus",
            color: "hsl(var(--chart-1))",
        },
    }

    // Format the data to add euro sign to tooltips
    const formattedData = data.map(item => ({
        ...item,
        formattedRevenue: `${item.revenue}€`
    }));

    // Calculate max value for Y axis with 10% padding
    const maxRevenue = Math.max(...data.map(item => item.revenue), 100);
    const yAxisMax = Math.ceil(maxRevenue * 1.1 / 100) * 100;

    return (
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    accessibilityLayer
                    data={formattedData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickFormatter={(value) => `${value}€`}
                        domain={[0, yAxisMax]}
                    />
                    <ChartTooltip
                        content={<ChartTooltipContent labelKey="month" nameKey="revenue" />}
                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => <span className="text-sm font-medium">Revenus mensuels</span>}
                    />
                    <Bar
                        dataKey="revenue"
                        fill="url(#revenueGradient)"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={1}
                        radius={[4, 4, 0, 0]}
                        name="Revenus"
                        animationDuration={1000}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
} 