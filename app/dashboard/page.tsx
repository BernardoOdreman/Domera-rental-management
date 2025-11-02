"use client"

import { PropertyProvider } from "@/context/property-context"
import Dashboard from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <PropertyProvider>
      <Dashboard />
    </PropertyProvider>
  )
}
