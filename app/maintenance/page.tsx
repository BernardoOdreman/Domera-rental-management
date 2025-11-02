"use client"

import { useState } from "react"
import { Plus, Phone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { usePropertyContext } from "@/context/property-context"
import { useToast } from "@/hooks/use-toast"

export default function MaintenancePage() {
  const { maintenanceRequests, favoriteVendors, updateMaintenanceRequest } = usePropertyContext()
  const { toast } = useToast()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Find matching vendors for each request
  const getMatchingVendors = (issueType: string | undefined) => {
    if (!issueType) return []

    // Map issue types to specialties
    const specialtyMap: Record<string, string> = {
      Plumbing: "Plumbing",
      Electrical: "Electrical",
      HVAC: "HVAC",
      Appliance: "General",
      Structural: "General",
      "Pest Control": "Pest Control",
      Other: "General",
    }

    const specialty = specialtyMap[issueType] || "General"
    return favoriteVendors.filter(
      (vendor) =>
        vendor.specialty.toLowerCase() === specialty.toLowerCase() || vendor.specialty.toLowerCase() === "general",
    )
  }

  const handleConnectVendor = (requestId: string) => {
    const request = maintenanceRequests.find((r) => r.id === requestId)
    if (!request) return

    const matchingVendors = getMatchingVendors(request.issueType)
    if (matchingVendors.length > 0) {
      setSelectedRequest(requestId)
      setSelectedVendor(matchingVendors[0].id)
      setDialogOpen(true)
    } else {
      toast({
        title: "No matching vendors",
        description: "You don't have any favorite vendors for this type of issue.",
      })
    }
  }

  const confirmVendorConnection = () => {
    if (!selectedRequest || !selectedVendor) return

    updateMaintenanceRequest(selectedRequest, {
      assignedVendorId: selectedVendor,
      status: "in progress",
    })

    const vendor = favoriteVendors.find((v) => v.id === selectedVendor)

    toast({
      title: "Vendor connected",
      description: `${vendor?.name} has been assigned to this maintenance request.`,
    })

    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground">Manage maintenance and repair requests</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/maintenance/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Request
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/maintenance/vendors">
              <Plus className="mr-2 h-4 w-4" />
              Favorite Vendor
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {maintenanceRequests.map((request) => {
          const matchingVendors = getMatchingVendors(request.issueType)
          const hasMatchingVendors = matchingVendors.length > 0
          const isAssigned = !!request.assignedVendorId
          const assignedVendor = favoriteVendors.find((v) => v.id === request.assignedVendorId)

          return (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{request.issue}</CardTitle>
                  <Badge
                    className={
                      request.status === "pending"
                        ? "bg-amber-500"
                        : request.status === "in progress"
                          ? "bg-blue-500"
                          : "bg-green-500"
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>
                  {request.propertyAddress} • Submitted on {new Date(request.dateSubmitted).toLocaleDateString()}
                  {isAssigned && <span className="ml-2 font-medium">• Assigned to: {assignedVendor?.name}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Description:</span>
                    <span>{request.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority:</span>
                    <Badge
                      variant="outline"
                      className={
                        request.priority === "high"
                          ? "border-red-500 text-red-500"
                          : request.priority === "medium"
                            ? "border-amber-500 text-amber-500"
                            : "border-green-500 text-green-500"
                      }
                    >
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </Badge>
                  </div>
                  {request.issueType && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span>{request.issueType}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <div className="flex gap-2">
                  {request.status !== "completed" && !isAssigned && hasMatchingVendors && (
                    <Button size="sm" variant="outline" onClick={() => handleConnectVendor(request.id)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Connect to Favorite Vendor
                    </Button>
                  )}
                  {request.status !== "completed" && <Button size="sm">Update Status</Button>}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Favorite Vendor</DialogTitle>
            <DialogDescription>The following vendor matches this maintenance request type.</DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="py-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{favoriteVendors.find((v) => v.id === selectedVendor)?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {favoriteVendors.find((v) => v.id === selectedVendor)?.specialty} Specialist
                  </p>
                  <p className="text-sm mt-2">{favoriteVendors.find((v) => v.id === selectedVendor)?.phone}</p>
                  <p className="text-sm">{favoriteVendors.find((v) => v.id === selectedVendor)?.email}</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                  {favoriteVendors.find((v) => v.id === selectedVendor)?.rating} ★
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmVendorConnection}>Confirm Connection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
