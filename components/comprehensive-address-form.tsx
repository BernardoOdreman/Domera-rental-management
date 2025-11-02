"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GeocodingResult } from "@/utils/geocoding"

// US states for the dropdown
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
]

// State abbreviations to full names mapping
const STATE_ABBREVIATIONS: Record<string, string> = US_STATES.reduce(
  (acc, state) => {
    acc[state.label.toLowerCase()] = state.value
    return acc
  },
  {} as Record<string, string>,
)

export interface AddressFormData {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  fullAddress: string
  latitude?: number
  longitude?: number
}

interface ComprehensiveAddressFormProps {
  value: AddressFormData
  onChange: (value: AddressFormData) => void
  required?: boolean
}

// Default empty address data
const emptyAddressData: AddressFormData = {
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  fullAddress: "",
}

export function ComprehensiveAddressForm({ value, onChange, required = false }: ComprehensiveAddressFormProps) {
  const [autocompleteValue, setAutocompleteValue] = useState("")
  const [manuallyEdited, setManuallyEdited] = useState(false)
  const [parsingError, setParsingError] = useState<string | null>(null)

  // Initialize autocomplete value from full address if available
  useEffect(() => {
    if (value.fullAddress && !autocompleteValue) {
      setAutocompleteValue(value.fullAddress)
    }
  }, [value.fullAddress, autocompleteValue])

  // Handle selection from autocomplete with detailed address components
  const handleAddressSelect = (location: {
    address: string
    latitude: number
    longitude: number
    address_components?: GeocodingResult["address_components"]
  }) => {
    setParsingError(null)

    try {
      let streetAddress = ""
      let city = ""
      let state = ""
      let zipCode = ""

      // Use the detailed address components if available
      if (location.address_components) {
        const components = location.address_components

        // Build street address from house number and road
        const addressParts = []
        if (components.house_number) addressParts.push(components.house_number)
        if (components.road) addressParts.push(components.road)
        streetAddress = addressParts.join(" ")

        // Get city (could be in city, town, or village)
        city = components.city || components.town || components.village || components.suburb || ""

        // Get state
        state = components.state || ""

        // Get ZIP code
        zipCode = components.postcode || ""

        // If we have a state name instead of code, convert it
        if (state && state.length > 2) {
          const stateKey = state.toLowerCase()
          if (STATE_ABBREVIATIONS[stateKey]) {
            state = STATE_ABBREVIATIONS[stateKey]
          }
        }

        console.log("Using detailed address components:", { streetAddress, city, state, zipCode })
      }

      // If any components are missing, fall back to parsing the full address
      if (!streetAddress || !city || !state || !zipCode) {
        console.log("Some components missing, falling back to address parsing")
        const parsedAddress = parseAddressComponents(location.address)

        if (!streetAddress) streetAddress = parsedAddress.streetAddress
        if (!city) city = parsedAddress.city
        if (!state) state = parsedAddress.state
        if (!zipCode) zipCode = parsedAddress.zipCode
      }

      setAutocompleteValue(location.address)
      setManuallyEdited(false)

      onChange({
        streetAddress,
        city,
        state,
        zipCode,
        fullAddress: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      })
    } catch (error) {
      console.error("Error processing address components:", error)
      setParsingError("Error processing address. Please enter components manually.")

      // Fall back to parsing the address
      const parsedAddress = parseAddressComponents(location.address)

      setAutocompleteValue(location.address)
      setManuallyEdited(false)

      onChange({
        ...parsedAddress,
        fullAddress: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      })
    }
  }

  // Enhanced address parsing function
  const parseAddressComponents = (fullAddress: string): AddressFormData => {
    setParsingError(null)

    try {
      // Normalize the address by removing extra spaces and ensuring consistent commas
      const normalizedAddress = fullAddress
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .trim()

      // Initialize with empty values
      let streetAddress = ""
      let city = ""
      let state = ""
      let zipCode = ""

      // Extract ZIP code - look for 5 digit number at the end or before the country
      const zipRegex = /\b(\d{5})(?:-\d{4})?\b/g
      const zipMatches = [...normalizedAddress.matchAll(zipRegex)]

      if (zipMatches.length > 0) {
        // Usually the last ZIP code in the address is the correct one
        zipCode = zipMatches[zipMatches.length - 1][1]
      }

      // Extract state - try multiple approaches

      // 1. Look for 2-letter state code
      const stateCodeRegex = /\b([A-Z]{2})\b/g
      const stateMatches = [...normalizedAddress.matchAll(stateCodeRegex)]

      for (const match of stateMatches) {
        const potentialState = match[1]
        if (US_STATES.some((s) => s.value === potentialState)) {
          state = potentialState
          break
        }
      }

      // 2. If no state code found, look for full state names
      if (!state) {
        for (const [stateName, stateCode] of Object.entries(STATE_ABBREVIATIONS)) {
          const stateRegex = new RegExp(`\\b${stateName}\\b`, "i")
          if (stateRegex.test(normalizedAddress)) {
            state = stateCode
            break
          }
        }
      }

      // Extract city - typically comes before the state
      if (state) {
        // Try to find the city before the state
        const beforeState = normalizedAddress.split(state)[0]
        if (beforeState) {
          // City is typically the last segment before the state
          const segments = beforeState.split(",")
          if (segments.length > 0) {
            city = segments[segments.length - 1].trim()
          }
        }
      }

      // If we couldn't find the city, try another approach
      if (!city && zipCode) {
        // Try to find the segment before the ZIP code
        const beforeZip = normalizedAddress.split(zipCode)[0]
        if (beforeZip) {
          const segments = beforeZip.split(",")
          if (segments.length > 1) {
            // City is typically right before the ZIP code
            city = segments[segments.length - 1].trim()

            // Remove the state code if it's part of the city
            if (state) {
              city = city.replace(new RegExp(`\\s*${state}\\s*$`), "").trim()
            }
          }
        }
      }

      // Extract street address - everything before the city
      if (city) {
        const beforeCity = normalizedAddress.split(city)[0]
        if (beforeCity) {
          // Street address is everything up to the last comma before the city
          streetAddress = beforeCity.replace(/,\s*$/, "").trim()
        }
      }

      // If we still don't have a street address, use the first segment
      if (!streetAddress) {
        const segments = normalizedAddress.split(",")
        if (segments.length > 0) {
          streetAddress = segments[0].trim()
        }
      }

      // Final validation and cleanup

      // If we have a state but it's in the street address, remove it
      if (state && streetAddress.includes(state)) {
        streetAddress = streetAddress.replace(new RegExp(`\\s*${state}\\s*`), " ").trim()
      }

      // If we have a ZIP code but it's in the street address, remove it
      if (zipCode && streetAddress.includes(zipCode)) {
        streetAddress = streetAddress.replace(new RegExp(`\\s*${zipCode}\\s*`), " ").trim()
      }

      // Remove any trailing commas from street address
      streetAddress = streetAddress.replace(/,\s*$/, "").trim()

      // Log the parsed components for debugging
      console.log("Parsed address components:", {
        fullAddress,
        streetAddress,
        city,
        state,
        zipCode,
      })

      // Check if we have at least some basic information
      if (!streetAddress && !city && !state && !zipCode) {
        setParsingError("Could not parse address components. Please enter them manually.")
        // Return the full address as the street address as a fallback
        return {
          streetAddress: fullAddress,
          city: "",
          state: "",
          zipCode: "",
          fullAddress,
        }
      }

      return {
        streetAddress,
        city,
        state,
        zipCode,
        fullAddress,
      }
    } catch (error) {
      console.error("Error parsing address:", error)
      setParsingError("Error parsing address. Please enter components manually.")

      // Return the full address as the street address as a fallback
      return {
        streetAddress: fullAddress,
        city: "",
        state: "",
        zipCode: "",
        fullAddress,
      }
    }
  }

  // Handle manual changes to individual fields
  const handleFieldChange = (field: keyof AddressFormData, fieldValue: string) => {
    setManuallyEdited(true)
    setParsingError(null)

    const newValue = {
      ...value,
      [field]: fieldValue,
    }

    // Update the full address when individual fields change
    if (field !== "fullAddress") {
      // Only include non-empty components in the full address
      const components = []

      if (newValue.streetAddress) components.push(newValue.streetAddress)

      const cityStateZip = []
      if (newValue.city) cityStateZip.push(newValue.city)
      if (newValue.state) cityStateZip.push(newValue.state)
      if (newValue.zipCode) cityStateZip.push(newValue.zipCode)

      if (cityStateZip.length > 0) {
        components.push(cityStateZip.join(", "))
      }

      newValue.fullAddress = components.join(", ")
      setAutocompleteValue(newValue.fullAddress)
    }

    onChange(newValue)
  }

  // Handle clearing all address fields
  const handleClearAddress = () => {
    setAutocompleteValue("")
    setManuallyEdited(false)
    setParsingError(null)
    onChange(emptyAddressData)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address-autocomplete">Property Address</Label>
        <AddressAutocomplete
          id="address-autocomplete"
          value={autocompleteValue}
          onChange={(value) => {
            setAutocompleteValue(value)
            // If the user manually clears the input, also clear the individual fields
            if (value === "") {
              handleClearAddress()
            }
          }}
          onLocationSelect={handleAddressSelect}
          onClear={handleClearAddress}
          placeholder="Start typing to search for an address..."
          required={required}
        />
        <p className="text-xs text-muted-foreground">Search for an address or enter details manually below</p>
        {parsingError && <p className="text-xs text-destructive mt-1">{parsingError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street-address">Street Address</Label>
        <Input
          id="street-address"
          value={value.streetAddress}
          onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
          placeholder="123 Main St"
          required={required}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={value.city}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            placeholder="City"
            required={required}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={value.state} onValueChange={(value) => handleFieldChange("state", value)}>
              <SelectTrigger id="state">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" position="popper">
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip-code">ZIP Code</Label>
            <Input
              id="zip-code"
              value={value.zipCode}
              onChange={(e) => handleFieldChange("zipCode", e.target.value)}
              placeholder="12345"
              maxLength={5}
              pattern="[0-9]{5}"
              required={required}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
