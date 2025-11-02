"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MiniCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectEvent?: (events: any[]) => void
  compact?: boolean
}

// Sample events data
const EVENTS = [
  {
    id: "1",
    title: "Lease Renewal - Sarah Johnson",
    date: new Date(2025, 2, 15),
    type: "renewal",
    description: "Lease renewal for 123 Main St, Apt 4B",
  },
  {
    id: "2",
    title: "Lease Renewal - Michael Brown",
    date: new Date(2025, 2, 30),
    type: "renewal",
    description: "Lease renewal for 456 Oak Ave, Unit 2",
  },
  {
    id: "3",
    title: "Property Inspection - 123 Main St",
    date: new Date(2025, 2, 10),
    type: "inspection",
    description: "Quarterly inspection of property",
  },
  {
    id: "4",
    title: "Maintenance - HVAC Service",
    date: new Date(2025, 2, 18),
    type: "maintenance",
    description: "Regular HVAC maintenance for 456 Oak Ave",
  },
  {
    id: "5",
    title: "Rent Collection Deadline",
    date: new Date(2025, 2, 5),
    type: "payment",
    description: "Last day for tenants to pay rent without late fees",
  },
  {
    id: "6",
    title: "Meeting with Property Manager",
    date: new Date(2025, 2, 25),
    type: "meeting",
    description: "Quarterly review of property portfolio",
  },
]

export function MiniCalendar({ className, onSelectEvent, ...props }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const today = new Date()

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week (0-6, where 0 is Sunday)
  const getDayOfWeek = (year: number, month: number, day: number) => {
    return new Date(year, month, day).getDay()
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return EVENTS.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Navigate to previous month
  const navigatePrevious = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // Navigate to next month
  const navigateNext = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const events = getEventsForDate(date)
    if (onSelectEvent) {
      onSelectEvent(events)
    }
  }

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getDayOfWeek(currentYear, currentMonth, 1)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()

      const hasEvents = getEventsForDate(date).length > 0

      days.push(
        <button
          key={`day-${day}`}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm relative",
            isToday ? "bg-primary text-primary-foreground font-medium" : "",
            isSelected && !isToday ? "bg-primary/10 text-primary font-medium" : "",
            !isToday && !isSelected ? "hover:bg-muted" : "",
          )}
          onClick={() => handleDateClick(date)}
        >
          {day}
          {hasEvents && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>,
      )
    }

    return days
  }

  // Set today as selected date on initial render
  useEffect(() => {
    handleDateClick(today)
  }, [])

  return (
    <div className={cn("", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={navigatePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        <Button variant="ghost" size="icon" onClick={navigateNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="h-8 w-8 text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  )
}
