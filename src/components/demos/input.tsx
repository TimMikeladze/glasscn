import { SearchIcon } from "lucide-react"

import { Input } from "@/components/glass/input"
import { Label } from "@/components/glass/label"

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="demo-email">Email</Label>
        <Input id="demo-email" type="email" placeholder="you@example.com" />
      </div>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search your nights" className="ps-9" aria-label="Search" />
      </div>
    </div>
  )
}
