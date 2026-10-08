import { Aurora } from "@/components/glass/aurora"

export default function AuroraDemo() {
  return (
    <div className="relative isolate h-56 w-full overflow-hidden rounded-3xl">
      <Aurora className="absolute" />
      <div className="flex h-full items-center justify-center text-sm font-medium text-foreground/70">Three blobs, drifting slowly.</div>
    </div>
  )
}
