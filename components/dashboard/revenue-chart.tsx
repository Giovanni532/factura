"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

    return (
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => `${value}€`}
                />
                <ChartTooltip content={<ChartTooltipContent labelKey="month" nameKey="revenue" />} />
                <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                    name="Revenus"
                />
            </BarChart>
        </ChartContainer>
    )
} 