"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MapPin, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { filterCities } from "@/utils/city-data"
import { cn } from "@/lib/utils"

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (location: { address: string; latitude: number; longitude: number }) => void
  className?: string
  placeholder?: string
  buttonLabel?: React.ReactNode
  onButtonClick?: () => void
  buttonDisabled?: boolean
}

export function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  className,
  placeholder = "Enter location...",
  buttonLabel,
  onButtonClick,
  buttonDisabled,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Array<{ city: string; state: string; fullName: string }>>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter suggestions when input changes
  useEffect(() => {
    // Only show suggestions if there's at least 2 characters
    if (value.trim().length >= 2) {
      const filteredCities = filterCities(value)
      setSuggestions(filteredCities)
      setIsOpen(filteredCities.length > 0)
      setHighlightedIndex(-1)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [value])

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
    }
  }

  // Handle suggestion selection
  const selectSuggestion = (suggestion: { city: string; state: string; fullName: string }) => {
    onChange(suggestion.fullName)
    setIsOpen(false)

    if (onLocationSelect) {
      // In a real app, we would get actual coordinates from a geocoding service
      // For now, we'll use mock coordinates
      onLocationSelect({
        address: suggestion.fullName,
        latitude: 37.7749 + (Math.random() * 0.1 - 0.05),
        longitude: -122.4194 + (Math.random() * 0.1 - 0.05),
      })
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Clear input handler
  const handleClearInput = () => {
    onChange("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => value.trim() && setSuggestions(filterCities(value)) && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn("pr-7", className)}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full p-0 opacity-70 hover:opacity-100"
              onClick={handleClearInput}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>

        {buttonLabel && (
          <Button
            variant="outline"
            size="icon"
            onClick={onButtonClick}
            disabled={buttonDisabled}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            {buttonLabel}
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-[200px] overflow-auto rounded-md border border-border/30 bg-popover shadow-md"
        >
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.city}-${suggestion.state}`}
                className={cn(
                  "flex cursor-pointer items-center px-3 py-1.5 text-xs",
                  index === highlightedIndex ? "bg-muted text-foreground font-medium" : "hover:bg-muted/50",
                )}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{suggestion.city}</span>
                <span className="ml-1 text-muted-foreground">{suggestion.state}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && value.trim() && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/30 bg-popover shadow-md">
          <div className="p-2 text-xs text-center text-muted-foreground">No matching cities found</div>
        </div>
      )}
    </div>
  )
}
