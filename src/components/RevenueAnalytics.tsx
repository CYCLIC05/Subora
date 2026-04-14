'use client'

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export type RevenuePoint = {
  date: string
  revenue: number
  members: number
}

const DEFAULT_CHART_DATA: RevenuePoint[] = [
  { date: '2024-03-01', revenue: 450, members: 12 },
  { date: '2024-03-02', revenue: 580, members: 15 },
  { date: '2024-03-03', revenue: 520, members: 18 },
  { date: '2024-03-04', revenue: 690, members: 22 },
  { date: '2024-03-05', revenue: 840, members: 26 },
  { date: '2024-03-06', revenue: 1100, members: 32 },
  { date: '2024-03-07', revenue: 1050, members: 35 },
  { date: '2024-03-08', revenue: 1300, members: 42 },
  { date: '2024-03-09', revenue: 1550, members: 48 },
  { date: '2024-03-10', revenue: 1800, members: 55 },
  { date: '2024-03-11', revenue: 2100, members: 62 },
  { date: '2024-03-12', revenue: 2450, members: 70 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  members: {
    label: "Members",
    color: "#22c55e",
  },
} satisfies ChartConfig

export function RevenueAnalytics({ chartData = DEFAULT_CHART_DATA }: { chartData?: RevenuePoint[] }) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("revenue")

  const total = React.useMemo(
    () => ({
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      members: chartData.reduce((acc, curr) => acc + curr.members, 0),
    }),
    [chartData]
  )

  return (
    <Card className="border-zinc-100 shadow-none bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-zinc-100 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-sm font-heading font-semibold text-zinc-900">Revenue Performance</CardTitle>
          <CardDescription className="text-xs text-zinc-500 font-medium">
            Projected earnings for the current billing cycle
          </CardDescription>
        </div>
        <div className="flex">
          {["revenue", "members"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6 data-[active=true]:bg-zinc-50/50"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  {chartConfig[chart].label}
                </span>
                <span className="text-xl font-heading font-bold leading-none text-zinc-950 sm:text-2xl">
                  {key === "revenue" ? `$${total[chart].toLocaleString()}` : total[chart].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillMembers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#22c55e"
                  stopOpacity={0.18}
                />
                <stop
                  offset="95%"
                  stopColor="#22c55e"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              style={{ fontSize: '10px', fontWeight: 500, fill: '#94a3b8' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              style={{ fontSize: '10px', fontWeight: 500, fill: '#94a3b8' }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[190px] rounded-[24px] border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 font-mono text-slate-900"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })
                  }}
                />
              }
            />
            <Area
              dataKey={activeChart}
              type="natural"
              fill={`url(#fill${activeChart.charAt(0).toUpperCase() + activeChart.slice(1)})`}
              stroke={chartConfig[activeChart].color}
              strokeWidth={3}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">Peak value</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {activeChart === 'revenue' ? `$${Math.max(...chartData.map((point) => point.revenue)).toLocaleString()}` : Math.max(...chartData.map((point) => point.members)).toLocaleString()}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">Weekly pace</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {activeChart === 'revenue' ? `$${Math.round(total.revenue / chartData.length).toLocaleString()}` : Math.round(total.members / chartData.length).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
