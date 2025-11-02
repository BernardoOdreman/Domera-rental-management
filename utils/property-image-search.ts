// This is a simulated image search function
// In a real implementation, this would call an external API like Google Places, Zillow, etc.

type PropertyType = "Apartment" | "House" | "Townhouse" | "Condo" | "Studio"

export async function searchPropertyImage(address: string, propertyType: PropertyType): Promise<string | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In a real implementation, we would parse the address and search for images
  // For this simulation, we'll return different placeholder images based on property type

  // Simulate a 20% chance of not finding an image
  if (Math.random() < 0.2) {
    return null
  }

  // Return a placeholder image based on property type
  switch (propertyType) {
    case "Apartment":
      return `/placeholder.svg?height=300&width=500&query=modern apartment building`
    case "House":
      return `/placeholder.svg?height=300&width=500&query=single family house with yard`
    case "Townhouse":
      return `/placeholder.svg?height=300&width=500&query=row of connected townhouses`
    case "Condo":
      return `/placeholder.svg?height=300&width=500&query=luxury condominium building`
    case "Studio":
      return `/placeholder.svg?height=300&width=500&query=small studio apartment`
    default:
      return `/placeholder.svg?height=300&width=500&query=residential property`
  }
}

// Function to validate if an address is complete enough to search for images
export function isAddressSearchable(address: string): boolean {
  // Check if address has at least 10 characters and contains numbers and letters
  return address.length >= 10 && /\d/.test(address) && /[a-zA-Z]/.test(address)
}
