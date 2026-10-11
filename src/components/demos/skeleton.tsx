import { Skeleton } from "@/components/glass/skeleton"

export default function SkeletonDemo() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading entries" className="grid w-full max-w-sm gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
      <Skeleton className="h-24 w-full rounded-surface-sm" />
    </div>
  )
}
