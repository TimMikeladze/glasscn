import { Sparkline } from "@/components/glass/sparkline"

const sleep = [7.5, 6.8, 7.9, 8.2, 6.5, null, 7.1, 7.8, 8.4, 7.2, 6.9, 7.6, 8.1, 7.4]

export default function SparklineDemo() {
  return (
    <div className="grid w-full max-w-md gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Sleep</span>
        <span className="text-sm text-muted-foreground">avg 7.5</span>
      </div>
      <div className="font-glass-heading text-3xl font-bold tabular-nums">
        7.4 <span className="text-base font-medium text-muted-foreground">hours</span>
      </div>
      <Sparkline data={sleep} height={80} />
    </div>
  )
}
