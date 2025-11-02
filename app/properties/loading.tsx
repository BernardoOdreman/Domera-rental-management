import { SkeletonCard } from "@/components/ui/skeleton-card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 mt-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} hasImage={true} contentCount={4} />
        ))}
      </div>
    </div>
  )
}
