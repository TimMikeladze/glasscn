import { Kbd, KbdGroup } from "@/components/glass/kbd"

export default function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        Write tonight <Kbd>N</Kbd>
      </div>
      <div className="flex items-center gap-2">
        Seal <KbdGroup><Kbd>⌘</Kbd><Kbd>↵</Kbd></KbdGroup>
      </div>
    </div>
  )
}
