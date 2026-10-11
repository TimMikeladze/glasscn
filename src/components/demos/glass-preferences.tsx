import { Glass } from "@/components/glass/glass"
import { GlassPreferences } from "@/components/glass/glass-preferences"

export default function GlassPreferencesDemo() {
  return (
    <Glass intensity="strong" className="grid w-full max-w-xs gap-4 p-5">
      <div className="grid gap-1">
        <h3 className="type-glass-heading text-base">Glass</h3>
        <p className="text-sm text-muted-foreground">Drag towards Clear and every pane on the page lets more through.</p>
      </div>
      <GlassPreferences />
    </Glass>
  )
}
