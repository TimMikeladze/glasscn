import * as React from "react"
import { View } from "react-native"
import { Circle, Line } from "react-native-svg"
import { BookOpen, Check, Flame, Globe, Moon } from "lucide-react-native"

import { ActivityRings } from "@/components/glass/native/activity-rings"
import { AreaChart } from "@/components/glass/native/area-chart"
import { BarChart } from "@/components/glass/native/bar-chart"
import { BarList } from "@/components/glass/native/bar-list"
import { CategoryBar } from "@/components/glass/native/category-bar"
import { ChartContainer, ChartLegend, chartColor, nearest } from "@/components/glass/native/chart"
import { DonutChart } from "@/components/glass/native/donut-chart"
import { Gauge } from "@/components/glass/native/gauge"
import { Heatmap, HeatmapLegend } from "@/components/glass/native/heatmap"
import { LineChart } from "@/components/glass/native/line-chart"
import { ProgressRing } from "@/components/glass/native/progress-ring"
import { Sparkline } from "@/components/glass/native/sparkline"
import { Stat, StatIcon, StatLabel, StatTrend, StatValue } from "@/components/glass/native/stat"
import { Tracker } from "@/components/glass/native/tracker"
import { GText, useUI } from "@/components/glass/native/ui"
import { addDays, isoDate } from "@/components/glass/native/chart-math"
import { Body, Chip, Section } from "@/sandbox/ui"
import type { Demo } from "@/sandbox/demos/types"

const row = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16 } as const

/** Three values to step through, so the eased transitions show. */
function useCycle<T>(values: T[]) {
  const [i, setI] = React.useState(0)
  return [values[i], () => setI((i + 1) % values.length)] as const
}

function RingsDemo() {
  const [rings, next] = useCycle([
    [{ value: 0.82, label: "Move" }, { value: 0.56, label: "Exercise" }, { value: 1.3, label: "Stand" }],
    [{ value: 0.3, label: "Move" }, { value: 0.9, label: "Exercise" }, { value: 0.6, label: "Stand" }],
    [{ value: 1.6, label: "Move" }, { value: 1.1, label: "Exercise" }, { value: 0.2, label: "Stand" }],
  ])
  return (
    <>
      <Section title="Three rings" note="Stand is past 100% — a second lap draws over the first.">
        <View style={row}>
          <ActivityRings rings={rings} />
          <Chip label="Next values" onPress={next} />
        </View>
      </Section>
      <Section title="Sizes, stroke, gap, colours">
        <View style={row}>
          <ActivityRings rings={[{ value: 0.7 }]} size={64} stroke={8} />
          <ActivityRings rings={[{ value: 0.4, color: "#2F86C9" }, { value: 0.9, color: "#2E9E73" }]} size={96} stroke={10} gap={6} />
          <ActivityRings rings={[{ value: 0 }, { value: 0.001 }, { value: 2.4 }]} size={120} stroke={12} accessibilityLabel="Edge cases: empty, near-empty, two laps" />
        </View>
      </Section>
    </>
  )
}

function ProgressDemo() {
  const [value, next] = useCycle([0.62, 0.15, 1, 0])
  const ui = useUI()
  return (
    <>
      <Section title="Value" note="Tap to step through 62%, 15%, 100%, 0%.">
        <View style={row}>
          <ProgressRing value={value}>{`${Math.round(value * 100)}`}</ProgressRing>
          <Chip label="Next" onPress={next} />
        </View>
      </Section>
      <Section title="Size, stroke, colour, custom content">
        <View style={row}>
          <ProgressRing value={0.4} size={40} />
          <ProgressRing value={0.75} size={120} stroke={14} color={ui.charts[3]}>
            75%
          </ProgressRing>
          <ProgressRing value={0.9} size={96} color={ui.charts[1]}>
            <Moon size={28} color={ui.charts[1]} />
          </ProgressRing>
        </View>
      </Section>
    </>
  )
}

const WEEKS = [6.2, 7.1, 6.8, null, 7.4, 8.0, 7.6, 6.9, 7.8, 8.2, 7.9, 8.4]

function SparklineDemo() {
  const ui = useUI()
  return (
    <>
      <Section title="Default" note="Area, dot, a null gap at week 4.">
        <Sparkline data={WEEKS} />
      </Section>
      <Section title="No area, no dot, colour, height">
        <Sparkline data={WEEKS} area={false} dot={false} color={ui.charts[1]} height={40} />
      </Section>
      <Section title="Too few points">
        <Sparkline data={[3]} height={40} />
      </Section>
    </>
  )
}

function StatDemo() {
  const ui = useUI()
  return (
    <>
      <Section title="Tiles">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Stat style={{ flex: 1 }}>
            <StatIcon color={ui.primary}>
              <Flame />
            </StatIcon>
            <StatValue tone="primary">12</StatValue>
            <StatLabel>Chain</StatLabel>
          </Stat>
          <Stat style={{ flex: 1 }}>
            <StatIcon>
              <BookOpen />
            </StatIcon>
            <StatValue>311</StatValue>
            <StatLabel>Nights</StatLabel>
            <StatTrend>12%</StatTrend>
          </Stat>
          <Stat style={{ flex: 1 }}>
            <StatIcon>
              <Check />
            </StatIcon>
            <StatValue>71%</StatValue>
            <StatLabel>Kept</StatLabel>
            <StatTrend direction="down">3%</StatTrend>
          </Stat>
        </View>
      </Section>
      <Section title="Tint and elevation">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Stat tint="primary" style={{ flex: 1 }}>
            <StatValue>8.2h</StatValue>
            <StatLabel>Tinted primary</StatLabel>
          </Stat>
          <Stat tint="destructive" style={{ flex: 1 }}>
            <StatValue>2</StatValue>
            <StatLabel>Tinted destructive</StatLabel>
          </Stat>
          <Stat elevation="flat" style={{ flex: 1 }}>
            <StatValue>44</StatValue>
            <StatLabel>Flat</StatLabel>
          </Stat>
        </View>
      </Section>
    </>
  )
}

function BarListDemo() {
  const ui = useUI()
  const [picked, setPicked] = React.useState<string | null>(null)
  const sources = [
    { name: "Journal", value: 412 },
    { name: "Gratitude", value: 288 },
    { name: "Reading", value: 164 },
    { name: "Walks", value: 92 },
    { name: "Nothing logged", value: 0 },
  ]
  return (
    <>
      <Section title="Static">
        <BarList data={sources} />
      </Section>
      <Section title="onSelect, icons, valueFormat, colour" note={picked ? `Picked ${picked}` : "Tap a row."}>
        <BarList
          data={sources.slice(0, 3).map((s) => ({ ...s, icon: <BookOpen size={16} color={ui.mutedForeground} /> }))}
          valueFormat={(v) => `${v} min`}
          color={ui.charts[1]}
          onSelect={(item) => setPicked(String(item.name))}
        />
      </Section>
      <Section title="Links and max" note="Widths are shares of max=1000.">
        <BarList data={[{ name: "expo.dev", value: 640, href: "https://expo.dev", icon: <Globe size={16} color={ui.mutedForeground} /> }, { name: "reactnative.dev", value: 310, href: "https://reactnative.dev" }]} max={1000} />
      </Section>
    </>
  )
}

function GaugeDemo() {
  const ui = useUI()
  const [value, next] = useCycle([72, 35, 100, 0])
  return (
    <>
      <Section title="Value and target" note="Tap Next to glide to a new value.">
        <View style={row}>
          <Gauge value={value} target={80} label="Recovery">
            <GText font="display" size="2xl">
              {value}
            </GText>
            <GText size="xs" tone="muted">
              Recovery
            </GText>
          </Gauge>
          <Chip label="Next" onPress={next} />
        </View>
      </Section>
      <Section title="Range, size, stroke, colour">
        <View style={row}>
          <Gauge value={6.5} min={4} max={10} size={110} stroke={8} color={ui.charts[1]} label="Sleep">
            <GText font="display" size="lg">
              6.5h
            </GText>
          </Gauge>
          <Gauge value={3} max={10} size={80} color={ui.charts[3]} label="Load" />
        </View>
      </Section>
    </>
  )
}

const STATUSES = ["done", "done", "partial", "done", "missed", "done", "rest", "done", "done", "partial", "done", "done", "missed", "done", "done", "done", "rest", "done", "partial", "done", "done", "done", "done", "missed", "done", "done", "done", "partial", "done", "done"]

function TrackerDemo() {
  const ui = useUI()
  const [picked, setPicked] = React.useState<string | null>(null)
  const data = STATUSES.map((status, i) => ({ title: `Day ${i + 1}: ${status}`, status }))
  return (
    <>
      <Section title="Default colours" note={picked ?? "Tap a block."}>
        <Tracker data={data} onSelect={(b) => setPicked(b.title)} />
      </Section>
      <Section title="Custom colours, unknown status">
        <Tracker data={[...data.slice(0, 20), { title: "Unknown", status: "??" }]} colors={{ done: ui.charts[3], partial: ui.charts[1], missed: ui.destructive, rest: ui.fill }} />
      </Section>
    </>
  )
}

function CategoryBarDemo() {
  const ui = useUI()
  const [marker, next] = useCycle([62, 20, 95])
  return (
    <>
      <Section title="With marker" note="Tap Next to move the marker between bands.">
        <CategoryBar values={[50, 20, 30]} marker={marker} markerLabel={`Score ${marker}`} />
        <Chip label="Next" onPress={next} />
      </Section>
      <Section title="No marker, five bands">
        <CategoryBar values={[10, 25, 30, 20, 15]} />
      </Section>
      <Section title="Custom colours, no labels">
        <CategoryBar values={[40, 40, 20]} colors={[ui.success, ui.charts[1], ui.destructive]} labels={false} marker={85} />
      </Section>
    </>
  )
}

function makeValues(today: string, days: number) {
  const out: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const v = Math.round(Math.abs(Math.sin(i * 1.7) * 6 + Math.cos(i * 0.3) * 3))
    if (v > 1) out[addDays(today, -i)] = v
  }
  return out
}

function HeatmapDemo() {
  const today = isoDate(new Date())
  const values = React.useMemo(() => makeValues(today, 200), [today])
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <>
      <Section title="26 weeks, Monday start">
        <Heatmap values={values} />
        <HeatmapLegend />
      </Section>
      <Section title="Selectable, Sunday start, 12 weeks, big cells" note={picked ? `Picked ${picked}` : "Tap a day."}>
        <Heatmap values={values} weeks={12} weekStart={0} cellSize={22} onSelect={setPicked} />
      </Section>
      <Section title="Fixed max, custom title, legend labels">
        <Heatmap values={values} weeks={8} max={20} formatTitle={(c) => `${c.date}: ${c.value}`} />
        <HeatmapLegend less="Quiet" more="Busy" />
      </Section>
    </>
  )
}

interface Night {
  date: string
  hours: number
  mood: number
  workout: boolean
}
const logged: [number, number, boolean][] = [
  [5.8, 4, false], [6.2, 5, true], [6.9, 6, false], [7.4, 7, true], [7.1, 6, false], [8.0, 8, true], [6.5, 5, false],
  [7.8, 8, true], [8.3, 8, true], [5.5, 3, false], [7.0, 7, true], [7.6, 7, false], [6.8, 6, true], [8.1, 9, true],
]
const nights: Night[] = logged.map(([hours, mood, workout], i) => ({ date: `Sep ${17 + i}`, hours, mood, workout }))

function ChartDemo() {
  const ui = useUI()
  const color = (d: Night) => chartColor(d.workout ? 0 : 1, ui)
  return (
    <>
      <Section title="Custom chart on the host" note="A scatter drawn through ChartContainer's render; press a dot for its row.">
        <ChartContainer
          ariaLabel="Hours slept against next-day mood for 14 nights, coloured by whether it was a workout day"
          height={260}
          x={{ values: nights.map((d) => d.hours), nice: true, grid: true, format: ((v: number) => `${v}h`) as never }}
          y={{ values: nights.map((d) => d.mood), nice: true, grid: true }}
          grow="none"
          render={(f) =>
            nights.map((d, i) => (
              <React.Fragment key={d.date}>
                {f.focused === i ? <Line x1={f.x.map(d.hours)} x2={f.x.map(d.hours)} y1={f.plot.top} y2={f.plot.bottom} stroke={ui.mutedForeground} strokeOpacity={0.4} /> : null}
                <Circle cx={f.x.map(d.hours)} cy={f.y.map(d.mood)} r={f.focused === i ? 7 : 5} fill={color(d)} />
              </React.Fragment>
            ))
          }
          hit={(p, f) => {
            const i = nearest(
              nights.map((d) => Math.hypot(f.x.map(d.hours) - p.x, f.y.map(d.mood) - p.y)),
              0
            )
            return i
          }}
          tooltip={(i, f) => ({
            content: { title: nights[i].date, rows: [{ label: nights[i].workout ? "Workout day" : "Rest day", value: `${nights[i].hours}h · mood ${nights[i].mood}/10`, color: color(nights[i]) }] },
            anchor: { x: f.x.map(nights[i].hours), y: f.y.map(nights[i].mood) },
          })}
        />
        <ChartLegend items={[{ label: "Workout day", color: chartColor(0, ui) }, { label: "Rest day", color: chartColor(1, ui) }]} />
      </Section>
      <Section title="No axes, not animated">
        <ChartContainer ariaLabel="A static diagonal" height={80} animate={false} render={(f) => <Line x1={8} y1={f.height - 8} x2={f.width - 8} y2={8} stroke={ui.primary} strokeWidth={2} />} />
      </Section>
    </>
  )
}

interface Stage {
  night: string
  deep: number
  rem: number
  light: number | null
}
const stagesData: Stage[] = [
  { night: "Sep 29", deep: 1.2, rem: 1.6, light: 3.9 },
  { night: "Sep 30", deep: 1.0, rem: 1.4, light: 3.6 },
  { night: "Oct 1", deep: 1.4, rem: 1.8, light: 4.1 },
  { night: "Oct 2", deep: 1.3, rem: 1.9, light: 4.3 },
  { night: "Oct 3", deep: 0.9, rem: 1.2, light: 3.4 },
  { night: "Oct 4", deep: 1.5, rem: 2.0, light: 4.4 },
  { night: "Oct 5", deep: 1.6, rem: 2.1, light: 4.2 },
  { night: "Oct 6", deep: 1.3, rem: 1.7, light: 3.8 },
  { night: "Oct 7", deep: 1.4, rem: 1.9, light: 4.0 },
  { night: "Oct 8", deep: 1.5, rem: 2.0, light: 4.1 },
]
const stages = [
  { id: "deep", label: "Deep", value: (d: Stage) => d.deep },
  { id: "rem", label: "REM", value: (d: Stage) => d.rem },
  { id: "light", label: "Light", value: (d: Stage) => d.light },
]
const fmtH = (h: number) => `${h.toFixed(1)}h`

function AreaDemo() {
  const ui = useUI()
  const dated = stagesData.map((d, i) => ({ ...d, day: new Date(2026, 8, 29 + i) }))
  return (
    <>
      <Section title="Stacked" note="Press and drag: the tooltip reads each layer's own value.">
        <AreaChart data={stagesData} x={(d) => d.night} series={stages} stacked valueFormat={fmtH} ariaLabel="Hours of deep, REM and light sleep per night, stacked" />
      </Section>
      <Section title="Overlapping, linear curve, no grid, one series colour">
        <AreaChart data={stagesData} x={(d) => d.night} series={[stages[0], { ...stages[1], color: ui.charts[4] }]} curve="linear" grid={false} height={180} ariaLabel="Deep and REM sleep per night" />
      </Section>
      <Section title="Time axis, single series (no legend), gap">
        <AreaChart
          data={dated.map((d, i) => (i === 4 ? { ...d, light: null } : d))}
          x={(d) => d.day}
          series={[stages[2]]}
          xFormat={(v) => (v as Date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          valueFormat={fmtH}
          height={180}
          ariaLabel="Light sleep per night, one night missing"
        />
      </Section>
    </>
  )
}

interface Day {
  day: string
  run: number
  strength: number
  yoga: number
}
const week: Day[] = [
  { day: "Mon", run: 32, strength: 0, yoga: 15 },
  { day: "Tue", run: 0, strength: 45, yoga: 0 },
  { day: "Wed", run: 41, strength: 0, yoga: 20 },
  { day: "Thu", run: 0, strength: 40, yoga: 10 },
  { day: "Fri", run: 28, strength: 0, yoga: 0 },
  { day: "Sat", run: 64, strength: 0, yoga: 25 },
  { day: "Sun", run: 0, strength: 0, yoga: 35 },
]
const kinds = [
  { id: "run", label: "Run", value: (d: Day) => d.run },
  { id: "strength", label: "Strength", value: (d: Day) => d.strength },
  { id: "yoga", label: "Yoga", value: (d: Day) => d.yoga },
]
const habits = [
  { habit: "Evening reflection", nights: 26 },
  { habit: "No screens after ten", nights: 18 },
  { habit: "Read before bed", nights: 21 },
  { habit: "Stretch", nights: 9 },
]

function BarDemo() {
  return (
    <>
      <Section title="Stacked">
        <BarChart data={week} x={(d) => d.day} series={kinds} stacked valueFormat={(m) => `${m} min`} ariaLabel="Minutes of running, strength and yoga per day this week, stacked" />
      </Section>
      <Section title="Grouped">
        <BarChart data={week} x={(d) => d.day} series={kinds} height={200} ariaLabel="Minutes of running, strength and yoga per day, side by side" />
      </Section>
      <Section title="Horizontal, single series, no grid">
        <BarChart
          data={habits}
          x={(d) => d.habit}
          series={[{ id: "nights", label: "Nights", value: (d) => d.nights }]}
          layout="horizontal"
          grid={false}
          height={200}
          ariaLabel="Nights each habit was kept this month"
        />
      </Section>
    </>
  )
}

interface Mood {
  week: string
  mood: number | null
  energy: number
}
const moods: Mood[] = [
  { week: "W1", mood: 6.1, energy: 5.4 },
  { week: "W2", mood: 6.4, energy: 5.9 },
  { week: "W3", mood: null, energy: 6.2 },
  { week: "W4", mood: 7.2, energy: 6.0 },
  { week: "W5", mood: 7.0, energy: 6.8 },
  { week: "W6", mood: 7.6, energy: 7.1 },
  { week: "W7", mood: 7.9, energy: 7.4 },
]

function LineDemo() {
  return (
    <>
      <Section title="Two series, gap" note="Mood is missing for W3.">
        <LineChart
          data={moods}
          x={(d) => d.week}
          series={[
            { id: "mood", label: "Mood", value: (d) => d.mood },
            { id: "energy", label: "Energy", value: (d) => d.energy },
          ]}
          valueFormat={(v) => v.toFixed(1)}
          ariaLabel="Weekly mood and energy over seven weeks"
        />
      </Section>
      <Section title="Points, linear curve, no grid, numeric x">
        <LineChart
          data={moods.map((m, i) => ({ ...m, n: i + 1 }))}
          x={(d) => d.n}
          series={[{ id: "energy", label: "Energy", value: (d) => d.energy }]}
          points
          curve="linear"
          grid={false}
          legend
          xFormat={(v) => `Week ${v}`}
          height={180}
          ariaLabel="Weekly energy, numbered weeks"
        />
      </Section>
    </>
  )
}

interface Activity {
  name: string
  minutes: number
}
const activity: Activity[] = [
  { name: "Run", minutes: 165 },
  { name: "Strength", minutes: 85 },
  { name: "Yoga", minutes: 105 },
  { name: "Walk", minutes: 140 },
  { name: "Swim", minutes: 40 },
]
const totalMinutes = activity.reduce((s, a) => s + a.minutes, 0)

function DonutDemo() {
  return (
    <>
      <Section title="With a centre" note="Press a slice.">
        <DonutChart data={activity} label={(d) => d.name} value={(d) => d.minutes} valueFormat={(m) => `${m} min`} ariaLabel={`Active minutes this week by activity, ${totalMinutes} minutes in all`}>
          <GText font="display" size="3xl">
            {totalMinutes}
          </GText>
          <GText size="xs" tone="muted">
            minutes
          </GText>
        </DonutChart>
      </Section>
      <Section title="Thick, small, no legend">
        <DonutChart data={activity.slice(0, 3)} label={(d) => d.name} value={(d) => d.minutes} thickness={0.6} height={140} legend={false} ariaLabel="Run, strength and yoga minutes" />
      </Section>
      <Section title="One slice">
        <DonutChart data={[{ name: "All", minutes: 1 }]} label={(d) => d.name} value={(d) => d.minutes} height={120} ariaLabel="A single full slice">
          100%
        </DonutChart>
      </Section>
      <Body>Slices take the chart palette in order.</Body>
    </>
  )
}

export const demos: Record<string, Demo> = {
  "activity-rings": { title: "Activity rings", render: () => <RingsDemo /> },
  "progress-ring": { title: "Progress ring", render: () => <ProgressDemo /> },
  sparkline: { title: "Sparkline", render: () => <SparklineDemo /> },
  stat: { title: "Stat", render: () => <StatDemo /> },
  "bar-list": { title: "Bar list", render: () => <BarListDemo /> },
  gauge: { title: "Gauge", render: () => <GaugeDemo /> },
  tracker: { title: "Tracker", render: () => <TrackerDemo /> },
  "category-bar": { title: "Category bar", render: () => <CategoryBarDemo /> },
  heatmap: { title: "Heatmap", render: () => <HeatmapDemo /> },
  chart: { title: "Chart", render: () => <ChartDemo /> },
  "area-chart": { title: "Area chart", render: () => <AreaDemo /> },
  "bar-chart": { title: "Bar chart", render: () => <BarDemo /> },
  "line-chart": { title: "Line chart", render: () => <LineDemo /> },
  "donut-chart": { title: "Donut chart", render: () => <DonutDemo /> },
}
