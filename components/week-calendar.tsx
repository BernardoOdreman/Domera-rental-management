"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

// Enhanced events data with multiple events on March 12th
const EVENTS = [
  { date: new Date(2025, 2, 15), title: "Lease Renewal - Sarah Johnson", type: "renewal" },
  { date: new Date(2025, 2, 30), title: "Lease Renewal - Michael Brown", type: "renewal" },
  { date: new Date(2025, 2, 10), title: "Property Inspection - 123 Main St", type: "inspection" },
  { date: new Date(2025, 2, 18), title: "Maintenance - HVAC Service", type: "maintenance" },
  { date: new Date(2025, 2, 22), title: "Rent Collection Deadline", type: "payment" },
  // Three distinct events on March 12th
  { date: new Date(2025, 2, 12), title: "Tenant Interview - New Applicant", type: "renewal" },
  { date: new Date(2025, 2, 12), title: "Plumbing Repair - 456 Oak Ave", type: "maintenance" },
  { date: new Date(2025, 2, 12), title: "Property Tax Due", type: "payment" },
]

interface WeekCalendarProps {
  className?: string
  onSelectEvent?: (event: any) => void
}

export function WeekCalendar({ className, onSelectEvent }: WeekCalendarProps) {
  // Set initial date to March 15, 2025 (middle of the month from the sample data)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 15))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get the current week's start date (Sunday)
  const getWeekStart = (date: Date) => {
    const day = date.getDay() // 0 for Sunday, 1 for Monday, etc.
    const diff = date.getDate() - day
    return new Date(date.getFullYear(), date.getMonth(), diff)
  }

  const weekStart = getWeekStart(currentDate)

  // Previous week
  const prevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
    setSelectedDate(null) // Clear selection when changing weeks
  }

  // Next week
  const nextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
    setSelectedDate(null) // Clear selection when changing weeks
  }

  // Generate week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    weekDays.push(day)
  }

  // Check if a date has events
  const getEventsForDate = (date: Date) => {
    return EVENTS.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Format date range for header
  const formatDateRange = () => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const startMonth = weekStart.toLocaleString("default", { month: "short" })
    const endMonth = weekEnd.toLocaleString("default", { month: "short" })

    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    } else {
      return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    }
  }

  // Format selected date
  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    const events = getEventsForDate(date)
    if (events.length > 0) {
      setSelectedDate(date)
      if (onSelectEvent) {
        onSelectEvent(events)
      }
    } else {
      setSelectedDate(null)
    }
  }

  return (
    <div className={cn("w-full flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-1">
        <Button variant="ghost" size="sm" onClick={prevWeek} className="h-5 w-5 p-0">
          <ChevronLeft className="h-3 w-3" />
          <span className="sr-only">Previous week</span>
        </Button>
        <h3 className="text-[10px] font-medium">{formatDateRange()}</h3>
        <Button variant="ghost" size="sm" onClick={nextWeek} className="h-5 w-5 p-0">
          <ChevronRight className="h-3 w-3" />
          <span className="sr-only">Next week</span>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {/* Day names with accent color and bolder font */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => (
          <div key={`day-name-${index}`} className="text-center text-[9px] font-bold text-primary">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {weekDays.map((date, index) => {
          const events = getEventsForDate(date)
          const hasEvents = events.length > 0
          const isToday = new Date().toDateString() === date.toDateString()
          const isSelected =
            selectedDate &&
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear()

          return (
            <div
              key={`day-${index}`}
              className={cn(
                "text-center text-[9px] relative group cursor-pointer transition-colors flex flex-col items-center justify-start pt-0.5",
                hasEvents ? "hover:bg-primary/10" : "hover:bg-muted/50",
                isToday && "font-bold text-primary",
                isSelected && "bg-primary/20 font-bold",
                date.getMonth() !== currentDate.getMonth() && "text-muted-foreground/50",
                "rounded-sm",
              )}
              onClick={() => handleDateClick(date)}
            >
              <span className={cn("relative z-10", isSelected && "text-primary")}>{date.getDate()}</span>

              {hasEvents && (
                <div className="mt-0.5 flex gap-0.5 flex-wrap justify-center">
                  {events.map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1 w-1 rounded-full",
                        event.type === "renewal" && "bg-amber-500",
                        event.type === "inspection" && "bg-blue-500",
                        event.type === "maintenance" && "bg-red-500",
                        event.type === "payment" && "bg-green-500",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Event details area */}
      <div className="mt-auto min-h-[40px] text-[9px] border-t border-border/10 pt-1">
        {selectedDate ? (
          <div className="h-full flex flex-col">
            <div className="text-primary font-bold text-[11px] mb-1">{formatSelectedDate(selectedDate)}</div>
            <ScrollArea className="h-[25px] w-full">
              <div className="space-y-1 pr-2">
                {getEventsForDate(selectedDate).map((event, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full flex-shrink-0",
                        event.type === "renewal" && "bg-amber-500",
                        event.type === "inspection" && "bg-blue-500",
                        event.type === "maintenance" && "bg-red-500",
                        event.type === "payment" && "bg-green-500",
                      )}
                    />
                    <span className="text-foreground font-medium truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a date with events to see details
          </div>
        )}
      </div>
    </div>
  )
}
