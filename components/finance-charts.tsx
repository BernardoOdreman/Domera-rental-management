"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for the charts
const monthlyRevenue = [
  { month: "Jan", revenue: 18500, expenses: 12000, profit: 6500 },
  { month: "Feb", revenue: 19200, expenses: 12500, profit: 6700 },
  { month: "Mar", revenue: 20100, expenses: 13000, profit: 7100 },
  { month: "Apr", revenue: 19800, expenses: 12800, profit: 7000 },
  { month: "May", revenue: 21500, expenses: 13500, profit: 8000 },
  { month: "Jun", revenue: 22800, expenses: 14000, profit: 8800 },
  { month: "Jul", revenue: 24580, expenses: 14500, profit: 10080 },
  { month: "Aug", revenue: 25200, expenses: 15000, profit: 10200 },
  { month: "Sep", revenue: 26100, expenses: 15500, profit: 10600 },
  { month: "Oct", revenue: 27300, expenses: 16000, profit: 11300 },
  { month: "Nov", revenue: 28500, expenses: 16500, profit: 12000 },
  { month: "Dec", revenue: 29800, expenses: 17000, profit: 12800 },
]

const expenseBreakdown = [
  { name: "Maintenance", value: 35 },
  { name: "Property Tax", value: 25 },
  { name: "Insurance", value: 15 },
  { name: "Utilities", value: 10 },
  { name: "Management", value: 10 },
  { name: "Other", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const propertyPerformance = [
  { name: "123 Main St", occupancy: 95, revenue: 24000, roi: 8.2 },
  { name: "456 Oak Ave", occupancy: 100, revenue: 36000, roi: 9.5 },
  { name: "789 Pine St", occupancy: 85, revenue: 18000, roi: 7.1 },
  { name: "321 Elm St", occupancy: 90, revenue: 21000, roi: 7.8 },
  { name: "654 Maple Dr", occupancy: 100, revenue: 30000, roi: 8.9 },
]

const rentalTrends = [
  { year: "2020", q1: 1000, q2: 1050, q3: 1100, q4: 1150 },
  { year: "2021", q1: 1200, q2: 1250, q3: 1300, q4: 1350 },
  { year: "2022", q1: 1400, q2: 1450, q3: 1500, q4: 1550 },
  { year: "2023", q1: 1600, q2: 1650, q3: 1700, q4: 1750 },
  { year: "2024", q1: 1800, q2: 1850, q3: 1900, q4: 1950 },
  { year: "2025", q1: 2000, q2: 2050, q3: 2100, q4: 2150 },
]

export function FinanceCharts() {
  const [activeTab, setActiveTab] = useState("revenue")

  return (
    <Card className="shadow-[0_8px_20px_rgba(0,0,0,0.2),_0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200 hover:shadow-[0_12px_24px_rgba(0,0,0,0.25),_0_4px_12px_rgba(0,0,0,0.2)] finance-card">
      <CardHeader>
        <CardTitle>Financial Analytics</CardTitle>
        <CardDescription>Detailed financial performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="revenue">Revenue & Expenses</TabsTrigger>
            <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
            <TabsTrigger value="properties">Property Performance</TabsTrigger>
            <TabsTrigger value="trends">Rental Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--primary))",
                },
                expenses: {
                  label: "Expenses",
                  color: "hsl(var(--destructive))",
                },
                profit: {
                  label: "Profit",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-sm text-muted-foreground">
              This chart shows your monthly revenue, expenses, and profit over the past year. The bars represent revenue
              and expenses, while the line shows profit.
            </p>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <ChartContainer className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-medium mb-4">Expense Distribution</h3>
                <div className="space-y-4">
                  {expenseBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  This chart breaks down your expenses by category, helping you identify where your money is going.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <ChartContainer
              config={{
                revenue: {
                  label: "Monthly Revenue ($)",
                  color: "hsl(var(--primary))",
                },
                roi: {
                  label: "ROI (%)",
                  color: "hsl(var(--chart-3))",
                },
                occupancy: {
                  label: "Occupancy (%)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-roi)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="roi" fill="var(--color-roi)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="occupancy" fill="var(--color-occupancy)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-sm text-muted-foreground">
              Compare the performance of your properties based on monthly revenue, return on investment (ROI), and
              occupancy rates.
            </p>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <ChartContainer
              config={{
                q1: {
                  label: "Q1",
                  color: "hsl(var(--chart-1))",
                },
                q2: {
                  label: "Q2",
                  color: "hsl(var(--chart-2))",
                },
                q3: {
                  label: "Q3",
                  color: "hsl(var(--chart-3))",
                },
                q4: {
                  label: "Q4",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rentalTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="q1"
                    stackId="1"
                    stroke="var(--color-q1)"
                    fill="var(--color-q1)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="q2"
                    stackId="1"
                    stroke="var(--color-q2)"
                    fill="var(--color-q2)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="q3"
                    stackId="1"
                    stroke="var(--color-q3)"
                    fill="var(--color-q3)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="q4"
                    stackId="1"
                    stroke="var(--color-q4)"
                    fill="var(--color-q4)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-sm text-muted-foreground">
              This chart shows the average rental prices by quarter over the years, helping you identify seasonal trends
              and long-term growth.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
