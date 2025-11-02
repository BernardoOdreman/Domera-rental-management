"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, Plus, Trash2, Phone, Mail, Check, X, StarHalf, Filter, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePropertyContext } from "@/context/property-context"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressAutocomplete } from "@/components/address-autocomplete"

// Sample user location (would be determined by geolocation in a real app)
const defaultUserLocation = {
  latitude: 37.7749,
  longitude: -122.4194, // San Francisco coordinates
  address: "San Francisco, CA",
}

// Enhanced search results for vendors with more details and location data
const searchResults = [
  {
    id: "sr1",
    name: "Johnson Plumbing & Heating",
    specialty: "Plumbing",
    rating: 4.8,
    reviews: 156,
    phone: "555-123-4567",
    email: "info@johnsonplumbing.com",
    address: "123 Pipe St, Anytown, USA",
    distance: "1.2 miles",
    latitude: 37.7833,
    longitude: -122.4167,
    avatar: "/placeholder-user.jpg",
    description: "Fast response time, specializes in emergency repairs",
  },
  {
    id: "sr2",
    name: "Ace Electric",
    specialty: "Electrical",
    rating: 4.9,
    reviews: 203,
    phone: "555-987-6543",
    email: "service@aceelectric.com",
    address: "456 Volt Ave, Anytown, USA",
    distance: "2.3 miles",
    latitude: 37.768,
    longitude: -122.43,
    avatar: "/placeholder-user.jpg",
    description: "Licensed for commercial and residential work",
  },
  {
    id: "sr3",
    name: "Cool Breeze HVAC",
    specialty: "HVAC",
    rating: 4.7,
    reviews: 178,
    phone: "555-456-7890",
    email: "info@coolbreeze.com",
    address: "789 Air Blvd, Anytown, USA",
    distance: "3.1 miles",
    latitude: 37.79,
    longitude: -122.4,
    avatar: "/placeholder-user.jpg",
    description: "Great with older systems and energy efficiency upgrades",
  },
  {
    id: "sr4",
    name: "Handy Home Repairs",
    specialty: "General",
    rating: 4.6,
    reviews: 142,
    phone: "555-234-5678",
    email: "repairs@handyhome.com",
    address: "321 Fix St, Anytown, USA",
    distance: "1.8 miles",
    latitude: 37.76,
    longitude: -122.41,
    avatar: "/placeholder-user.jpg",
    description: "Handles multiple types of repairs, great for small jobs",
  },
  {
    id: "sr5",
    name: "Pest Be Gone",
    specialty: "Pest Control",
    rating: 4.5,
    reviews: 98,
    phone: "555-876-5432",
    email: "info@pestbegone.com",
    address: "654 Bug Lane, Anytown, USA",
    distance: "4.2 miles",
    latitude: 37.75,
    longitude: -122.44,
    avatar: "/placeholder-user.jpg",
    description: "Eco-friendly pest control solutions",
  },
  {
    id: "sr6",
    name: "Quick Fix Plumbing",
    specialty: "Plumbing",
    rating: 4.3,
    reviews: 87,
    phone: "555-222-3333",
    email: "service@quickfixplumbing.com",
    address: "789 Water Way, Anytown, USA",
    distance: "2.7 miles",
    latitude: 37.795,
    longitude: -122.395,
    avatar: "/placeholder-user.jpg",
    description: "24/7 emergency service available",
  },
  {
    id: "sr7",
    name: "Bright Spark Electrical",
    specialty: "Electrical",
    rating: 4.7,
    reviews: 112,
    phone: "555-444-5555",
    email: "info@brightspark.com",
    address: "567 Circuit Rd, Anytown, USA",
    distance: "1.9 miles",
    latitude: 37.785,
    longitude: -122.425,
    avatar: "/placeholder-user.jpg",
    description: "Specializes in smart home installations",
  },
  {
    id: "sr8",
    name: "Bay Area Plumbing",
    specialty: "Plumbing",
    rating: 4.6,
    reviews: 132,
    phone: "555-111-2222",
    email: "contact@bayareaplumbing.com",
    address: "123 Main St, Oakland, CA",
    distance: "8.5 miles",
    latitude: 37.8044,
    longitude: -122.2711,
    avatar: "/placeholder-user.jpg",
    description: "Serving the Bay Area for over 20 years",
  },
  {
    id: "sr9",
    name: "Silicon Valley HVAC",
    specialty: "HVAC",
    rating: 4.8,
    reviews: 201,
    phone: "555-333-4444",
    email: "info@svhvac.com",
    address: "456 Tech Blvd, San Jose, CA",
    distance: "42.3 miles",
    latitude: 37.3382,
    longitude: -121.8863,
    avatar: "/placeholder-user.jpg",
    description: "Smart home HVAC integration specialists",
  },
  {
    id: "sr10",
    name: "Marin County Electricians",
    specialty: "Electrical",
    rating: 4.9,
    reviews: 176,
    phone: "555-555-6666",
    email: "service@marincountyelectric.com",
    address: "789 Bridge Ave, Sausalito, CA",
    distance: "10.7 miles",
    latitude: 37.859,
    longitude: -122.4853,
    avatar: "/placeholder-user.jpg",
    description: "Premium electrical services for high-end properties",
  },
]

// List of predefined specialties
const predefinedSpecialties = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "General Repairs",
  "Pest Control",
  "Landscaping",
  "Cleaning",
  "Painting",
  "Carpentry",
  "Roofing",
  "Flooring",
  "Appliance Repair",
  "Locksmith",
  "Glass Repair",
  "Custom...",
]

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Number.parseFloat(distance.toFixed(1))
}

// Format distance for display
function formatDistance(distance: number): string {
  return `${distance} ${distance === 1 ? "mile" : "miles"}`
}

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-muted-foreground" />
      ))}
    </div>
  )
}

export default function FavoriteVendorsPage() {
  const router = useRouter()
  const { favoriteVendors, addFavoriteVendor, removeFavoriteVendor } = usePropertyContext()
  const { toast } = useToast()

  // Location state
  const [userLocation, setUserLocation] = useState(defaultUserLocation)
  const [locationInput, setLocationInput] = useState(defaultUserLocation.address)
  const [isLocating, setIsLocating] = useState(false)
  const [searchRadius, setSearchRadius] = useState(25) // Default 25 miles radius

  const [searchQuery, setSearchQuery] = useState("")
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [filteredResults, setFilteredResults] = useState(searchResults)
  const [addVendorDialogOpen, setAddVendorDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<(typeof searchResults)[0] | null>(null)
  const [isExistingVendor, setIsExistingVendor] = useState(true)
  const [vendorSearchQuery, setVendorSearchQuery] = useState("")
  const [filteredVendors, setFilteredVendors] = useState<typeof searchResults>([])
  const [customSpecialty, setCustomSpecialty] = useState("")
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  // New state for filtering favorite vendors by service
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("All Services")
  const [filteredFavoriteVendors, setFilteredFavoriteVendors] = useState(favoriteVendors)

  const [newVendorForm, setNewVendorForm] = useState({
    name: "",
    specialty: "General Repairs",
    phone: "",
    email: "",
    address: "",
    notes: "",
    isFavorite: false,
  })

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // Phone validation regex (simple version)
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/

  const isEmailValid = newVendorForm.email === "" || emailRegex.test(newVendorForm.email)
  const isPhoneValid = newVendorForm.phone === "" || phoneRegex.test(newVendorForm.phone)

  // First, let's add a state for service filtering
  const [selectedService, setSelectedService] = useState<string>("All Services")

  // Get unique specialties from favorite vendors for the filter dropdown
  const uniqueSpecialties = React.useMemo(() => {
    const specialties = favoriteVendors.map((vendor) => vendor.specialty)
    return ["All Services", ...Array.from(new Set(specialties))].filter(Boolean)
  }, [favoriteVendors])

  // Filter favorite vendors by selected service
  useEffect(() => {
    if (selectedServiceFilter === "All Services") {
      setFilteredFavoriteVendors(favoriteVendors)
    } else {
      setFilteredFavoriteVendors(favoriteVendors.filter((vendor) => vendor.specialty === selectedServiceFilter))
    }
  }, [selectedServiceFilter, favoriteVendors])

  // Update vendor distances based on user location
  useEffect(() => {
    const vendorsWithDistance = searchResults.map((vendor) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vendor.latitude,
        vendor.longitude,
      )
      return {
        ...vendor,
        distance: formatDistance(distance),
        distanceValue: distance, // Store the numeric value for sorting
      }
    })

    // Sort by distance
    vendorsWithDistance.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0))

    // Filter by search radius
    const withinRadius = vendorsWithDistance.filter((v) => (v.distanceValue || 0) <= searchRadius)

    setFilteredVendors(withinRadius)
  }, [userLocation, searchRadius])

  // Update the useEffect for filtering vendors to include service filtering
  useEffect(() => {
    if (vendorSearchQuery.trim() === "") {
      // When no search query, filter by radius and service
      const vendorsWithDistance = searchResults.map((vendor) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          vendor.latitude,
          vendor.longitude,
        )
        return {
          ...vendor,
          distance: formatDistance(distance),
          distanceValue: distance,
        }
      })

      let filteredByDistance = vendorsWithDistance.filter((v) => (v.distanceValue || 0) <= searchRadius)

      // Apply service filter if not "All Services"
      if (selectedService !== "All Services") {
        filteredByDistance = filteredByDistance.filter((v) => v.specialty === selectedService)
      }

      filteredByDistance.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0))
      setFilteredVendors(filteredByDistance)
    } else {
      // When there's a search query, filter by query, radius, and service
      const query = vendorSearchQuery.toLowerCase()
      const vendorsWithDistance = searchResults
        .map((vendor) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            vendor.latitude,
            vendor.longitude,
          )
          return {
            ...vendor,
            distance: formatDistance(distance),
            distanceValue: distance,
          }
        })
        .filter(
          (vendor) =>
            (vendor.name.toLowerCase().includes(query) ||
              vendor.specialty.toLowerCase().includes(query) ||
              vendor.address.toLowerCase().includes(query)) &&
            (vendor.distanceValue || 0) <= searchRadius &&
            (selectedService === "All Services" || vendor.specialty === selectedService),
        )

      vendorsWithDistance.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0))
      setFilteredVendors(vendorsWithDistance)
    }
  }, [vendorSearchQuery, userLocation, searchRadius, selectedService])

  // Group vendors by specialty
  const groupedVendors = filteredVendors.reduce(
    (acc, vendor) => {
      if (!acc[vendor.specialty]) {
        acc[vendor.specialty] = []
      }
      acc[vendor.specialty].push(vendor)
      return acc
    },
    {} as Record<string, typeof searchResults>,
  )

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredResults(searchResults)
    } else {
      const query = searchQuery.toLowerCase()
      const results = searchResults.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(query) ||
          vendor.specialty.toLowerCase().includes(query) ||
          vendor.address.toLowerCase().includes(query),
      )
      setFilteredResults(results)
    }
    setSearchPerformed(true)
  }

  const handleAddToFavorites = (vendor: (typeof searchResults)[0]) => {
    // Check if vendor is already in favorites
    const isAlreadyFavorite = favoriteVendors.some((v) => v.name === vendor.name && v.phone === vendor.phone)

    if (isAlreadyFavorite) {
      toast({
        title: "Already in favorites",
        description: `${vendor.name} is already in your favorite vendors.`,
      })
      return
    }

    addFavoriteVendor({
      name: vendor.name,
      specialty: vendor.specialty,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      rating: vendor.rating,
      avatar: vendor.avatar,
    })

    toast({
      title: "Added to favorites",
      description: `${vendor.name} has been added to your favorite vendors.`,
    })
  }

  const handleRemoveFromFavorites = (id: string) => {
    const vendor = favoriteVendors.find((v) => v.id === id)
    if (!vendor) return

    removeFavoriteVendor(id)

    toast({
      title: "Removed from favorites",
      description: `${vendor.name} has been removed from your favorite vendors.`,
    })
  }

  const handleManualAdd = () => {
    setSelectedVendor(null)
    setIsExistingVendor(false)
    setNewVendorForm({
      name: "",
      specialty: "General Repairs",
      phone: "",
      email: "",
      address: "",
      notes: "",
      isFavorite: false,
    })
    // Reset location input to empty when opening the dialog
    setLocationInput("")
    setAddVendorDialogOpen(true)
  }

  const handleVendorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewVendorForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "specialty" && value === "Custom...") {
      setIsCustomSpecialty(true)
      return
    }

    setNewVendorForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddVendorSubmit = () => {
    // Validate form
    if (!newVendorForm.name && !isExistingVendor) {
      toast({
        title: "Missing information",
        description: "Please enter a vendor name",
        variant: "destructive",
      })
      return
    }

    if (!isEmailValid) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (!isPhoneValid) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a phone number in format: 555-123-4567",
        variant: "destructive",
      })
      return
    }

    if (selectedVendor && isExistingVendor) {
      // Add selected existing vendor
      addFavoriteVendor({
        name: selectedVendor.name,
        specialty: selectedVendor.specialty,
        phone: selectedVendor.phone,
        email: selectedVendor.email,
        address: selectedVendor.address,
        notes: newVendorForm.notes,
        rating: selectedVendor.rating,
      })

      toast({
        title: "Vendor saved",
        description: `${selectedVendor.name} has been saved to your vendors.`,
      })
    } else if (!isExistingVendor) {
      // Add manually entered vendor
      const specialty = isCustomSpecialty ? customSpecialty : newVendorForm.specialty

      addFavoriteVendor({
        name: newVendorForm.name,
        specialty: specialty,
        phone: newVendorForm.phone,
        email: newVendorForm.email,
        address: newVendorForm.address,
        notes: newVendorForm.notes,
        rating: 5.0, // Default rating for manually added vendors
      })

      toast({
        title: "Vendor saved",
        description: `${newVendorForm.name} has been saved to your vendors.`,
      })
    } else {
      toast({
        title: "Missing vendor",
        description: "Please select an existing vendor or add a new one",
        variant: "destructive",
      })
      return
    }

    setAddVendorDialogOpen(false)
  }

  const selectVendor = (vendor: (typeof searchResults)[0]) => {
    setSelectedVendor(vendor)
    setNewVendorForm({
      name: vendor.name,
      specialty: vendor.specialty,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      notes: "",
      isFavorite: true,
    })
    setCommandOpen(false)
  }

  // Geolocation functions
  const detectLocation = () => {
    setIsLocating(true)

    // Simulate geolocation API (in a real app, we would use the browser's geolocation API)
    setTimeout(() => {
      // Simulating successful geolocation
      setUserLocation({
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA",
      })
      setLocationInput("San Francisco, CA")
      setIsLocating(false)

      toast({
        title: "Location detected",
        description: "Your location has been updated to San Francisco, CA",
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Favorite Vendors</h1>
          <p className="text-muted-foreground">Manage your preferred maintenance vendors</p>
        </div>
        <Button onClick={handleManualAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* My Vendors section with filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Vendors</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter by Service
                {selectedServiceFilter !== "All Services" && (
                  <Badge className="ml-2 bg-primary/20 text-primary border-0">{selectedServiceFilter}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search services..." />
                <CommandList>
                  <CommandEmpty>No services found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => setSelectedServiceFilter("All Services")}
                      className="flex items-center justify-between"
                    >
                      <span>All Services</span>
                      {selectedServiceFilter === "All Services" && <Check className="h-4 w-4" />}
                    </CommandItem>
                    {uniqueSpecialties
                      .filter((specialty) => specialty !== "All Services")
                      .map((specialty) => (
                        <CommandItem
                          key={specialty}
                          onSelect={() => setSelectedServiceFilter(specialty)}
                          className="flex items-center justify-between"
                        >
                          <span>{specialty}</span>
                          {selectedServiceFilter === specialty && <Check className="h-4 w-4" />}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {filteredFavoriteVendors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No vendors found</h3>
              <p className="text-center text-muted-foreground mb-4">
                {selectedServiceFilter !== "All Services"
                  ? `You don't have any ${selectedServiceFilter} vendors saved.`
                  : "You haven't added any vendors yet. Add vendors manually or search for them."}
              </p>
              <Button variant="outline" onClick={() => setSelectedServiceFilter("All Services")}>
                {selectedServiceFilter !== "All Services" ? "Show All Vendors" : "Add Vendor"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFavoriteVendors.map((vendor) => (
              <Card key={vendor.id} className="vendor-card border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={vendor.avatar || "/placeholder-user.jpg"} alt={vendor.name} />
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{vendor.name}</CardTitle>
                        <CardDescription>{vendor.specialty} Specialist</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {vendor.rating}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{vendor.email}</span>
                    </div>
                    {vendor.notes && <div className="mt-2 text-muted-foreground italic">"{vendor.notes}"</div>}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button size="sm" variant="outline">
                    <Phone className="mr-2 h-3.5 w-3.5" />
                    Contact
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveFromFavorites(vendor.id)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={addVendorDialogOpen} onOpenChange={setAddVendorDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-4 gap-4 dialog-content border-0 shadow-lg">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm">Add Vendor</DialogTitle>
            <DialogDescription className="text-[10px]">
              Find or input the information of an existing vendor from your area
            </DialogDescription>
          </DialogHeader>

          {/* Vendor type segmented control with improved styling */}
          <Tabs defaultValue="find" className="w-full" onValueChange={(value) => setIsExistingVendor(value === "find")}>
            <TabsList className="tabs-list">
              <TabsTrigger value="find" className="tabs-trigger">
                Find Existing
              </TabsTrigger>
              <TabsTrigger value="add" className="tabs-trigger">
                Add Manually
              </TabsTrigger>
            </TabsList>

            <TabsContent value="find" className="space-y-4 mt-4 p-0">
              {/* Location selection with improved styling */}
              <div className="location-section">
                <div className="flex-1">
                  <AddressAutocomplete
                    value={locationInput}
                    onChange={setLocationInput}
                    onLocationSelect={(location) => {
                      setUserLocation({
                        latitude: location.latitude,
                        longitude: location.longitude,
                        address: location.address,
                      })
                      toast({
                        title: "Location updated",
                        description: `Your location has been updated to ${location.address}`,
                      })
                    }}
                    placeholder="Enter your location..."
                    className="h-8 text-xs px-2 py-1"
                  />

                  {/* Update the radius slider section to match the image */}
                  <div className="radius-container">
                    <span className="radius-label text-[10px] text-muted-foreground">{searchRadius}mi</span>
                    <Slider
                      value={[searchRadius]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(value) => setSearchRadius(value[0])}
                      className="flex-1 location-slider"
                    />
                  </div>
                </div>
              </div>

              {/* Service filter dropdown - new addition with improved styling */}
              <div className="service-filter">
                <Label htmlFor="service-filter" className="text-[10px] mb-1 block">
                  Filter by Service
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Services" className="text-xs">
                      All Services
                    </SelectItem>
                    {predefinedSpecialties
                      .filter((s) => s !== "Custom...")
                      .map((specialty) => (
                        <SelectItem key={specialty} value={specialty} className="text-xs">
                          {specialty}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search vendors with improved styling */}
              {/* Replace search vendors popover with a button */}
              <Button variant="default" className="w-full h-9 mt-2" onClick={() => setCommandOpen(true)}>
                Search For Nearby Vendors
              </Button>

              {/* Keep the popover content separate */}
              <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                <PopoverContent className="w-[450px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search vendors..."
                      value={vendorSearchQuery}
                      onValueChange={setVendorSearchQuery}
                      className="h-8"
                      autoFocus
                    />
                    <CommandList className="max-h-[250px]">
                      <CommandEmpty>
                        No vendors found within {searchRadius} miles
                        {selectedService !== "All Services" ? ` for ${selectedService}` : ""}.
                      </CommandEmpty>
                      {Object.entries(groupedVendors).map(([specialty, vendors]) => (
                        <CommandGroup key={specialty} heading={specialty}>
                          {vendors.map((vendor) => (
                            <TooltipProvider key={vendor.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CommandItem
                                    value={vendor.id}
                                    onSelect={() => selectVendor(vendor)}
                                    className="flex items-center justify-between py-1"
                                  >
                                    <div className="flex items-center">
                                      <Avatar className="h-5 w-5 mr-2">
                                        <AvatarImage src={vendor.avatar || "/placeholder.svg"} alt={vendor.name} />
                                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">{vendor.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-muted-foreground">{vendor.distance}</span>
                                      <StarRating rating={vendor.rating} />
                                    </div>
                                  </CommandItem>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs">
                                  <p>{vendor.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedVendor && (
                <div className="rounded-lg bg-muted/30 p-4 mt-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedVendor.avatar || "/placeholder.svg"} alt={selectedVendor.name} />
                        <AvatarFallback>{selectedVendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{selectedVendor.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedVendor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarRating rating={selectedVendor.rating} />
                      <span className="ml-1 text-xs">({selectedVendor.reviews})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">{selectedVendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">{selectedVendor.email}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">{selectedVendor.address}</span>
                    </div>
                    <div className="col-span-2 mt-1 text-xs text-muted-foreground">
                      <p>{selectedVendor.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="add" className="grid grid-cols-2 gap-x-2 gap-y-2 py-1 mt-4 p-0">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-[10px]">
                  Vendor Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newVendorForm.name}
                  onChange={handleVendorFormChange}
                  required
                  className="h-8 text-xs mt-0.5"
                />
              </div>

              <div>
                <Label htmlFor="specialty" className="text-[10px]">
                  Specialty
                </Label>
                {isCustomSpecialty ? (
                  <div className="flex gap-1 mt-0.5">
                    <Input
                      id="custom-specialty"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      placeholder="Custom specialty..."
                      className="flex-1 h-8 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCustomSpecialty(false)}
                      type="button"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={newVendorForm.specialty}
                    onValueChange={(value) => handleSelectChange("specialty", value)}
                  >
                    <SelectTrigger className="h-8 text-xs mt-0.5">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedSpecialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty} className="text-xs">
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-[10px]">
                  Phone <span className="text-[9px] text-muted-foreground">(555-123-4567)</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newVendorForm.phone}
                  onChange={handleVendorFormChange}
                  className={cn("h-8 text-xs mt-0.5", !isPhoneValid ? "border-destructive" : "")}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[10px]">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newVendorForm.email}
                  onChange={handleVendorFormChange}
                  className={cn("h-8 text-xs mt-0.5", !isEmailValid ? "border-destructive" : "")}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address" className="text-[10px]">
                  Address
                </Label>
                <AddressAutocomplete
                  id="address"
                  name="address"
                  value={newVendorForm.address}
                  onChange={(value) => setNewVendorForm((prev) => ({ ...prev, address: value }))}
                  placeholder="Enter vendor address..."
                  className="h-8 text-xs mt-0.5"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <Switch
                id="favorite"
                checked={newVendorForm.isFavorite}
                onCheckedChange={(checked) => setNewVendorForm((prev) => ({ ...prev, isFavorite: checked }))}
                className="h-5 w-9 data-[state=checked]:bg-primary"
                aria-label="Mark as favorite vendor"
              />
              <Label htmlFor="favorite" className="flex items-center gap-1.5 text-xs font-medium ml-2">
                <Star
                  className={`h-3.5 w-3.5 ${newVendorForm.isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
                Mark as Favorite
              </Label>
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleAddVendorSubmit} size="sm" className="h-8 text-xs">
                <Check className="mr-1 h-3 w-3" />
                Save Vendor
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
