"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Building,
  Calendar,
  CreditCard,
  MessageSquare,
  PenToolIcon as Tool,
  PieChart,
  Users,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { usePropertyContext } from "@/context/property-context"
import { useLandlord } from "@/context/user-context"
import { WeekCalendar } from "@/components/week-calendar"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  
  const { landlord } = useLandlord()

  const user = {
    name: landlord.name,
    email: landlord.email,
    avatar: "/placeholder-user.jpg",

  }
  const router = useRouter()

  // Safely access context or use default values
  const context = usePropertyContext()
  const properties = context?.properties || []
  const totalProperties = context?.totalProperties || 0
  const vacantProperties = context?.vacantProperties || 0
  const maintenanceRequests = context?.maintenanceRequests || []
  const totalMaintenanceRequests = context?.totalMaintenanceRequests || 0
  const tenants = context?.tenants || []
  const totalTenants = context?.totalTenants || 0
  const messages = context?.messages || []
  const unreadMessages = context?.unreadMessages || 0
  const rentCollected = context?.rentCollected || 0
  const rentPending = context?.rentPending || 0

  // Calculate metrics
  const totalRent = rentCollected + rentPending
  const collectedPercentage = totalRent > 0 ? Math.round((rentCollected / totalRent) * 100) : 0
  const pendingPercentage = totalRent > 0 ? Math.round((rentPending / totalRent) * 100) : 0
  const pendingRequests = maintenanceRequests.filter((req) => req.status === "pending").length
  const inProgressRequests = maintenanceRequests.filter((req) => req.status === "in progress").length

  // Metrics data for the unified bar
  const metricsData = [
    {
      icon: Building,
      value: totalProperties,
      label: "Properties",
      sublabel:
        vacantProperties > 0 ? (
          <span className="text-red-600 dark:text-red-500 font-medium">{vacantProperties} vacant</span>
        ) : (
          <span className="text-green-600 dark:text-green-500 font-medium">No vacant properties</span>
        ),
      href: "/properties",
    },
    {
      icon: Users,
      value: totalTenants,
      label: "Tenants",
      sublabel: `${totalProperties - vacantProperties} occupied units`,
      href: "/tenants",
    },
    {
      icon: Tool,
      value: totalMaintenanceRequests,
      label: "Requests",
      sublabel: `${pendingRequests} pending, ${inProgressRequests} in progress`,
      href: "/maintenance",
    },
    {
      icon: CreditCard,
      value: `${totalRent.toLocaleString()}`,
      label: "Revenue",
      sublabel: `${collectedPercentage}% collected this month`,
      href: "/finances",
      isRevenue: true,
      isPositive: totalRent > 0,
    },
  ]

  return (
    <>
      <div className="space-y-3 h-[calc(100vh-90px)] flex flex-col">
        {/* Compact header with greeting and action button */}
        <div className="flex items-center justify-between">
          
          <h2 className="text-xl font-bold">Hello, {user.name.split(" ")[0] }</h2>

          <Button size="sm" asChild className="h-7"> 
            <Link href="/properties/add">
              <Plus className="mr-1 h-3 w-3" />
              Add Property
            </Link>
          </Button>
        </div>

        {/* Unified metrics bar - more compact */}
        <div className="bg-card rounded-lg border border-border/10 overflow-hidden shadow-sm">
          <div className="grid grid-cols-4 divide-x divide-border/10">
            {metricsData.map((metric, index) => (
              <Link
                key={index}
                href={metric.href}
                className="flex items-center justify-center py-2 px-2 transition-all duration-200 hover:bg-muted/30 group relative"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1.5 group-hover:bg-primary/20 transition-colors">
                    <metric.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-base font-bold leading-none",
                          !metric.isRevenue && "text-black dark:text-white",
                          metric.isRevenue && metric.isPositive && "text-emerald-600 dark:text-emerald-500",
                          metric.isRevenue && !metric.isPositive && "text-red-600 dark:text-red-500",
                        )}
                      >
                        {metric.value}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{metric.label}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{metric.sublabel}</div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/0 group-hover:bg-primary/40 transition-colors"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content area with 2-column grid - flex-1 to take remaining space */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {/* Left Column - flex column to distribute space evenly */}
          <div className="flex flex-col gap-3">
            {/* Rent Collection - flex-1 to expand and match height */}
            <Card className="border-0 shadow-sm dashboard-card flex-1 flex flex-col">
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Rent Collection Status</CardTitle>
                  <CardDescription className="text-[11px]">March 2025 - {collectedPercentage}% collected</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-1.5" asChild>
                  <Link href="/finances">
                    <span className="text-[10px]">Details</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="py-0 px-3 flex-1 max-h-[180px] overflow-y-auto">
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center">
                        <span>Collected</span>
                      </div>
                      <div>{collectedPercentage}%</div>
                    </div>
                    <Progress
                      value={collectedPercentage}
                      className="h-1.5 rounded-full bg-muted/40"
                      indicatorClassName="bg-gradient-to-r from-primary/80 to-primary rounded-full"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center">
                        <span>Pending</span>
                      </div>
                      <div>{pendingPercentage}%</div>
                    </div>
                    <Progress
                      value={pendingPercentage}
                      className="h-1.5 rounded-full bg-muted/40"
                      indicatorClassName="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Tenant payment status - expanded to fill space */}
                <div className="mt-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-medium">Tenant Payment Status</h4>
                    <span className="text-[9px] text-muted-foreground">
                      ${rentCollected} / ${totalRent}
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {tenants.map((tenant) => (
                      <div key={tenant.id} className="flex items-center gap-1 text-[10px]">
                        <div
                          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                            tenant.paymentStatus === "paid"
                              ? "bg-green-500"
                              : tenant.paymentStatus === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span className="font-medium truncate max-w-[120px] text-[11px]">{tenant.name}</span>
                        <span className="ml-auto text-[9px] text-muted-foreground">
                          { tenant.paymentStatus }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="py-2 px-3 mt-auto">
                <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" asChild>
                  <Link href="/finances">
                    <PieChart className="mr-1 h-3 w-3" />
                    View Detailed Report
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Maintenance Requests - flex-1 to expand and match height */}
            <Card className="border-0 shadow-sm dashboard-card flex-1 flex flex-col">
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Maintenance Requests</CardTitle>
                  <CardDescription className="text-[11px]">
                    You have {totalMaintenanceRequests} open requests
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-1.5" asChild>
                  <Link href="/maintenance">
                    <span className="text-[10px]">View All</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="py-0 px-3 pb-2 flex-1 max-h-[180px] overflow-y-auto">
                <div className="space-y-2 flex-1">
                  {maintenanceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-2 group cursor-pointer hover:bg-muted/30 -mx-1 px-1 py-0.5 rounded-md transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors">
                        <Tool className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 space-y-0 min-w-0">
                        <p className="text-xs font-medium leading-none truncate">{request.issue}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{request.propertyAddress}</p>
                      </div>
                      <div
                        className={`rounded-full px-1 py-0 text-[8px] font-medium ${
                          request.status === "pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : request.status === "in progress"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="py-2 px-3 mt-auto">
                <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" asChild>
                  <Link href="/maintenance">
                    <Tool className="mr-1 h-3 w-3" />
                    View All Requests
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - flex column to distribute space evenly */}
          <div className="flex flex-col gap-3">
            {/* Calendar - flex-1 to expand and match height */}
            <Card className="border-0 shadow-sm dashboard-card flex-1 flex flex-col">
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Calendar</CardTitle>
                  <CardDescription className="text-[11px]">This week's events</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-1.5" asChild>
                  <Link href="/calendar">
                    <span className="text-[10px]">Full Calendar</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="py-0 px-3 pb-2 flex-1 flex flex-col">
                <WeekCalendar className="flex-1" />
              </CardContent>
              <CardFooter className="py-2 px-3 mt-auto">
                <Button variant="outline" size="sm" className="w-full h-6 text-[10px]" asChild>
                  <Link href="/calendar">
                    <Calendar className="mr-1 h-3 w-3" />
                    View Full Calendar
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Messages - flex-1 to expand and match height */}
            <Card className="border-0 shadow-sm dashboard-card flex-1 flex flex-col">
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Messages</CardTitle>
                  <CardDescription className="text-[11px]">You have {unreadMessages} unread messages</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-1.5">
                  <span className="text-[10px]">View All</span>
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="py-0 px-3 pb-2 flex-1 max-h-[180px] overflow-y-auto">
                <div className="space-y-2 flex-1">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-1.5 group cursor-pointer hover:bg-muted/30 -mx-1 px-1 py-0.5 rounded-md transition-colors"
                    >
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={message.avatar || "/placeholder-user.jpg"} alt="Avatar" />
                        <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium leading-none truncate">{message.sender}</p>
                          <p className="text-[8px] text-muted-foreground ml-1 flex-shrink-0">
                            {new Date(message.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {message.content.length > 40 ? `${message.content.substring(0, 40)}...` : message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="py-2 px-3 mt-auto">
                <Button variant="outline" size="sm" className="w-full h-6 text-[10px]">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  View All Messages
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
