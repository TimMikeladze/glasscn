import { SunDimIcon, SunIcon } from "lucide-react"

import { Slider } from "@/components/glass/slider"

export default function SliderDemo() {
  return (
    <div className="grid w-full max-w-sm gap-8">
      <Slider defaultValue={[60]} minIcon={<SunDimIcon />} maxIcon={<SunIcon />} aria-label="Brightness" />
      <Slider defaultValue={[28]} max={48} valueBubble={(v) => `${v}px`} aria-label="Frost" />
      <Slider defaultValue={[3]} min={-10} max={10} neutralValue={0} ticks={[-10, -5, 0, 5, 10]} aria-label="Balance" />
      <Slider defaultValue={[2]} max={4} ticks aria-label="Text size" />
      <Slider defaultValue={[20, 70]} aria-label="Range" />
      <Slider variant="progress" defaultValue={[35]} aria-label="Playback position" />
    </div>
  )
}
