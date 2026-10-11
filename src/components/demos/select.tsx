"use client"

import { Label } from "@/components/glass/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/glass/select"

export default function SelectDemo() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="grid gap-2">
        <Label htmlFor="mood">Mood</Label>
        <Select defaultValue="calm">
          <SelectTrigger id="mood" className="w-48">
            <SelectValue placeholder="How was today?" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Good</SelectLabel>
              <SelectItem value="joyful">Joyful</SelectItem>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="grateful">Grateful</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Hard</SelectLabel>
              <SelectItem value="tired">Tired</SelectItem>
              <SelectItem value="anxious">Anxious</SelectItem>
              <SelectItem value="low" disabled>
                Low (add a note first)
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground" id="sort-label">
          Sort by
        </span>
        <Select defaultValue="newest">
          <SelectTrigger variant="pill" size="sm" aria-labelledby="sort-label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="longest">Longest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
