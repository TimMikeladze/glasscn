import { Button } from "@/components/glass/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"
import { ProgressRing } from "@/components/glass/progress-ring"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="glass">This week</Button>
      </PopoverTrigger>
      <PopoverContent className="flex-row items-center gap-4">
        <ProgressRing value={5 / 7} size={56}>
          5/7
        </ProgressRing>
        <div>
          <div className="font-semibold">Five nights written</div>
          <div className="text-muted-foreground">Two more for a perfect week.</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
