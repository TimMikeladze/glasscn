import { ScrollArea } from "@/components/glass/scroll-area"
import { Separator } from "@/components/glass/separator"

const days = Array.from({ length: 30 }, (_, i) => `October ${30 - i}`)

export default function ScrollAreaDemo() {
  return (
    <ScrollArea edges className="h-64 w-56 rounded-surface-sm bg-fill" aria-label="Entries">
      <div className="p-4">
        <h4 className="mb-3 text-sm font-medium">Entries</h4>
        {days.map((day) => (
          <div key={day}>
            <div className="py-2 text-sm">{day}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
