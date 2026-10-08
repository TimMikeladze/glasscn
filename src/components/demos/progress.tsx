import { Progress } from "@/components/glass/progress"

export default function ProgressDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <div className="flex justify-between text-sm">
        <span>Year 2 of 5</span>
        <span className="text-muted-foreground tabular-nums">22%</span>
      </div>
      <Progress value={22} aria-label="Horizon" />
    </div>
  )
}
