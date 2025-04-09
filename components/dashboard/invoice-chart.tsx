"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { StatusData } from "@/types/dashboard"

interface InvoiceChartProps {
    data: StatusData[]
}

export function InvoiceChart({ data }: InvoiceChartProps) {
    // Process the data to add labels and colors
    const processedData = data.map(item => {
        let label = ""
        let color = ""

        switch (item.status) {
            case "PENDING":
                label = "En attente"
                color = "hsl(var(--chart-1))"
                break
            case "PAID":
                label = "Payée"
                color = "hsl(var(--chart-2))"
                break
            case "OVERDUE":
                label = "En retard"
                color = "hsl(var(--chart-3))"
                break
            case "CANCELED":
                label = "Annulée"
                color = "hsl(var(--chart-4))"
                break
            default:
                label = item.status
                color = "hsl(var(--chart-5))"
        }

        return {
            ...item,
            label,
            color,
            fill: color,
            // Format percentage for the tooltip
            percentage: ((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1) + '%'
        }
    })

    const chartConfig = {
        PENDING: {
            label: "En attente",
            color: "hsl(var(--chart-1))",
        },
        PAID: {
            label: "Payée",
            color: "hsl(var(--chart-2))",
        },
        OVERDUE: {
            label: "En retard",
            color: "hsl(var(--chart-3))",
        },
        CANCELED: {
            label: "Annulée",
            color: "hsl(var(--chart-4))",
        },
    }

    // Calculate the total number of invoices
    const totalInvoices = data.reduce((sum, item) => sum + item.count, 0)

    return (
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
                <PieChart accessibilityLayer margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    {/* Outer pie for status */}
                    <Pie
                        data={processedData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={60}
                        paddingAngle={4}
                        label={({ label, percentage }) => `${label}: ${percentage}`}
                        labelLine={false}
                        animationDuration={800}
                        animationBegin={200}
                    >
                        {processedData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="var(--background)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <ChartTooltip
                        content={<ChartTooltipContent nameKey="status" />}
                        formatter={(value, name, entry) => [`${value} (${entry.payload.percentage})`, entry.payload.label]}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        iconSize={10}
                        iconType="circle"
                        formatter={(value, entry) => {
                            // @ts-expect-error - entry type has payload
                            const { label, count } = entry.payload;
                            return <span className="text-sm font-medium">{label} ({count})</span>
                        }}
                    />

                    {/* Display total in the center */}
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-lg font-semibold fill-foreground"
                    >
                        {totalInvoices}
                    </text>
                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-muted-foreground"
                    >
                        Total
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
} 