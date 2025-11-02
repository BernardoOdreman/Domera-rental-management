import React, { useState, useRef, useEffect } from 'react'
import { Users, ChevronDown } from "lucide-react"


export interface CustomSelectProps {
  id: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

const CustomSelect = ({
  id,
  value,
  options,
  onChange,
  required = false,
  placeholder = "Select an option"
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find(option => option.value === value)
  const displayLabel = selectedOption?.label || placeholder

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleOptionClick = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        id={id}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${!selectedOption ? "text-muted-foreground" : ""
          }`}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`relative flex w-full cursor-default select-none items-center px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${value === option.value ? "bg-accent/50" : ""
                  }`}
                onClick={(e) => handleOptionClick(option.value, e)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default CustomSelect;