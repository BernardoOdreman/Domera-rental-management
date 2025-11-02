import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface SkeletonCardProps {
  hasImage?: boolean
  headerSize?: "sm" | "md" | "lg"
  contentCount?: number
  hasFooter?: boolean
}

export function SkeletonCard({
  hasImage = false,
  headerSize = "md",
  contentCount = 3,
  hasFooter = true,
}: SkeletonCardProps) {
  // Calculate header height based on size
  const headerHeight = headerSize === "sm" ? "h-14" : headerSize === "lg" ? "h-24" : "h-20"

  return (
    <Card className="overflow-hidden">
      {hasImage && <div className="w-full h-48 bg-muted animate-pulse" />}
      <CardHeader className={`${headerHeight} space-y-2`}>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: contentCount }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </CardContent>
      {hasFooter && (
        <CardFooter className="flex justify-between mt-auto pt-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      )}
    </Card>
  )
}
