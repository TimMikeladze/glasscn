import { Label } from "@/components/glass/label"
import { Switch } from "@/components/glass/switch"

export default function SwitchDemo() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-8">
        <Label htmlFor="s1">Evening reminder</Label>
        <Switch id="s1" defaultChecked />
      </div>
      <div className="flex items-center justify-between gap-8">
        <Label htmlFor="s2">Rest days keep the chain</Label>
        <Switch id="s2" />
      </div>
      <div className="flex items-center justify-between gap-8">
        <Label htmlFor="s3">Small</Label>
        <Switch id="s3" size="sm" defaultChecked />
      </div>
    </div>
  )
}
