"use client"

import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
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
            fill: color
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

    return (
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
            <PieChart accessibilityLayer>
                <Pie
                    data={processedData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                >
                    {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
        </ChartContainer>
    )
} 