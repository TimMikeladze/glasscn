import { Separator } from "@/components/glass/separator"

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-xs text-sm">
      <div className="font-medium">glasscn</div>
      <div className="text-muted-foreground">Glass components for shadcn.</div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Themes</span>
        <Separator orientation="vertical" />
        <span>Native</span>
      </div>
    </div>
  )
}
