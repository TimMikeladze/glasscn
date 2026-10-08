import { Gauge } from "@/components/glass/gauge"

export default function GaugeDemo() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      <Gauge value={78} target={70} label="Recovery">
        <span className="type-glass-display text-4xl">78</span>
        <span className="text-sm text-muted-foreground">Recovery</span>
      </Gauge>
      <Gauge value={5.2} min={0} max={8} size={120} color="var(--chart-2)" label="Sleep">
        <span className="type-glass-display text-2xl">5.2h</span>
        <span className="text-xs text-muted-foreground">of 8h</span>
      </Gauge>
    </div>
  )
}
