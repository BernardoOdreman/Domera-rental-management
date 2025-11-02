"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Building, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { searchPropertyImage, isAddressSearchable } from "@/utils/property-image-search"
import { debounce } from "@/lib/utils"
import { ComprehensiveAddressForm, type AddressFormData } from "@/components/comprehensive-address-form"
import type { Session } from "@supabase/supabase-js"
import { supabase } from '@/lib/supabase/client';


type PropertyFormData = {
  addressData: AddressFormData
  propertyType: "House" | "Apartment"
  bedrooms: string
  bathrooms: string
  rent: string
  image?: string
}

export default function AddPropertyPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [isSearchingImage, setIsSearchingImage] = useState(false)
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  const [propertyData, setPropertyData] = useState<PropertyFormData>({
    addressData: {
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      fullAddress: "",
    },
    propertyType: "House",
    bedrooms: "",
    bathrooms: "",
    rent: "",
  })

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()
  }, [])

  const debouncedImageSearch = useCallback(
    debounce(async (address: string, type: string) => {
      if (isAddressSearchable(address)) {
        setIsSearchingImage(true)
        try {
          const imageUrl = await searchPropertyImage(address, type as any)
          if (imageUrl) {
            setPropertyData((prev) => ({ ...prev, image: imageUrl }))
            toast({
              title: "Image found",
              description: "We found a matching image for your property.",
            })
          } else if (hasSearchedOnce) {
            toast({
              title: "Image not found",
              description: "We couldn't find an image for this property. Please upload one manually.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error searching property image:", error)
          toast({
            title: "Image search error",
            description: "An error occurred while searching for a property image.",
            variant: "destructive",
          })
        } finally {
          setIsSearchingImage(false)
          setHasSearchedOnce(true)
        }
      }
    }, 1000),
    [hasSearchedOnce, toast]
  )

  useEffect(() => {
    if (propertyData.addressData.fullAddress && propertyData.propertyType) {
      debouncedImageSearch(propertyData.addressData.fullAddress, propertyData.propertyType)
    }
  }, [propertyData.addressData.fullAddress, propertyData.propertyType, debouncedImageSearch])

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPropertyData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPropertyData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (addressData: AddressFormData) => {
    setPropertyData((prev) => ({ ...prev, addressData }))
  }

  const handleImageChange = (file: File | null) => {
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPropertyData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else {
      setPropertyData(prev => ({ ...prev, image: undefined }))
    }
  }

  const handleManualImageSearch = async () => {
    if (isAddressSearchable(propertyData.addressData.fullAddress)) {
      setIsSearchingImage(true)
      try {
        const imageUrl = await searchPropertyImage(
          propertyData.addressData.fullAddress,
          propertyData.propertyType as any
        )
        if (imageUrl) {
          setPropertyData((prev) => ({ ...prev, image: imageUrl }))
          toast({
            title: "Image found",
            description: "We found a matching image for your property.",
          })
        } else {
          toast({
            title: "Image not found",
            description: "We couldn't find an image for this property. Please upload one manually.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error searching property image:", error)
        toast({
          title: "Image search error",
          description: "An error occurred while searching for a property image.",
          variant: "destructive",
        })
      } finally {
        setIsSearchingImage(false)
        setHasSearchedOnce(true)
      }
    } else {
      toast({
        title: "Incomplete address",
        description: "Please enter a complete address to search for images.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {

    const propertyErrors = [
      !propertyData.addressData.fullAddress && "Full address",
      !propertyData.bedrooms && "Bedrooms",
      !propertyData.bathrooms && "Bathrooms",
      !propertyData.rent && "Monthly rent"
    ].filter(Boolean)

    if (propertyErrors.length > 0) {
      toast({
        title: "Incomplete property information",
        description: `Required fields: ${propertyErrors.join(", ")}`,
            variant: "destructive"
      })
      return
    }

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue",
        variant: "destructive"
      })
      router.push("/login")
      return
    }

    // Validar formato de números
    if (isNaN(parseInt(propertyData.bedrooms))) {
      toast({
        title: "Invalid bedrooms",
        description: "Please enter a valid number for bedrooms",
        variant: "destructive"
      })
      return
    }

    if (isNaN(parseFloat(propertyData.bathrooms))) {
      toast({
        title: "Invalid bathrooms",
        description: "Please enter a valid number for bathrooms",
        variant: "destructive"
      })
      return
    }

    if (isNaN(parseFloat(propertyData.rent))) {
      toast({
        title: "Invalid rent amount",
        description: "Please enter a valid rent amount",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar datos para la función Edge
      const payload = {
        landlord_id: session.user.id,
        address: propertyData.addressData.fullAddress,
        propertyType: propertyData.propertyType,
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseFloat(propertyData.bathrooms),
        rent: parseFloat(propertyData.rent),
        status: "vacant",
        // Solo pasar URL si es una imagen externa (no base64)
        image: propertyData.image?.startsWith('http') ? propertyData.image : undefined
      }

      // Llamar a la función Edge para crear la propiedad
      const { data: propertyResponse, error: propError } = await supabase.functions.invoke(
        'create-property',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: payload
        }
      )

      if (propError) throw propError;

      if (!propertyResponse?.id) {
        throw new Error("No property ID received");
      }

      const propertyId = propertyResponse.id;

      // Subir imagen si el usuario cargó un archivo
      if (imageFile) {
        try {
          const filePath = `${session.user.id}/${propertyId}/${imageFile.name}`;
          const { error: uploadError } = await supabase
          .storage
          .from("property-images")
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

          if (uploadError) throw uploadError;

          // Obtener URL pública
          const { data: urlData } = supabase
          .storage
          .from("property-images")
          .getPublicUrl(filePath);

          // Actualizar propiedad con la nueva URL
          const { error: updateError } = await supabase
          .from("properties")
          .update({ image: urlData?.publicUrl })
          .eq("id", propertyId);

          if (updateError) throw updateError;

        } catch (uploadError) {
          console.error("Error uploading image:", uploadError)
          toast({
            title: "Image upload error",
            description: "Property created but image failed to upload",
            variant: "destructive"
          })
        }
      }

      // 1. Almacenar mensaje de éxito para mostrar después de redirección
      sessionStorage.setItem('propertyCreationSuccess', propertyData.addressData.fullAddress);

      // 2. Redirigir SOLO después de completar todas las operaciones
      if (confirm("Property was created successfully. Click OK to continue.")) {
        router.push("/properties");
      }
      // 3. NO mostrar toast aquí porque cambiará de página

    } catch (error: any) {
      console.error("Submission error:", error)

      let errorMessage = "An error occurred";

      if (error.message.includes("properties_status_check")) {
        errorMessage = "Invalid property status value";
      } else if (error.message.includes("foreign key constraint")) {
        errorMessage = "Invalid landlord ID";
      } else if (error.message.includes("401")) {
        errorMessage = "Session expired. Please sign in again";
        router.push("/login")
      } else if (error.message.includes("CORS") || error.message.includes("Failed to send")) {
        errorMessage = "Network error. Please try again later";
      }

      toast({
        title: "Creation failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }









  return (
    <div className="mx-auto  space-y-6">
    <div>
    <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
    <p className="text-muted-foreground">Enter details for your new property</p>
    </div>

    <Card  className="transition-all duration-200 hover:border-primary/50">
    <CardHeader>
    <CardTitle>Property Information</CardTitle>
    <CardDescription>Complete basic information about your property</CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
    <ComprehensiveAddressForm
    value={propertyData.addressData}
    onChange={handleAddressChange}
    required
    />

    <div className="space-y-2">
    <div className="flex justify-between items-center">
    <Label>Property Image</Label>
    <Button
    variant="outline"
    size="sm"
    onClick={handleManualImageSearch}
    disabled={isSearchingImage || !isAddressSearchable(propertyData.addressData.fullAddress)}
    >
    <Search className="mr-2 h-4 w-4" />
    Search Image
    </Button>
    </div>

    <ImageUpload
    initialImage={propertyData.image}
    onImageChange={handleImageChange}
    isLoading={isSearchingImage}
    onRefresh={handleManualImageSearch}
    />

    <p className="text-xs text-muted-foreground">
    Images are automatically searched based on address. You can also upload your own image.
    </p>
    </div>

    <div className="space-y-2">
    <Label htmlFor="type">Property Type</Label>
    <div className="flex flex-col space-y-1">
    <div className="flex items-center space-x-2">
    <input
    type="radio"
    id="House"
    name="propertyType"
    value="House"
    checked={propertyData.propertyType === "House"}
    onChange={() => handleSelectChange("propertyType", "House")}
    />
    <Label htmlFor="House" className="font-normal">
    House
    </Label>
    </div>
    <div className="flex items-center space-x-2">
    <input
    type="radio"
    id="Apartment"
    name="propertyType"
    value="Apartment"
    checked={propertyData.propertyType === "Apartment"}
    onChange={() => handleSelectChange("propertyType", "Apartment")}
    />
    <Label htmlFor="Apartment" className="font-normal">
    Apartment
    </Label>
    </div>
    </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
    <Label htmlFor="bedrooms">Bedrooms</Label>
    <Input
    id="bedrooms"
    name="bedrooms"
    type="number"
    min="0"
    placeholder="Ex: 3"
    value={propertyData.bedrooms}
    onChange={handlePropertyChange}
    required
    />
    </div>

    <div className="space-y-2">
    <Label htmlFor="bathrooms">Bathrooms</Label>
    <Input
    id="bathrooms"
    name="bathrooms"
    type="number"
    min="0"
    step="0.5"
    placeholder="Ex: 2.5"
    value={propertyData.bathrooms}
    onChange={handlePropertyChange}
    required
    />
    </div>
    </div>

    <div className="space-y-2">
    <Label htmlFor="rent">Monthly Rent ($)</Label>
    <Input
    id="rent"
    name="rent"
    type="number"
    min="0"
    placeholder="Ex: 1500"
    value={propertyData.rent}
    onChange={handlePropertyChange}
    required
    />
    </div>
    </CardContent>

    <CardFooter className="flex justify-between">
    <Button type="button" variant="outline" onClick={() => router.back()}>
    Cancel
    </Button>

    <Button
    type="button"
    onClick={handleSubmit}
    disabled={isSubmitting}
    >
    <Building className="mr-2 h-4 w-4" />
    {isSubmitting ? "Creating..." : "Add Property"}
    </Button>
    </CardFooter>
    </Card>
    </div>
  )
}
