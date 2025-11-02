"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MapPin, Loader2, X, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { searchAddresses, type GeocodingResult } from "@/utils/geocoding"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (location: {
    address: string
    latitude: number
    longitude: number
    address_components?: GeocodingResult["address_components"]
  }) => void
  onClear?: () => void
  className?: string
  placeholder?: string
  id?: string
  name?: string
  required?: boolean
  showCurrentLocation?: boolean
  minResults?: number
}

export function AddressAutocomplete({
  value,
  onChange,
  onLocationSelect,
  onClear,
  className,
  placeholder = "Enter U.S. address...",
  id,
  name,
  required,
  showCurrentLocation = false,
  minResults = 6,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [noExactMatches, setNoExactMatches] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch address suggestions using our geocoding utility
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      setNoExactMatches(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setNoExactMatches(false)

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController()

    // Check if the query is numeric (like a ZIP code)
    const isNumericQuery = /^\d+$/.test(query)

    try {
      // First try to get exact matches
      const results = await searchAddresses(query, {
        limit: Math.max(minResults, 12), // Request at least minResults, but up to 12
        abortSignal: abortControllerRef.current.signal,
        countryCode: "us",
        exactMatch: isNumericQuery, // Only require exact matches for numeric queries
      })

      // If we don't have enough results and it's a numeric query, try again with partial matching
      if (isNumericQuery && results.length < minResults) {
        // Set flag to show a message that we're showing partial matches
        setNoExactMatches(results.length === 0)

        // If we have some exact matches, use them
        if (results.length > 0) {
          setSuggestions(results)
          setIsOpen(results.length > 0 && isFocused)
        } else {
          // Otherwise, try to get partial matches
          const partialResults = await searchAddresses(query, {
            limit: Math.max(minResults, 12),
            abortSignal: abortControllerRef.current.signal,
            countryCode: "us",
            exactMatch: false,
          })

          setSuggestions(partialResults)
          setIsOpen(partialResults.length > 0 && isFocused)
        }
      } else {
        // For non-numeric queries or if we have enough results
        setSuggestions(results)
        setIsOpen(results.length > 0 && isFocused)
      }

      setHighlightedIndex(-1)
    } catch (err) {
      console.error("Error fetching address suggestions:", err)
      setError("Failed to fetch address suggestions. Please try again.")
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced input handler to prevent too many API calls
  const debouncedFetchSuggestions = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Shorter debounce time for a more responsive feel
    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(query)
    }, 200) // 200ms debounce for better responsiveness
  }

  // Update suggestions when input changes
  useEffect(() => {
    debouncedFetchSuggestions(value)

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [value])

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    }
    // Enter
    else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[highlightedIndex])
    }
    // Escape
    else if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const selectSuggestion = (suggestion: GeocodingResult) => {
    onChange(suggestion.display_name)
    setIsOpen(false)

    if (onLocationSelect) {
      onLocationSelect({
        address: suggestion.display_name,
        latitude: typeof suggestion.lat === "string" ? Number.parseFloat(suggestion.lat) : (suggestion.lat as number),
        longitude: typeof suggestion.lon === "string" ? Number.parseFloat(suggestion.lon) : (suggestion.lon as number),
        address_components: suggestion.address_components,
      })
    }
  }

  // Clear input handler
  const handleClearInput = () => {
    onChange("")
    setIsOpen(false)
    setError(null)
    setNoExactMatches(false)
    inputRef.current?.focus()
    setIsFocused(true)

    // Call the onClear callback if provided
    if (onClear) {
      onClear()
    }
  }

  // Get current location - keeping the function but not showing the button by default
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setIsGettingLocation(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode the coordinates to get an address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1&countrycodes=us`,
            {
              headers: {
                "User-Agent": "LandlordDashboard/1.0",
              },
            },
          )

          if (!response.ok) {
            throw new Error("Failed to get address from coordinates")
          }

          const data = await response.json()

          if (data && data.display_name) {
            onChange(data.display_name)

            if (onLocationSelect) {
              onLocationSelect({
                address: data.display_name,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address_components: data.address,
              })
            }
          }
        } catch (err) {
          console.error("Error getting current location address:", err)
          setError("Could not determine your current address")
        } finally {
          setIsGettingLocation(false)
        }
      },
      (err) => {
        console.error("Error getting current location:", err)
        setError("Could not access your location. Please check your browser permissions.")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // Format U.S. address to be more readable
  const formatUSAddress = (address: string): string => {
    // Remove country name from the end for cleaner display
    return address
      .replace(/, United States of America$/, "")
      .replace(/, USA$/, "")
      .replace(/, United States$/, "")
  }

  // Highlight matching text in suggestions with improved styling
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return formatUSAddress(text)

    const formattedText = formatUSAddress(text)
    const normalizedQuery = query.toLowerCase().trim()
    const normalizedText = formattedText.toLowerCase()

    // Special handling for numeric queries
    const isNumericQuery = /^\d+$/.test(query)

    if (isNumericQuery) {
      // For numeric queries, use a regex to find the exact number sequence
      const regex = new RegExp(`(${query})`, "g")
      const parts = formattedText.split(regex)

      return (
        <>
          {parts.map((part, i) =>
            part === query ? (
              <span key={i} className="bg-blue-600 text-white font-medium px-0.5 rounded-sm">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </>
      )
    }

    // For non-numeric queries, use the existing logic
    // Try to find exact matches first
    const index = normalizedText.indexOf(normalizedQuery)

    if (index === -1) {
      // If exact substring not found, try to highlight individual words
      const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length >= 2)

      // Create spans with proper styling instead of using dangerouslySetInnerHTML
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      const textLower = formattedText.toLowerCase()

      // Process each word to find matches
      queryWords.forEach((word) => {
        let wordIndex = textLower.indexOf(word, lastIndex)
        while (wordIndex !== -1) {
          // Add text before the match
          if (wordIndex > lastIndex) {
            parts.push(formattedText.substring(lastIndex, wordIndex))
          }

          // Add the highlighted match with vibrant color and white text
          parts.push(
            <span key={`highlight-${wordIndex}`} className="bg-blue-600 text-white font-medium px-0.5 rounded-sm">
              {formattedText.substring(wordIndex, wordIndex + word.length)}
            </span>,
          )

          lastIndex = wordIndex + word.length
          wordIndex = textLower.indexOf(word, lastIndex)
        }
      })

      // Add any remaining text
      if (lastIndex < formattedText.length) {
        parts.push(formattedText.substring(lastIndex))
      }

      return parts.length > 0 ? <>{parts}</> : formattedText
    }

    // For exact substring match
    return (
      <>
        {formattedText.substring(0, index)}
        <span className="bg-blue-600 text-white font-medium px-0.5 rounded-sm">
          {formattedText.substring(index, index + normalizedQuery.length)}
        </span>
        {formattedText.substring(index + normalizedQuery.length)}
      </>
    )
  }

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true)
    if (value.length >= 2 && suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pr-8", className)}
          id={id}
          name={name}
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? "address-suggestions" : undefined}
          aria-activedescendant={highlightedIndex >= 0 ? `address-suggestion-${highlightedIndex}` : undefined}
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full p-0 opacity-70 hover:opacity-100"
            onClick={handleClearInput}
            aria-label="Clear input"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear</span>
          </Button>
        ) : null}
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          id="address-suggestions"
          role="listbox"
        >
          {noExactMatches && /^\d+$/.test(value) && (
            <div className="px-3 py-1 text-xs text-muted-foreground border-b">
              No exact matches for "{value}". Showing similar results:
            </div>
          )}
          <ul className="max-h-[280px] overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`address-suggestion-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={cn(
                  "flex cursor-pointer items-center px-3 py-2 text-sm transition-colors",
                  index === highlightedIndex ? "bg-muted" : "hover:bg-muted/50",
                  suggestion.matchType === "exact" ? "font-medium" : "",
                )}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <MapPin
                  className={cn(
                    "mr-2 h-4 w-4 flex-shrink-0",
                    suggestion.matchType === "exact" ? "text-blue-600" : "text-muted-foreground",
                  )}
                />
                <div className="overflow-hidden text-ellipsis">{highlightMatch(suggestion.display_name, value)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && value.length >= 2 && suggestions.length === 0 && !isLoading && !error && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 text-center text-sm text-muted-foreground shadow-md">
          No matching U.S. addresses found
        </div>
      )}
    </div>
  )
}
