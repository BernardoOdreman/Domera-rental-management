"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "amber" | "teal" | "rose" | "blue" | "purple" | "green" | "white" | "black" | "custom"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  customColor: string
  setCustomColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with default values
  const [theme, setTheme] = useState<Theme>("amber")
  const [isDarkMode, setIsDarkMode] = useState(false) // Default to dark mode
  const [customColor, setCustomColor] = useState("#6366f1") // Default indigo color
  const [isInitialized, setIsInitialized] = useState(false)

  // Load theme and mode from localStorage on mount
  useEffect(() => {
    // Check if this is the first time the app is being loaded
    const isFirstVisit = localStorage.getItem("hasVisitedBefore") === null

    if (isFirstVisit) {
      // First visit - set default values
      localStorage.setItem("hasVisitedBefore", "true")
      localStorage.setItem("darkMode", "false") // Default to light mode
      localStorage.setItem("theme", "amber") // Default theme

      // Apply light mode
      document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", "amber")
    } else {
      // Not first visit - load saved preferences
      const savedTheme = localStorage.getItem("theme") as Theme
      const savedMode = localStorage.getItem("darkMode")
      const savedCustomColor = localStorage.getItem("customColor")

      // Apply saved theme
      if (savedTheme) {
        setTheme(savedTheme)
        document.documentElement.setAttribute("data-theme", savedTheme)
      }

      // Apply saved mode
      if (savedMode === "true") {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      } else {
        setIsDarkMode(false)
        document.documentElement.classList.remove("dark")
      }

      // Apply saved custom color
      if (savedCustomColor) {
        setCustomColor(savedCustomColor)
        if (savedTheme === "custom") {
          document.documentElement.style.setProperty("--custom-color", savedCustomColor)
          document.documentElement.style.setProperty(
            "--custom-color-foreground",
            savedMode === "true" ? "#000000" : "#ffffff",
          )
        }
      }
    }

    setIsInitialized(true)
  }, [])

  // Apply theme changes with animation delay for smoother transitions
  useEffect(() => {
    if (!isInitialized) return

    // Set a small timeout to allow for animations to complete
    const applyThemeChanges = () => {
      // Update theme attribute
      document.documentElement.setAttribute("data-theme", theme)

      // Apply custom color if that's the selected theme
      if (theme === "custom") {
        document.documentElement.style.setProperty("--custom-color", customColor)
        document.documentElement.style.setProperty("--custom-color-foreground", isDarkMode ? "#000000" : "#555")
      }
    }

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      applyThemeChanges()
    })
  }, [theme, isDarkMode, customColor, isInitialized])

  const throttle = (func: Function, delay: number) => {
    let lastCall = 0
    return (...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        return func(...args)
      }
    }
  }

  // Handle theme change with automatic switching for black/white
  const handleSetTheme = (newTheme: Theme) => {
    // If switching to black in light mode or white in dark mode, apply the theme
    // Otherwise, if it's black or white, switch to the appropriate one for the current mode
    const finalTheme =
      newTheme === "black" && isDarkMode ? "white" : newTheme === "white" && !isDarkMode ? "black" : newTheme

    setTheme(finalTheme)
    localStorage.setItem("theme", finalTheme)
  }

  // Handle custom color change
  const handleSetCustomColor = (color: string) => {
    setCustomColor(color)
    localStorage.setItem("customColor", color)

    if (theme === "custom") {
      document.documentElement.style.setProperty("--custom-color", color)
      document.documentElement.style.setProperty("--custom-color-foreground", isDarkMode ? "#000000" : "555")
    }
  }

  // Throttled version of setCustomColor to prevent performance issues with color picker
  const throttledSetCustomColor = throttle(handleSetCustomColor, 30)

  // Toggle dark mode with automatic switching for black/white
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode

    // Update dark mode state and localStorage
    setIsDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())

    // Update dark mode class
    if (newDarkMode) {
      document.documentElement.classList.add("dark")

      // If currently using black theme, switch to white for dark mode
      if (theme === "black") {
        const newTheme = "white"
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
      }
    } else {
      document.documentElement.classList.remove("dark")

      // If currently using white theme, switch to black for light mode
      if (theme === "white") {
        const newTheme = "black"
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
      }
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        isDarkMode,
        toggleDarkMode,
        customColor,
        setCustomColor: throttledSetCustomColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
