import type React from "react"
import { ThemeProvider as NextThemeProvider } from "@/components/theme-provider"
import { ThemeProvider } from "@/context/theme-context"
import { PropertyProvider } from "@/context/property-context"
import { TopBar } from "@/components/top-bar"
import { Sidebar } from "@/components/sidebar"
import { ChatBot } from "@/components/chat-bot"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast-provider"
import { LandlordProvider } from '@/context/user-context'

import "@/app/globals.css"

export const metadata = {
  title: "Domera - Landlord Dashboard",
  description: "Manage your properties, tenants, and more",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
    <link rel="icon" href="/KeyBlack.png" type="image/png" sizes="any" />
    </head>
    <body className="bg-background">
    <LandlordProvider>
    <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <ThemeProvider>
    <ToastProvider>
    <PropertyProvider>
    <ErrorBoundary>
    <div className="flex min-h-screen flex-col">
    <TopBar />
    <div className="flex flex-1">
    <Sidebar />
    <main className="flex-1 overflow-auto md:pl-[220px] pt-1">
    <div className="container py-4 px-6 max-w-full">{children}</div>
    </main>
    </div>
    <ChatBot />
    </div>
    </ErrorBoundary>
    </PropertyProvider>
    </ToastProvider>
    </ThemeProvider>
    </NextThemeProvider>
    </LandlordProvider>
    </body>
    </html>
  )
}


import './globals.css'
