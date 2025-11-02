"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PenToolIcon as Tool, Search, Phone, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePropertyContext } from "@/context/property-context"
import { useToast } from "@/hooks/use-toast"

// Mock handyman data
const handymen = [
  {
    id: "h1",
    name: "Mike Johnson",
    specialty: "Plumbing",
    rating: 4.8,
    reviews: 124,
    distance: "1.2 miles",
    availability: "Available today",
    phone: "555-123-4567",
    email: "mike.j@example.com",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "h2",
    name: "Sarah Williams",
    specialty: "Electrical",
    rating: 4.9,
    reviews: 87,
    distance: "2.5 miles",
    availability: "Available tomorrow",
    phone: "555-987-6543",
    email: "sarah.w@example.com",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "h3",
    name: "David Rodriguez",
    specialty: "General Repairs",
    rating: 4.7,
    reviews: 156,
    distance: "0.8 miles",
    availability: "Available today",
    phone: "555-456-7890",
    email: "david.r@example.com",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "h4",
    name: "Lisa Chen",
    specialty: "HVAC",
    rating: 4.9,
    reviews: 92,
    distance: "3.1 miles",
    availability: "Available in 2 days",
    phone: "555-234-5678",
    email: "lisa.c@example.com",
    avatar: "/placeholder-user.jpg",
  },
]

// Map issue types to specialties
const issueToSpecialty: Record<string, string[]> = {
  Plumbing: ["Plumbing"],
  Electrical: ["Electrical"],
  HVAC: ["HVAC"],
  Appliance: ["General Repairs", "Electrical"],
  Structural: ["General Repairs"],
  "Pest Control": ["Pest Control"],
  Other: ["General Repairs"],
}

export default function AddMaintenanceRequestPage() {
  const router = useRouter()
  const { properties, addMaintenanceRequest } = usePropertyContext()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    propertyId: "",
    issueType: "Plumbing",
    issue: "",
    priority: "medium",
    description: "",
    findHandyman: true,
  })

  const [step, setStep] = useState(1)
  const [filteredHandymen, setFilteredHandymen] = useState<typeof handymen>([])
  const [selectedHandyman, setSelectedHandyman] = useState<string | null>(null)
  const [searchingHandymen, setSearchingHandymen] = useState(false)

  // Filter handymen based on issue type
  useEffect(() => {
    if (formData.issueType && formData.findHandyman) {
      const specialties = issueToSpecialty[formData.issueType] || ["General Repairs"]
      const filtered = handymen.filter((h) => specialties.includes(h.specialty))
      setFilteredHandymen(filtered)
    }
  }, [formData.issueType, formData.findHandyman])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, findHandyman: checked }))
  }

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.findHandyman) {
      setSearchingHandymen(true)
      // Simulate API call to search for handymen
      setTimeout(() => {
        setSearchingHandymen(false)
        setStep(2)
      }, 1500)
    } else {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = () => {
    const selectedProperty = properties.find((p) => p.id === formData.propertyId)

    if (!selectedProperty) return

    addMaintenanceRequest({
      propertyId: formData.propertyId,
      propertyAddress: selectedProperty.address,
      issue: formData.issue,
      status: "pending",
      priority: formData.priority as "low" | "medium" | "high",
      dateSubmitted: new Date().toISOString().split("T")[0],
      description: formData.description,
    })

    if (selectedHandyman) {
      toast({
        title: "Handyman contacted",
        description: `${handymen.find((h) => h.id === selectedHandyman)?.name} has been notified about this maintenance request.`,
      })
    }

    router.push("/maintenance")
  }

  const handleContactHandyman = (handymanId: string) => {
    setSelectedHandyman(handymanId)

    toast({
      title: "Handyman selected",
      description: `${handymen.find((h) => h.id === handymanId)?.name} will be contacted when you submit the request.`,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Maintenance Request</h1>
        <p className="text-muted-foreground">Submit a new maintenance or repair request</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmitDetails}>
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Provide information about the maintenance issue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => handleSelectChange("propertyId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => handleSelectChange("issueType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Appliance">Appliance</SelectItem>
                    <SelectItem value="Structural">Structural</SelectItem>
                    <SelectItem value="Pest Control">Pest Control</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue">Issue Title</Label>
                <Input
                  id="issue"
                  name="issue"
                  placeholder="Leaking faucet, broken window, etc."
                  value={formData.issue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide details about the issue..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="findHandyman" checked={formData.findHandyman} onCheckedChange={handleCheckboxChange} />
                <Label
                  htmlFor="findHandyman"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Automatically find and contact handymen in your area
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={searchingHandymen}>
                {searchingHandymen ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Tool className="mr-2 h-4 w-4" />
                    {formData.findHandyman ? "Find Handymen" : "Submit Request"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Handymen</CardTitle>
              <CardDescription>
                We found {filteredHandymen.length} handymen specializing in {formData.issueType.toLowerCase()} near you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                  {filteredHandymen.map((handyman) => (
                    <div key={handyman.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={handyman.avatar} alt={handyman.name} />
                        <AvatarFallback>{handyman.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{handyman.name}</h4>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm">
                              {handyman.rating} ({handyman.reviews})
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{handyman.specialty}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{handyman.distance}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {handyman.availability}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant={selectedHandyman === handyman.id ? "default" : "outline"}
                          onClick={() => handleContactHandyman(handyman.id)}
                        >
                          {selectedHandyman === handyman.id ? "Selected" : "Select"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" /> Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="map">
                  <div className="flex items-center justify-center h-[300px] bg-muted rounded-md">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Map view would display handymen locations here</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Details
              </Button>
              <Button onClick={handleFinalSubmit}>
                <Tool className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
