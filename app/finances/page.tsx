"use client"

import { useState } from "react"
import { CreditCard, DollarSign, Plus, Receipt, CreditCardIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { usePropertyContext } from "@/context/property-context"
import { FinanceCharts } from "@/components/finance-charts"

// Mock payment history data
const paymentHistory = [
  {
    id: "pay1",
    tenantName: "Sarah Johnson",
    propertyAddress: "123 Main St, Apt 4B",
    amount: 1200,
    date: "2025-03-01",
    status: "completed",
    method: "Stripe",
  },
  {
    id: "pay2",
    tenantName: "Michael Brown",
    propertyAddress: "456 Oak Ave, Unit 2",
    amount: 1800,
    date: "2025-03-03",
    status: "completed",
    method: "PayPal",
  },
  {
    id: "pay3",
    tenantName: "Michael Brown",
    propertyAddress: "456 Oak Ave, Unit 2",
    amount: 1800,
    date: "2025-02-01",
    status: "completed",
    method: "Stripe",
  },
  {
    id: "pay4",
    tenantName: "Sarah Johnson",
    propertyAddress: "123 Main St, Apt 4B",
    amount: 1200,
    date: "2025-02-02",
    status: "completed",
    method: "Bank Transfer",
  },
]

// Mock payment methods
const paymentMethods = [
  {
    id: "pm1",
    type: "stripe",
    name: "Stripe",
    details: "Connected on Mar 15, 2025",
    status: "active",
  },
  {
    id: "pm2",
    type: "paypal",
    name: "PayPal",
    details: "Connected on Feb 10, 2025",
    status: "active",
  },
]

export default function FinancesPage() {
  const { tenants } = usePropertyContext()
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate financial metrics
  const totalMonthlyRent = tenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0)
  const paidRent = tenants.filter((t) => t.paymentStatus === "paid").reduce((sum, tenant) => sum + tenant.rentAmount, 0)
  const pendingRent = tenants
    .filter((t) => t.paymentStatus === "pending")
    .reduce((sum, tenant) => sum + tenant.rentAmount, 0)
  const overdueRent = tenants
    .filter((t) => t.paymentStatus === "overdue")
    .reduce((sum, tenant) => sum + tenant.rentAmount, 0)

  const collectionRate = totalMonthlyRent > 0 ? Math.round((paidRent / totalMonthlyRent) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">Manage payments, invoices, and financial reports</p>
        </div>
        <Button asChild>
          <Link href="/finances/send-request">
            <Plus className="mr-2 h-4 w-4" />
            Send Payment Request
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="dashboard-card finance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Rent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalMonthlyRent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From {tenants.length} active tenants</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card finance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collected Rent</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${paidRent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{collectionRate}% collection rate</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card finance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Rent</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pendingRent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {tenants.filter((t) => t.paymentStatus === "pending").length} pending payments
                </p>
              </CardContent>
            </Card>

            <Card className="dashboard-card finance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Rent</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overdueRent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {tenants.filter((t) => t.paymentStatus === "overdue").length} overdue payments
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="dashboard-card finance-card">
            <CardHeader>
              <CardTitle>Tenant Payment Status</CardTitle>
              <CardDescription>Current month rent collection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.propertyAddress}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">${tenant.rentAmount}</p>
                      <Badge
                        className={
                          tenant.paymentStatus === "paid"
                            ? "bg-green-500"
                            : tenant.paymentStatus === "pending"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      >
                        {tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1)}
                      </Badge>
                      {tenant.paymentStatus !== "paid" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/finances/send-request?tenantId=${tenant.id}`}>Send Reminder</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FinanceCharts />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="dashboard-card finance-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{payment.tenantName}</p>
                      <p className="text-sm text-muted-foreground">{payment.propertyAddress}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${payment.amount}</p>
                        <p className="text-xs text-muted-foreground">via {payment.method}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card className="dashboard-card finance-card">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment processing methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      {method.type === "stripe" ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <CreditCardIcon className="h-5 w-5 text-primary" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                          <DollarSign className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.details}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full">
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Connect Stripe
              </Button>
              <Button variant="outline" className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Connect PayPal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
