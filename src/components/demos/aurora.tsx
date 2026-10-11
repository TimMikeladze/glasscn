import { Aurora } from "@/components/glass/aurora"

export default function AuroraDemo() {
  return (
    <div className="relative isolate h-56 w-full overflow-hidden rounded-3xl">
      <Aurora className="absolute" />
      <div className="flex h-full items-center justify-center">
        <span className="glass rounded-button px-pad-sm py-1.5 text-sm font-medium">Three blobs, drifting slowly.</span>
      </div>
    </div>
  )
}
