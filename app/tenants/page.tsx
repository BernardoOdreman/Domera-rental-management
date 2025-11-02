"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePropertyContext } from "@/context/property-context"

export default function TenantsPage() {
  const { tenants } = usePropertyContext()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Manage your tenants and leases</p>
        </div>
        <Button asChild>
          <Link href="/tenants/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle>{tenant.name}</CardTitle>
              <CardDescription>{tenant.propertyAddress}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{tenant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{tenant.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent:</span>
                  <span className="font-medium">${tenant.rentAmount}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <Badge
                    className={
                      tenant.paymentStatus === "paid"
                        ? "bg-green-500"
                        : tenant.paymentStatus === "pending"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }
                  >
                    {tenant.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lease ends:</span>
                  <span className="font-medium">
                    {new Date(tenant.leaseEnd).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button size="sm">Contact</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
