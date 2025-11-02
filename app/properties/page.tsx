"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { usePropertyContext } from "@/context/property-context"

export default function PropertiesPage() {
  const { properties } = usePropertyContext()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your properties and units</p>
        </div>
        <Button asChild>
          <Link href="/properties/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden flex flex-col">
            {/* Property Image */}
            <div className="relative w-full h-48">
              {property.image ? (
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.image}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>

            <CardHeader>
              <CardTitle>{property.address}</CardTitle>
              <CardDescription>
                {property.type} • {property.bedrooms} bed • {property.bathrooms} bath
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`font-medium ${
                      property.status === "occupied"
                        ? "text-green-500"
                        : property.status === "vacant"
                          ? "text-amber-500"
                          : "text-blue-500"
                    }`}
                    aria-label={`Property status: ${property.status}`}
                  >
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent:</span>
                  <span className="font-medium">${property.rent}/month</span>
                </div>
                {property.tenantName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenant:</span>
                    <span className="font-medium">{property.tenantName}</span>
                  </div>
                )}
                {property.leaseEnd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lease ends:</span>
                    <span className="font-medium">
                      {new Date(property.leaseEnd).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-auto">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {property.status === "vacant" && (
                <Button size="sm" asChild>
                  <Link href={`/tenants/add?propertyId=${property.id}`}>Add Tenant</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
