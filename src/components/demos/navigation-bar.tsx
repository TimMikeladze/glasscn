import { ChevronLeftIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { NavigationBar, NavigationBarLeading, NavigationBarTrailing } from "@/components/glass/navigation-bar"

const days = Array.from({ length: 16 }, (_, i) => `Day ${401 - i}`)

export default function NavigationBarDemo() {
  return (
    <div className="h-[26rem] w-full max-w-md overflow-y-auto overscroll-contain rounded-surface" tabIndex={0} aria-label="Journal">
      <NavigationBar title="Journal" subtitle="401 nights">
        <NavigationBarLeading>
          <Button variant="glass" size="icon" aria-label="Back">
            <ChevronLeftIcon className="rtl:-scale-x-100" />
          </Button>
        </NavigationBarLeading>
        <NavigationBarTrailing>
          <Button variant="glass" size="icon" aria-label="New entry">
            <PlusIcon />
          </Button>
        </NavigationBarTrailing>
      </NavigationBar>
      <ul className="grid gap-2 px-4 pb-6">
        {days.map((d) => (
          <li key={d} className="rounded-control bg-fill px-pad py-3 text-sm">
            {d}
          </li>
        ))}
      </ul>
    </div>
  )
}
