"use client"

import { useEffect, useState } from "react"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePropertyContext } from "@/context/property-context"
import ContractModal from "@/components/lease-modal"

export default function LeasesPage() {
  const { properties, tenants } = usePropertyContext();
  const [activeLeases, setActiveLeases] = useState<any[]>([]);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchActiveLeases = () => {
      const leases = properties
      .filter(property => property.lease)
      .map(property => {
        // Buscar el inquilino asignado a esta propiedad
        const propertyTenant = tenants.find(t => t.propertyId === property.id);

        // Función para extraer el nombre de forma segura
        const getTenantName = (tenant: any) => {
          if (!tenant) return "No Tenant";

          // Caso 1: El nombre es un string
          if (typeof tenant.name === 'string') return tenant.name;

          // Caso 2: El nombre es un objeto con propiedades value/label
          if (typeof tenant.name === 'object' && tenant.name !== null) {
            return tenant.name.label || tenant.name.value || "No Tenant";
          }

          // Caso 3: El nombre está en una propiedad diferente
          return tenant.fullName || tenant.contactName || "No Tenant";
        };

        return {
          propertyId: property.id,
          propertyAddress: property.address,
          propertyType: property.propertyType,
          leaseHtml: property.lease,
          tenantName: getTenantName(propertyTenant),
           leaseEnd: property.lease_end,
           rentAmount: property.rent,
        };
      });

      setActiveLeases(leases);
    };

    fetchActiveLeases();
  }, [properties, tenants]);

  const handleViewLease = (lease: any) => {
    setSelectedLease(lease);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
    {/* Modal para mostrar el lease */}
    {modalOpen && selectedLease && (
      <ContractModal
      leaseHtml={selectedLease.leaseHtml}
      legalInfo=""
      onClose={() => setModalOpen(false)}
      propertyId={selectedLease.propertyId}
      />
    )}

    <div className="flex items-center justify-between">
    <div>
    <h1 className="text-3xl font-bold tracking-tight">Lease Generation</h1>
    <p className="text-muted-foreground">Create and manage lease agreements</p>
    </div>
    <Button asChild>
    <Link href="/leases/create">
    <Plus className="mr-2 h-4 w-4" />
    Create New Lease
    </Link>
    </Button>
    </div>

    <div className="grid gap-6">
    {activeLeases.length > 0 ? (
      activeLeases.map((lease) => (
        <Card key={lease.propertyId} className="shadow-md border border-border/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
        <CardHeader>
        <div className="flex items-center justify-between">
        <CardTitle>{lease.tenantName}</CardTitle>
        <Badge className="bg-green-500">Active</Badge>
        </div>
        <CardDescription>
        {lease.propertyAddress} • {lease.propertyType}
        </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
        <div className="flex justify-between">
        <span className="text-muted-foreground">Lease End:</span>
        <span className="font-medium">{new Date(lease.leaseEnd).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
        <span className="text-muted-foreground">Monthly Rent:</span>
        <span className="font-medium">${lease.rentAmount.toFixed(2)}/month</span>
        </div>
        </div>
        </CardContent>
        <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => handleViewLease(lease)}>
        <FileText className="mr-2 h-4 w-4" />
        View Lease
        </Button>
        <Button size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Download PDF
        </Button>
        </CardFooter>
        </Card>
      ))
    ) : (
      <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
      <h3 className="text-lg font-medium mb-2">No leases found</h3>
      <p className="text-center text-muted-foreground mb-4">You haven't created any lease agreements yet.</p>
      <Button asChild>
      <Link href="/leases/create">
      <Plus className="mr-2 h-4 w-4" />
      Create New Lease
      </Link>
      </Button>
      </CardContent>
      </Card>
    )}
    </div>
    </div>
  )
}
