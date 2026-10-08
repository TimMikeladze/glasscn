"use client"

import { toast } from "sonner"

import { Button } from "@/components/glass/button"

export default function ToasterDemo() {
  return (
    <div className="flex gap-3">
      <Button onClick={() => toast.success("Tonight is sealed", { description: "Day 401 · a 3-night chain" })}>Seal tonight</Button>
      <Button variant="glass" onClick={() => toast("Copied as text")}>
        Copy
      </Button>
    </div>
  )
}
