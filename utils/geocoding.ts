// This utility provides geocoding functionality with multiple provider options

// Define the structure of address suggestions
export interface GeocodingResult {
  id: string | number
  display_name: string
  lat: string | number
  lon: string | number
  matchType?: "exact" | "partial"
  address_components?: {
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}

// Function to search for addresses using Nominatim (OpenStreetMap)
export async function searchAddresses(
  query: string,
  options: {
    limit?: number
    language?: string
    abortSignal?: AbortSignal
    countryCode?: string
    exactMatch?: boolean
  } = {},
): Promise<GeocodingResult[]> {
  const { limit = 12, language = "en", abortSignal, countryCode = "us", exactMatch = false } = options

  try {
    // Build the query URL with country code filter
    const queryParams = new URLSearchParams({
      format: "json",
      q: query,
      addressdetails: "1", // Request detailed address components
      limit: (limit * 2).toString(), // Request more results to filter locally
      "accept-language": language,
    })

    // Add country code filter - restrict to US addresses only
    if (countryCode) {
      queryParams.append("countrycodes", countryCode)
    }

    // Use Nominatim API (OpenStreetMap's geocoding service)
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${queryParams.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "LandlordDashboard/1.0", // Required by Nominatim usage policy
      },
      signal: abortSignal,
    })

    if (!response.ok) {
      throw new Error(`Error fetching address suggestions: ${response.status}`)
    }

    const data = await response.json()

    // Check if we're dealing with a numeric input (like ZIP code)
    const isNumericQuery = /^\d+$/.test(query)

    // Transform and filter the response
    let results = data.map((item: any) => ({
      id: item.place_id,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      // Include detailed address components
      address_components: item.address,
      // Check if this is an exact match
      matchType: exactMatchCheck(item, query, isNumericQuery) ? "exact" : "partial",
    }))

    // For numeric queries, prioritize ZIP code matches
    if (isNumericQuery) {
      // Sort results to prioritize exact matches first
      results.sort((a, b) => {
        // First sort by match type (exact first)
        if (a.matchType === "exact" && b.matchType !== "exact") return -1
        if (a.matchType !== "exact" && b.matchType === "exact") return 1

        // Then sort by how early the match appears in the string
        const aIndex = a.display_name.toLowerCase().indexOf(query.toLowerCase())
        const bIndex = b.display_name.toLowerCase().indexOf(query.toLowerCase())

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1

        return 0
      })
    }

    // If exactMatch is true, only return exact matches
    if (exactMatch) {
      results = results.filter((item) => item.matchType === "exact")
    }

    // Limit to the requested number of results
    return results.slice(0, limit)
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      // This is an expected error when the request is aborted
      return []
    }

    console.error("Error in geocoding service:", error)
    throw error
  }
}

// Helper function to check if an address is an exact match for the query
function exactMatchCheck(item: any, query: string, isNumericQuery: boolean): boolean {
  const normalizedQuery = query.toLowerCase()

  // For numeric queries (like ZIP codes), check if it appears as a complete segment
  if (isNumericQuery) {
    // Check if the address contains the exact numeric sequence
    // This regex looks for the numeric sequence as a complete segment
    const regex = new RegExp(`(^|[^\\d])${query}([^\\d]|$)`)
    return regex.test(item.display_name)
  }

  // For text queries, check if any part of the address is an exact match
  const addressParts = [
    item.address?.road,
    item.address?.house_number,
    item.address?.postcode,
    item.address?.city,
    item.address?.town,
    item.address?.village,
    item.address?.suburb,
    item.address?.neighbourhood,
    item.address?.state,
  ]
    .filter(Boolean)
    .map((part) => part.toLowerCase())

  // Check if any part exactly matches the query
  return addressParts.some((part) => part === normalizedQuery)
}

// Function to get coordinates for a specific address (reverse geocoding)
export async function getCoordinates(
  address: string,
  options: {
    abortSignal?: AbortSignal
    countryCode?: string
  } = {},
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await searchAddresses(address, {
      limit: 1,
      abortSignal: options.abortSignal,
      countryCode: options.countryCode || "us",
      exactMatch: true,
    })

    if (results.length === 0) {
      return null
    }

    return {
      latitude: typeof results[0].lat === "string" ? Number.parseFloat(results[0].lat) : (results[0].lat as number),
      longitude: typeof results[0].lon === "string" ? Number.parseFloat(results[0].lon) : (results[0].lon as number),
    }
  } catch (error) {
    console.error("Error getting coordinates:", error)
    return null
  }
}
