import { CategoryBar } from "@/components/glass/category-bar"

export default function CategoryBarDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Readiness</span>
        <span className="type-glass-display text-2xl">62</span>
      </div>
      <CategoryBar values={[40, 30, 20, 10]} marker={62} markerLabel="Readiness 62" colors={["var(--destructive)", "var(--chart-3)", "var(--chart-4)", "var(--primary)"]} />
      <p className="text-xs text-muted-foreground">Low · Fair · Good · Peak</p>
    </div>
  )
}
