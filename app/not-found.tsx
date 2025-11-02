import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <Building className="h-16 w-16 mb-4 text-primary" />
      <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
