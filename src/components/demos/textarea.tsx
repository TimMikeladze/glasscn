import { Label } from "@/components/glass/label"
import { Textarea } from "@/components/glass/textarea"

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="demo-note">What was the most significant thing that happened today?</Label>
      <Textarea id="demo-note" placeholder="Usually something small. A detail, a mistake you noticed…" />
    </div>
  )
}
