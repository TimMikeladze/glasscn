import { Glass } from "@/components/glass/glass"

export default function GlassDemo() {
  return (
    <div className="grid w-full max-w-lg grid-cols-3 gap-3">
      <Glass intensity="subtle" className="flex h-28 items-end p-4 text-sm font-medium">Subtle</Glass>
      <Glass className="flex h-28 items-end p-4 text-sm font-medium">Default</Glass>
      <Glass intensity="strong" className="flex h-28 items-end p-4 text-sm font-medium">Strong</Glass>
      <Glass tint="primary" className="flex h-20 items-end p-4 text-sm font-medium">Tinted</Glass>
      <Glass elevation="flat" className="col-span-2 flex h-20 items-end p-4 text-sm font-medium">Flat — no drop shadow</Glass>
    </div>
  )
}
