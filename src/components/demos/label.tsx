import { Label } from "@/components/glass/label"
import { Switch } from "@/components/glass/switch"

export default function LabelDemo() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="demo-label-switch" defaultChecked />
      <Label htmlFor="demo-label-switch">Ask about yesterday’s promise</Label>
    </div>
  )
}
