"use client"

import { useState, useMemo, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  CreditCard,
  FileText,
  Home,
  PenToolIcon as Tool,
  Settings,
  Users,
  Bell,
  Code,
  Building,
  FileSignature,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { usePropertyContext } from "@/context/property-context"
import { useTheme } from "@/context/theme-context"
import { useLandlord } from '@/context/user-context'
import { supabase } from '@/lib/supabase/client';

export function Sidebar() {
  const { landlord } = useLandlord()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, isDarkMode } = useTheme()
  const [user, setUser] = useState({
    name: landlord?.name || '',
    email: landlord?.email || '',
    avatar: "/placeholder-user.jpg",
  })

  // Initialize unreadMessages with a default value
  let unreadMessages = 0
  // Call usePropertyContext unconditionally
  const context = usePropertyContext()

  // Update unreadMessages based on the context value
  if (context) {
    unreadMessages = context.unreadMessages || 0
  } else {
    console.error("PropertyContext not available for Sidebar:")
    // Optionally, set a default value or handle the error appropriately
  }

  // Function to handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // Memoize routes to avoid re-renders
  const routes = useMemo(
    () => [
      { name: "Dashboard", path: "/dashboard", icon: Home },
      { name: "Properties", path: "/properties", icon: Building },
      { name: "Tenants", path: "/tenants", icon: Users },
      { name: "Maintenance", path: "/maintenance", icon: Tool },
      { name: "Lease Generation", path: "/leases", icon: FileSignature },
      { name: "Finances", path: "/finances", icon: CreditCard },
      { name: "Documents", path: "/documents", icon: FileText },
      { name: "Calendar", path: "/calendar", icon: Calendar },
      { name: "Website", path: "/website-creator", icon: Code },
      { name: "Settings", path: "/settings", icon: Settings },
      { name: "Logout", action: handleLogout, icon: LogOut },
    ],
    [],
  )

  // Special styling for white/black theme
  const isSpecialTheme = theme === "white" || theme === "black"

  // Handle mobile sidebar
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Add a useEffect to close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const sidebar = document.querySelector(".sidebar")
      if (sidebar && !sidebar.contains(target) && window.innerWidth < 768 && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileOpen])

  // Listen for custom events from topbar menu button
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsMobileOpen((prev) => !prev)
    }

    window.addEventListener("toggle-sidebar", handleToggleSidebar)
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggleSidebar)
    }
  }, [])

  if (!landlord) {
    return null;
  }

  return (
    <>
    <aside
    className={cn(
      "sidebar fixed left-0 top-16 bottom-0 w-[220px] z-20 rounded-tr-xl rounded-br-xl transition-transform duration-300 bg-background",
      "md:translate-x-0",
      isMobileOpen ? "translate-x-0" : "-translate-x-full",
    )}
    >
    <div className="flex flex-col h-full">
    <nav className="flex-1 p-4">
    {routes.map((route) => {
      const isActive = pathname === route.path

      // Render logout button
      if ("action" in route) {
        return (
          <button
          key={route.name}
          onClick={route.action}
          className={cn(
            "sidebar-item w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] transition-colors mb-1",
            "text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer"
          )}
          >
          <route.icon className="h-[18px] w-[18px]" />
          {route.name}
          </button>
        )
      }

      // Render normal route link
      return (
        <Link
        key={route.path}
        href={route.path}
        className={cn(
          "sidebar-item flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] transition-colors mb-1",
          isActive
          ? isSpecialTheme
          ? "bg-primary/10"
          : "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
          isActive && "active",
        )}
        >
        {route.icon === Image ? (
          <div className="relative h-4 w-6 flex-shrink-0">
          <Image src={route.imgSrc || ""} alt={route.name} fill className="object-contain" />
          </div>
        ) : (
          <route.icon className={cn("h-[18px] w-[18px]", isActive && !isSpecialTheme && "text-primary")} />
        )}
        {route.name}
        </Link>
      )
    })}
    </nav>

    <div className="p-4 mt-auto">
    <div className="flex items-center gap-2.5 bg-card/50 rounded-lg p-3 shadow-md border border-border/5">
    <Avatar className="h-9 w-9">
    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
    <p className="text-[15px] font-medium truncate text-black dark:text-white">{user.name}</p>
    <p className="text-[13px] text-muted-foreground truncate">{user.email}</p>
    </div>
    <div className="relative">
    <Bell className="h-4 w-4 text-muted-foreground" />
    {unreadMessages > 0 && (
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-medium text-primary-foreground">
      {unreadMessages}
      </span>
    )}
    </div>
    </div>
    </div>
    </div>
    </aside>
    </>
  )
}
