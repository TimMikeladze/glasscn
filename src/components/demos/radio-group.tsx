"use client"

import { Label } from "@/components/glass/label"
import { RadioGroup, RadioGroupCard, RadioGroupItem } from "@/components/glass/radio-group"

export default function RadioGroupDemo() {
  return (
    <div className="grid w-full max-w-md gap-8 @lg:grid-cols-2">
      <RadioGroup defaultValue="evening" aria-label="Reminder time">
        {[
          ["morning", "Morning"],
          ["evening", "Evening"],
          ["off", "No reminder"],
        ].map(([value, label]) => (
          <div key={value} className="flex items-center gap-3">
            <RadioGroupItem value={value} id={`time-${value}`} />
            <Label htmlFor={`time-${value}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
      <RadioGroup variant="card" defaultValue="daily" aria-label="Streak goal">
        {[
          ["daily", "Daily", "Write something every day."],
          ["weekdays", "Weekdays", "Weekends off."],
        ].map(([value, title, description]) => (
          <RadioGroupCard key={value}>
            <RadioGroupItem value={value} aria-describedby={`goal-${value}`} className="mt-0.5" />
            <span className="grid gap-0.5 text-sm">
              <span className="font-medium">{title}</span>
              <span id={`goal-${value}`} className="text-muted-foreground">
                {description}
              </span>
            </span>
          </RadioGroupCard>
        ))}
      </RadioGroup>
    </div>
  )
}
