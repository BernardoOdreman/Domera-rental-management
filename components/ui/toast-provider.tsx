"use client"

import type React from "react"

import { createContext, useContext, useCallback } from "react"
import { Toaster, toast as sonnerToast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    switch (type) {
      case "success":
        sonnerToast.success(message, { duration })
        break
      case "error":
        sonnerToast.error(message, { duration })
        break
      case "warning":
        sonnerToast.warning(message, { duration })
        break
      default:
        sonnerToast(message, { duration })
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          classNames: {
            toast: "group border border-border bg-background text-foreground",
            title: "text-foreground",
            description: "text-muted-foreground",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-muted text-muted-foreground",
            closeButton: "text-foreground/50 hover:text-foreground",
          },
        }}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
