"use client"

import { useState } from "react"
import { Bell, Search, MessageSquare, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePropertyContext } from "@/context/property-context"
import { useTheme } from "@/context/theme-context"
import Link from "next/link"
import {useLandlord} from '@/context/user-context'


export function TopBar() {
  const { landlord } = useLandlord()
  let unreadMessages = 0
  const context = usePropertyContext()
  if (context) {
    unreadMessages = context.unreadMessages
  } else {
    console.error("PropertyContext not available for TopBar:")
  }

  const { isDarkMode } = useTheme()

  // Add state to control chat visibility
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Function to toggle chat visibility
  const toggleChat = () => {
    // Dispatch a custom event that the ChatBot component will listen for
    const event = new CustomEvent("toggle-chat", { detail: { open: !isChatOpen } })
    window.dispatchEvent(event)
    setIsChatOpen(!isChatOpen)
  }

  // Function to toggle sidebar on mobile
  const toggleSidebar = () => {
    const event = new CustomEvent("toggle-sidebar")
    window.dispatchEvent(event)
  }

  // Debounce search function
  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timer)
      setIsSearching(true)
      timer = setTimeout(() => {
        func(...args)
        setIsSearching(false)
      }, delay)
    }
  }

  // Simulate search function (replace with actual implementation)
  const handleSearch = debounce((term: string) => {
    console.log("Searching for:", term)
    // Your actual search implementation here
  }, 500)


  if (!landlord) {
    return null;
  }

  return (
    <>
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/10 bg-background/95 backdrop-blur-sm px-4 top-bar">
      <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex items-center font-semibold">
        <Link href="/dashboard" className="no-underline hover:no-underline">
          <div className={`font-bold tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}>D O M E R A</div>
        </Link>
      </div>

      <div className="flex-1 mx-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-card/50 border-none pl-10 h-10 rounded-full text-base"
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          {unreadMessages > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadMessages}
            </span>
          )}
        </div>

        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={toggleChat}>
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Open Chat</span>
        </Button>
      </div>
    </header>

    </>
  )
}
