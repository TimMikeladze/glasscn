import { Slider } from "@/components/glass/slider"

export default function SliderDemo() {
  return (
    <div className="grid w-full max-w-sm gap-8">
      <Slider defaultValue={[28]} max={48} aria-label="Frost" />
      <Slider defaultValue={[20, 70]} aria-label="Range" />
    </div>
  )
}
