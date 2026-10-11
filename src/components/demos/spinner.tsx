import { Spinner } from "@/components/glass/spinner"
import { Button } from "@/components/glass/button"

export default function SpinnerDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Spinner aria-label="Syncing entries" />
      <Spinner variant="ticks" className="size-6 text-muted-foreground" aria-label="Loading photos" />
      <Spinner className="size-8 text-primary" aria-label="Saving" />
      <Button variant="secondary" loading>
        Sync journal
      </Button>
    </div>
  )
}
