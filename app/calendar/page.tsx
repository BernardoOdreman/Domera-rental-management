"use client"

import type React from "react"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, MapPin, Users, Tag, CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format, isValid } from "date-fns"
import { toast } from "@/components/ui/use-toast"

// Event type definition
type Event = {
  id: string
  title: string
  date: Date
  endDate?: Date
  type: string
  description: string
  location?: string
  attendees?: string[]
  allDay?: boolean
}

// Event type options with simpler styling approach
const EVENT_TYPES = [
  {
    value: "renewal",
    label: "Lease Renewal",
    colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  {
    value: "inspection",
    label: "Inspection",
    colorClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    colorClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  {
    value: "payment",
    label: "Payment",
    colorClass: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  {
    value: "meeting",
    label: "Meeting",
    colorClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  { value: "other", label: "Other", colorClass: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20" },
]

// Sample events data
const INITIAL_EVENTS: Event[] = [
  {
    id: "1",
    title: "Lease Renewal - Sarah Johnson",
    date: new Date(2025, 2, 15, 10, 0),
    endDate: new Date(2025, 2, 15, 11, 0),
    type: "renewal",
    description: "Lease renewal for 123 Main St, Apt 4B",
    location: "Office",
    attendees: ["Sarah Johnson"],
  },
  {
    id: "2",
    title: "Lease Renewal - Michael Brown",
    date: new Date(2025, 2, 30, 14, 30),
    endDate: new Date(2025, 2, 30, 15, 30),
    type: "renewal",
    description: "Lease renewal for 456 Oak Ave, Unit 2",
    location: "Office",
    attendees: ["Michael Brown"],
  },
  {
    id: "3",
    title: "Property Inspection - 123 Main St",
    date: new Date(2025, 2, 10, 9, 0),
    endDate: new Date(2025, 2, 10, 11, 0),
    type: "inspection",
    description: "Quarterly inspection of property",
    location: "123 Main St",
  },
  {
    id: "4",
    title: "Maintenance - HVAC Service",
    date: new Date(2025, 2, 18, 13, 0),
    endDate: new Date(2025, 2, 18, 15, 0),
    type: "maintenance",
    description: "Regular HVAC maintenance for 456 Oak Ave",
    location: "456 Oak Ave",
    attendees: ["HVAC Technician"],
  },
  {
    id: "5",
    title: "Rent Collection Deadline",
    date: new Date(2025, 2, 5),
    type: "payment",
    description: "Last day for tenants to pay rent without late fees",
    allDay: true,
  },
  {
    id: "6",
    title: "Meeting with Property Manager",
    date: new Date(2025, 2, 25, 15, 0),
    endDate: new Date(2025, 2, 25, 16, 0),
    type: "meeting",
    description: "Quarterly review of property portfolio",
    location: "Property Management Office",
    attendees: ["John Smith", "Property Manager"],
  },
]

// Get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

// Get day of week (0-6, where 0 is Sunday)
const getDayOfWeek = (year: number, month: number, day: number) => {
  return new Date(year, month, day).getDay()
}

// Format time (12-hour format)
const formatTime = (date: Date) => {
  if (!isValid(date)) return "Invalid time"

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Format date
const formatDate = (date: Date) => {
  if (!isValid(date)) return "Invalid date"

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Generate hours for dropdown
const HOURS = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))

// Generate minutes for dropdown
const MINUTES = [0, 15, 30, 45]

// AM/PM options
const PERIODS = ["AM", "PM"]

// Default new event
const DEFAULT_NEW_EVENT = {
  title: "",
  date: new Date(new Date().setHours(0, 0, 0, 0)),
  description: "",
  type: "other",
}

// Default time state
const DEFAULT_TIME_STATE = {
  hour: "12",
  minute: "00",
  period: "AM",
}

export default function CalendarPage() {
  // State
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false)
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<Event>>(DEFAULT_NEW_EVENT)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Time state for easier handling
  const [timeState, setTimeState] = useState(DEFAULT_TIME_STATE)

  const [filteredTypes, setFilteredTypes] = useState<string[]>([])
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  // Refs for click outside handling
  const filterMenuRef = useRef<HTMLDivElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  // Get current year and month
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const today = new Date()

  // Reset form when dialogs close
  useEffect(() => {
    if (!isAddEventDialogOpen && !isEditEventDialogOpen) {
      // Small delay to avoid UI flicker during dialog transitions
      const timer = setTimeout(() => {
        setNewEvent(DEFAULT_NEW_EVENT)
        setTimeState(DEFAULT_TIME_STATE)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isAddEventDialogOpen, isEditEventDialogOpen])

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        filterButtonRef.current &&
        !filterMenuRef.current.contains(event.target as Node) &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Navigate to previous month
  const navigatePrevious = useCallback(() => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() - 1)
      return newDate
    })
  }, [])

  // Navigate to next month
  const navigateNext = useCallback(() => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + 1)
      return newDate
    })
  }, [])

  // Navigate to today
  const navigateToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Handle event click
  const handleEventClick = useCallback((event: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setIsViewEventDialogOpen(true)
  }, [])

  // Handle day click
  const handleDayClick = useCallback((date: Date) => {
    const newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0) // Set to 12:00 AM

    setSelectedDate(date)
    setNewEvent({
      ...DEFAULT_NEW_EVENT,
      date: newDate,
    })

    // Reset time state
    setTimeState(DEFAULT_TIME_STATE)
    setIsAddEventDialogOpen(true)
  }, [])

  // Update event time based on time state
  const updateEventTime = useCallback(() => {
    if (!newEvent.date) return newEvent.date

    try {
      const hour = Number.parseInt(timeState.hour)
      const minute = Number.parseInt(timeState.minute)
      const isPM = timeState.period === "PM"

      if (isNaN(hour) || isNaN(minute)) {
        throw new Error("Invalid time values")
      }

      const adjustedHour = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour

      const newDate = new Date(newEvent.date)
      newDate.setHours(adjustedHour, minute)

      return newDate
    } catch (error) {
      console.error("Error updating event time:", error)
      return newEvent.date
    }
  }, [newEvent.date, timeState])

  // Validate event data
  const validateEventData = useCallback(() => {
    if (!newEvent.title?.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your event",
        variant: "destructive",
      })
      return false
    }

    if (!newEvent.date) {
      toast({
        title: "Missing date",
        description: "Please select a date for your event",
        variant: "destructive",
      })
      return false
    }

    return true
  }, [newEvent])

  // Handle add event
  const handleAddEvent = useCallback(async () => {
    if (!validateEventData()) return

    try {
      setIsSubmitting(true)

      // Update the date with the selected time
      const updatedDate = updateEventTime()

      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title!,
        date: updatedDate,
        endDate: newEvent.endDate ? new Date(newEvent.endDate) : undefined,
        type: newEvent.type || "other",
        description: newEvent.description || "",
        location: newEvent.location,
        attendees: newEvent.attendees,
        allDay: newEvent.allDay,
      }

      // Simulate network delay for a more realistic experience
      await new Promise((resolve) => setTimeout(resolve, 300))

      setEvents((prev) => [...prev, event])
      setIsAddEventDialogOpen(false)

      toast({
        title: "Event added",
        description: "Your event has been added to the calendar",
      })
    } catch (error) {
      console.error("Error adding event:", error)
      toast({
        title: "Error adding event",
        description: "There was a problem adding your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [newEvent, updateEventTime, validateEventData])

  // Handle edit event
  const handleEditEvent = useCallback(async () => {
    if (!validateEventData() || !selectedEvent) return

    try {
      setIsSubmitting(true)

      // Update the date with the selected time
      const updatedDate = updateEventTime()

      // Simulate network delay for a more realistic experience
      await new Promise((resolve) => setTimeout(resolve, 300))

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              title: newEvent.title!,
              date: updatedDate,
              endDate: newEvent.endDate ? new Date(newEvent.endDate) : event.endDate,
              type: newEvent.type || event.type,
              description: newEvent.description || event.description,
              location: newEvent.location,
              attendees: newEvent.attendees,
              allDay: newEvent.allDay,
            }
          }
          return event
        }),
      )

      setIsEditEventDialogOpen(false)

      toast({
        title: "Event updated",
        description: "Your event has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error updating event",
        description: "There was a problem updating your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedEvent, newEvent, updateEventTime, validateEventData])

  // Handle delete event
  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) return

    try {
      setIsSubmitting(true)

      // Simulate network delay for a more realistic experience
      await new Promise((resolve) => setTimeout(resolve, 300))

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEvent.id))
      setIsViewEventDialogOpen(false)

      toast({
        title: "Event deleted",
        description: "Your event has been removed from the calendar",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error deleting event",
        description: "There was a problem deleting your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedEvent])

  // Open edit event dialog
  const openEditEventDialog = useCallback(() => {
    if (!selectedEvent) return

    try {
      setNewEvent({
        title: selectedEvent.title,
        date: new Date(selectedEvent.date),
        endDate: selectedEvent.endDate ? new Date(selectedEvent.endDate) : undefined,
        type: selectedEvent.type,
        description: selectedEvent.description,
        location: selectedEvent.location,
        attendees: selectedEvent.attendees,
        allDay: selectedEvent.allDay,
      })

      // Set time state from the event
      setTimeState({
        hour: String(selectedEvent.date.getHours() % 12 === 0 ? 12 : selectedEvent.date.getHours() % 12),
        minute: String(selectedEvent.date.getMinutes()).padStart(2, "0"),
        period: selectedEvent.date.getHours() >= 12 ? "PM" : "AM",
      })

      setIsViewEventDialogOpen(false)
      setIsEditEventDialogOpen(true)
    } catch (error) {
      console.error("Error preparing edit dialog:", error)
      toast({
        title: "Error",
        description: "There was a problem preparing the edit form. Please try again.",
        variant: "destructive",
      })
    }
  }, [selectedEvent])

  // Filter events by type
  const toggleFilterType = useCallback((type: string) => {
    setFilteredTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }, [])

  // Get filtered events - memoized to prevent recalculation on every render
  const filteredEvents = useMemo(() => {
    if (filteredTypes.length === 0) {
      return events
    }
    return events.filter((event) => filteredTypes.includes(event.type))
  }, [events, filteredTypes])

  // Get events for a specific date - memoized with date parameter
  const getEventsForDate = useCallback(
    (date: Date) => {
      return filteredEvents.filter((event) => {
        if (!isValid(event.date)) return false

        const eventDate = new Date(event.date)
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        )
      })
    },
    [filteredEvents],
  )

  // Get event type color class
  const getEventTypeColorClass = useCallback((type: string) => {
    const eventType = EVENT_TYPES.find((t) => t.value === type)
    return eventType ? eventType.colorClass : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  }, [])

  // Get label for event type
  const getEventTypeLabel = useCallback((type: string) => {
    const eventType = EVENT_TYPES.find((t) => t.value === type)
    return eventType ? eventType.label : "Other"
  }, [])

  // Handle date change
  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date || !isValid(date)) return

      try {
        // Preserve the time when changing the date
        const newDate = new Date(date)
        if (newEvent.date && isValid(newEvent.date)) {
          newDate.setHours(newEvent.date.getHours(), newEvent.date.getMinutes(), newEvent.date.getSeconds())
        } else {
          newDate.setHours(0, 0, 0, 0) // Default to 12:00 AM
        }

        setNewEvent((prev) => ({ ...prev, date: newDate }))
      } catch (error) {
        console.error("Error handling date change:", error)
      }
    },
    [newEvent.date],
  )

  // Handle add new event button click
  const handleAddNewEventClick = useCallback(() => {
    const newDate = new Date()
    newDate.setHours(0, 0, 0, 0) // Set to 12:00 AM

    setNewEvent({
      ...DEFAULT_NEW_EVENT,
      date: newDate,
    })

    setTimeState(DEFAULT_TIME_STATE)
    setIsAddEventDialogOpen(true)
  }, [])

  // Render month view - memoized to prevent recalculation on every render
  const monthView = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getDayOfWeek(currentYear, currentMonth, 1)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-border/50 bg-card"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      const dayEvents = getEventsForDate(date)

      days.push(
        <div
          key={`day-${day}`}
          className={`h-20 border border-border/50 p-1 overflow-hidden bg-card hover:bg-primary/5 transition-colors`}
          onClick={() => handleDayClick(date)}
          role="button"
          tabIndex={0}
          aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${dayEvents.length} events`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleDayClick(date)
              e.preventDefault()
            }
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
            {dayEvents.length > 0 && (
              <Badge variant="outline" className="text-xs text-foreground">
                {dayEvents.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs truncate rounded px-1 py-0.5 cursor-pointer ${getEventTypeColorClass(event.type)} hover:opacity-80 transition-opacity`}
                onClick={(e) => handleEventClick(event, e)}
                role="button"
                tabIndex={0}
                aria-label={`Event: ${event.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleEventClick(event, e as any)
                    e.preventDefault()
                  }
                }}
              >
                {event.allDay ? "All day: " : ""}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  // Show all events for this day
                  setSelectedDate(date)
                  const firstEvent = dayEvents[0]
                  if (firstEvent) {
                    setSelectedEvent(firstEvent)
                    setIsViewEventDialogOpen(true)
                  }
                }}
              >
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>,
      )
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center font-medium text-sm border-b text-foreground bg-card">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }, [currentYear, currentMonth, today, getEventsForDate, getEventTypeColorClass, handleDayClick, handleEventClick])

  // Event type options for select
  const eventTypeOptions = EVENT_TYPES.map((type) => (
    <option key={type.value} value={type.value}>
      {type.label}
    </option>
  ))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and upcoming events</p>
        </div>
        <Button onClick={handleAddNewEventClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Card className="bg-card">
        <CardHeader className="pb-2 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={navigatePrevious} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={navigateToday} aria-label="Go to today">
                Today
              </Button>
              <h2 className="text-xl font-bold ml-4 text-foreground">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  id="filter-button"
                  ref={filterButtonRef}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  aria-expanded={filterMenuOpen}
                  aria-controls="filter-menu"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Filter
                  {filteredTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {filteredTypes.length}
                    </Badge>
                  )}
                </Button>
                {filterMenuOpen && (
                  <div
                    id="filter-menu"
                    ref={filterMenuRef}
                    className="absolute right-0 top-full mt-1 z-10 w-56 p-3 bg-card rounded-md shadow-md border border-border"
                    role="menu"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Event Types</h3>
                      <div className="space-y-2">
                        {EVENT_TYPES.map((type) => (
                          <div key={type.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`filter-${type.value}`}
                              checked={filteredTypes.includes(type.value)}
                              onChange={() => toggleFilterType(type.value)}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`filter-${type.value}`}
                              className="text-sm flex items-center text-foreground cursor-pointer"
                            >
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${type.colorClass.split(" ")[0]} mr-2`}
                              ></span>
                              {type.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      {filteredTypes.length > 0 && (
                        <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setFilteredTypes([])}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-card">
          <div className="h-auto">{monthView}</div>
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Event</DialogTitle>
            <DialogDescription>Create a new event on your calendar.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddEvent()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newEvent.title || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                  className="text-foreground"
                  required
                  autoFocus
                />
              </div>

              {/* Date and Time Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-foreground">
                    Date
                  </Label>
                  <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md border-input bg-background">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <div className="text-foreground">
                      {newEvent.date ? format(newEvent.date, "MMMM d, yyyy") : "Select a date"}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-foreground">Time</Label>
                  <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md border-input bg-background">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <div className="flex items-center gap-1">
                      <div className="inline-flex items-center">
                        <select
                          value={timeState.hour}
                          onChange={(e) => setTimeState((prev) => ({ ...prev, hour: e.target.value }))}
                          disabled={newEvent.allDay}
                          className="w-12 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-foreground"
                        >
                          {HOURS.map((hour) => (
                            <option key={hour} value={String(hour)}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="text-foreground mx-1">:</span>
                        <select
                          value={timeState.minute}
                          onChange={(e) => setTimeState((prev) => ({ ...prev, minute: e.target.value }))}
                          disabled={newEvent.allDay}
                          className="w-12 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-foreground"
                        >
                          {MINUTES.map((minute) => (
                            <option key={minute} value={String(minute).padStart(2, "0")}>
                              {String(minute).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <select
                          value={timeState.period}
                          onChange={(e) => setTimeState((prev) => ({ ...prev, period: e.target.value }))}
                          disabled={newEvent.allDay}
                          className="w-16 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-foreground"
                        >
                          {PERIODS.map((period) => (
                            <option key={period} value={period}>
                              {period}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay || false}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, allDay: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <Label htmlFor="allDay" className="text-foreground">
                  All day event
                </Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-foreground">
                  Event Type
                </Label>
                <select
                  id="type"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, type: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {eventTypeOptions}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-foreground">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                  className="text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-foreground">
                  Location (optional)
                </Label>
                <Input
                  id="location"
                  value={newEvent.location || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                  className="text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEventDialogOpen(false)}
                className="text-foreground"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">{selectedEvent.title}</DialogTitle>
              <Badge variant="outline" className={`self-start ${getEventTypeColorClass(selectedEvent.type)}`}>
                {getEventTypeLabel(selectedEvent.type)}
              </Badge>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">{formatDate(selectedEvent.date)}</div>
                  {!selectedEvent.allDay && (
                    <div className="text-sm text-muted-foreground">
                      {formatTime(selectedEvent.date)} -{" "}
                      {selectedEvent.endDate ? formatTime(selectedEvent.endDate) : "TBD"}
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-foreground">{selectedEvent.location}</div>
                </div>
              )}

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-foreground">{selectedEvent.attendees.join(", ")}</div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-1 text-foreground">Description</h3>
                  <p className="text-sm text-foreground">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewEventDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={openEditEventDialog} disabled={isSubmitting}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent} disabled={isSubmitting}>
                {isSubmitting ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Event</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEditEvent()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={newEvent.title || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                  className="text-foreground"
                  required
                  autoFocus
                />
              </div>

              {/* Date and Time Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-date" className="text-foreground">
                    Date
                  </Label>
                  <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md border-input bg-background">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      type="date"
                      id="edit-date"
                      value={newEvent.date ? format(newEvent.date, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value)
                          handleDateChange(date)
                        }
                      }}
                      className="text-foreground border-0 p-0 h-auto bg-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-foreground">Time</Label>
                  <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md border-input bg-background">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <div className="flex items-center gap-1">
                      <div className="inline-flex items-center">
                        <select
                          value={timeState.hour}
                          onChange={(e) => setTimeState((prev) => ({ ...prev, hour: e.target.value }))}
                          disabled={newEvent.allDay}
                          className="w-12 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-foreground"
                        >
                          {HOURS.map((hour) => (
                            <option key={hour} value={String(hour)}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="text-foreground mx-1">:</span>
                        <select
                          value={timeState.minute}
                          onChange={(e) => setTimeState((prev) => ({ ...prev, minute: e.target.value }))}
                          disabled={newEvent.allDay}
                          className="w-12 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-foreground"
                        >
                          {MINUTES.map((minute) => (
                            <option key={minute} value={String(minute).padStart(2, "0")}>
                              {String(minute).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <select
                          value={timeState.period}
                          onChange={(e) => setTimeState((prev) => ({ ...prev, period: e.target.value }))}
                          disabled={newEvent.allDay}
                          className="w-16 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-foreground"
                        >
                          {PERIODS.map((period) => (
                            <option key={period} value={period}>
                              {period}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-allDay"
                  checked={newEvent.allDay || false}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, allDay: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-allDay" className="text-foreground">
                  All day event
                </Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type" className="text-foreground">
                  Event Type
                </Label>
                <select
                  id="edit-type"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, type: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {eventTypeOptions}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-foreground">
                  Description (optional)
                </Label>
                <Textarea
                  id="edit-description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                  className="text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location" className="text-foreground">
                  Location (optional)
                </Label>
                <Input
                  id="edit-location"
                  value={newEvent.location || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                  className="text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditEventDialogOpen(false)}
                className="text-foreground"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
