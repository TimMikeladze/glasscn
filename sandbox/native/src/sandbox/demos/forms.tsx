import * as React from "react"
import { View } from "react-native"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, CopyIcon, EyeIcon, EyeOffIcon, GridIcon, ItalicIcon, ListIcon, MailIcon, PenIcon, SearchIcon, ShareIcon, TrashIcon, UnderlineIcon, XIcon } from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/glass/native/button-group"
import { Calendar, type DateRange } from "@/components/glass/native/calendar"
import { Checkbox } from "@/components/glass/native/checkbox"
import { DatePicker } from "@/components/glass/native/date-picker"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/glass/native/field"
import { GlassGroup, GlassGroupItem } from "@/components/glass/native/glass-group"
import { Input } from "@/components/glass/native/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/glass/native/input-group"
import { RadioGroup, RadioGroupCard, RadioGroupItem } from "@/components/glass/native/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/glass/native/select"
import { Stepper } from "@/components/glass/native/stepper"
import { Switch } from "@/components/glass/native/switch"
import { Textarea } from "@/components/glass/native/textarea"
import { Toggle } from "@/components/glass/native/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/glass/native/toggle-group"
import { GText } from "@/components/glass/native/ui"
import type { Demo } from "@/sandbox/demos/types"
import { Body, Section } from "@/sandbox/ui"

const row = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 } as const

function SelectDemo() {
  const [fruit, setFruit] = React.useState<string>()
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Section title="Controlled" note={`value = ${fruit ?? "—"} · open = ${open}`}>
        <Select value={fruit} onValueChange={setFruit} open={open} onOpenChange={setOpen}>
          <SelectTrigger accessibilityLabel="Fruit" style={{ width: 200 }}>
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruit</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="pear">Pear</SelectItem>
              <SelectItem value="fig" disabled>
                Fig (out of season)
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </Section>
      <Section title="Pill · sizes · disabled">
        <View style={row}>
          <Select defaultValue="week">
            <SelectTrigger variant="pill" size="sm" accessibilityLabel="Range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="lg">
            <SelectTrigger size="lg" accessibilityLabel="Large">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lg">Large trigger</SelectItem>
            </SelectContent>
          </Select>
          <Select disabled>
            <SelectTrigger accessibilityLabel="Disabled">
              <SelectValue placeholder="Disabled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x">X</SelectItem>
            </SelectContent>
          </Select>
        </View>
      </Section>
    </>
  )
}

function RadioDemo() {
  const [plan, setPlan] = React.useState("monthly")
  return (
    <>
      <Section title="Default" note={`value = ${plan}`}>
        <RadioGroup value={plan} onValueChange={setPlan}>
          {["monthly", "yearly", "lifetime"].map((v) => (
            <View key={v} style={row}>
              <RadioGroupItem value={v} accessibilityLabel={v} />
              <Body>{v}</Body>
            </View>
          ))}
        </RadioGroup>
      </Section>
      <Section title="Card variant">
        <RadioGroup variant="card" defaultValue="a">
          <RadioGroupCard value="a">
            <RadioGroupItem value="a" accessibilityLabel="Starter" />
            <View style={{ flex: 1 }}>
              <GText weight="600">Starter</GText>
              <GText size="sm" tone="muted">
                One journal.
              </GText>
            </View>
          </RadioGroupCard>
          <RadioGroupCard value="b">
            <RadioGroupItem value="b" accessibilityLabel="Pro" />
            <View style={{ flex: 1 }}>
              <GText weight="600">Pro</GText>
              <GText size="sm" tone="muted">
                Unlimited journals.
              </GText>
            </View>
          </RadioGroupCard>
        </RadioGroup>
      </Section>
      <Section title="Disabled">
        <RadioGroup disabled defaultValue="x">
          <RadioGroupItem value="x" accessibilityLabel="x" />
          <RadioGroupItem value="y" accessibilityLabel="y" disabled />
        </RadioGroup>
      </Section>
    </>
  )
}

function FieldDemo() {
  const [email, setEmail] = React.useState("ada@")
  const bad = !/^\S+@\S+\.\S+$/.test(email)
  return (
    <>
      <FieldSet>
        <FieldLegend>Account</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel required>Email</FieldLabel>
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <FieldDescription>Press the label to focus the field.</FieldDescription>
            {bad ? <FieldError>Enter a valid email address.</FieldError> : null}
          </Field>
          <Field invalid>
            <FieldLabel>Bio</FieldLabel>
            <Textarea defaultValue="Too short" />
            <FieldError errors={[{ message: "At least 20 characters." }, { message: "At least 20 characters." }]} />
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Weekly digest</FieldTitle>
              <FieldDescription>A summary every Sunday.</FieldDescription>
            </FieldContent>
            <Switch defaultChecked accessibilityLabel="Weekly digest" />
          </Field>
          <Field orientation="horizontal">
            <Checkbox defaultChecked accessibilityLabel="Accept terms" />
            <FieldLabel optional>Accept terms</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldLegend variant="label">Legend as label</FieldLegend>
      <FieldSeparator />
    </>
  )
}

function InputGroupDemo() {
  const [q, setQ] = React.useState("")
  const [show, setShow] = React.useState(false)
  return (
    <>
      <Section title="Icon · clear">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon size={16} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search" value={q} onChangeText={setQ} accessibilityLabel="Search" />
          {q ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton accessibilityLabel="Clear" onPress={() => setQ("")}>
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </Section>
      <Section title="Reveal · unit · invalid">
        <InputGroup>
          <InputGroupInput placeholder="Password" secureTextEntry={!show} accessibilityLabel="Password" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton accessibilityLabel={show ? "Hide" : "Show"} onPress={() => setShow(!show)}>
              {show ? <EyeOffIcon /> : <EyeIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="0" keyboardType="numeric" accessibilityLabel="Weight" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>kg</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <MailIcon size={16} />
          </InputGroupAddon>
          <InputGroupInput invalid defaultValue="nope" accessibilityLabel="Email" />
        </InputGroup>
      </Section>
      <Section title="Textarea · block addon · submit">
        <InputGroup>
          <InputGroupTextarea placeholder="Ask anything" accessibilityLabel="Message" />
          <InputGroupAddon align="block-end" style={{ justifyContent: "space-between" }}>
            <InputGroupText>0 / 280</InputGroupText>
            <InputGroupButton variant="default" size="sm">
              Send
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Section>
    </>
  )
}

function ButtonGroupDemo() {
  return (
    <>
      <Section title="Joined">
        <ButtonGroup>
          <Button variant="secondary">Day</Button>
          <Button variant="secondary">Week</Button>
          <Button variant="secondary">Month</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Button variant="outline">Copy</Button>
        </ButtonGroup>
      </Section>
      <Section title="Glass" note="One liquid capsule; the glass buttons inside render clear on it.">
        <ButtonGroup variant="glass">
          <Button variant="glass" size="icon" accessibilityLabel="Share">
            <ShareIcon />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="glass" size="icon" accessibilityLabel="Copy">
            <CopyIcon />
          </Button>
          <Button variant="glass" size="icon" accessibilityLabel="Delete">
            <TrashIcon />
          </Button>
        </ButtonGroup>
      </Section>
      <Section title="Vertical">
        <ButtonGroup orientation="vertical">
          <Button variant="secondary">Top</Button>
          <Button variant="secondary">Middle</Button>
          <Button variant="secondary">Bottom</Button>
        </ButtonGroup>
      </Section>
    </>
  )
}

function ToggleDemo() {
  const [bold, setBold] = React.useState(false)
  return (
    <>
      <Section title="Controlled" note={`bold = ${bold}`}>
        <View style={row}>
          <Toggle pressed={bold} onPressedChange={setBold} accessibilityLabel="Bold">
            <BoldIcon />
          </Toggle>
          <Toggle variant="outline" defaultPressed accessibilityLabel="Italic">
            <ItalicIcon />
          </Toggle>
          <Toggle size="sm">Small</Toggle>
          <Toggle size="lg">
            <PenIcon /> Large
          </Toggle>
          <Toggle disabled>Disabled</Toggle>
        </View>
      </Section>
    </>
  )
}

function ToggleGroupDemo() {
  const [align, setAlign] = React.useState("left")
  const [marks, setMarks] = React.useState<string[]>(["bold"])
  return (
    <>
      <Section title="Single · joined" note={`align = ${align || "none"}`}>
        <ToggleGroup type="single" value={align} onValueChange={setAlign} variant="outline">
          <ToggleGroupItem value="left" accessibilityLabel="Left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" accessibilityLabel="Center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" accessibilityLabel="Right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </Section>
      <Section title="Multiple · spaced" note={marks.join(", ") || "none"}>
        <ToggleGroup type="multiple" value={marks} onValueChange={setMarks} spacing={1} size="sm">
          <ToggleGroupItem value="bold" accessibilityLabel="Bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" accessibilityLabel="Italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" accessibilityLabel="Underline" disabled>
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </Section>
      <Section title="Disabled group">
        <ToggleGroup type="single" defaultValue="a" disabled>
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
      </Section>
    </>
  )
}

function StepperDemo() {
  const [cups, setCups] = React.useState(2)
  return (
    <>
      <Section title="Controlled" note="Hold to repeat; VoiceOver swipes up/down.">
        <View style={row}>
          <Stepper value={cups} onValueChange={setCups} min={0} max={12} formatValue={(v) => `${v} cups`} accessibilityLabel="Water" />
          <Body>{cups} cups</Body>
        </View>
      </Section>
      <Section title="Small · step 5 · disabled">
        <View style={row}>
          <Stepper size="sm" defaultValue={10} step={5} accessibilityLabel="Minutes" />
          <Stepper disabled accessibilityLabel="Disabled" />
        </View>
      </Section>
    </>
  )
}

function CalendarDemo() {
  const [day, setDay] = React.useState<Date | undefined>(new Date())
  const [days, setDays] = React.useState<Date[]>([])
  const [range, setRange] = React.useState<DateRange | undefined>()
  return (
    <>
      <Section title="Single" note={day?.toDateString() ?? "—"}>
        <Calendar mode="single" selected={day} onSelect={setDay} />
      </Section>
      <Section title="Range · Monday start · outline arrows" note={range?.from ? `${range.from.toDateString()} – ${range.to?.toDateString() ?? "…"}` : "—"}>
        <Calendar mode="range" selected={range} onSelect={setRange} weekStartsOn={1} buttonVariant="outline" />
      </Section>
      <Section title="Multiple · weekends disabled · no outside days" note={`${days.length} picked`}>
        <Calendar mode="multiple" selected={days} onSelect={setDays} disabled={(d) => d.getDay() === 0 || d.getDay() === 6} showOutsideDays={false} />
      </Section>
    </>
  )
}

function DatePickerDemo() {
  const [d, setD] = React.useState<Date | undefined>()
  const [trip, setTrip] = React.useState<DateRange | undefined>()
  return (
    <>
      <Section title="Compact · system" note={d?.toLocaleString() ?? "—"}>
        <DatePicker value={d} onValueChange={setD} aria-label="Due" />
        <DatePicker value={d} onValueChange={setD} time aria-label="Due with time" />
      </Section>
      <Section title="Glass (native={false}) · field · time step 15">
        <DatePicker native={false} variant="field" value={d} onValueChange={setD} time minuteStep={15} aria-label="Reminder" />
        <DatePicker native={false} defaultValue={new Date()} formatOptions={{ weekday: "long", day: "numeric", month: "short" }} calendarProps={{ weekStartsOn: 1 }} />
      </Section>
      <Section title="Range · disabled">
        <DatePicker mode="range" variant="field" value={trip} onValueChange={setTrip} aria-label="Trip" />
        <DatePicker disabled placeholder="Disabled" />
      </Section>
    </>
  )
}

function GlassGroupDemo() {
  const [view, setView] = React.useState("list")
  return (
    <>
      <Section title="Indicator" note={`view = ${view}`}>
        <GlassGroup selected={view} accessibilityLabel="View">
          <GlassGroupItem value="list" selected={view === "list"} onPress={() => setView("list")} accessibilityLabel="List">
            <ListIcon />
          </GlassGroupItem>
          <GlassGroupItem value="grid" selected={view === "grid"} onPress={() => setView("grid")} accessibilityLabel="Grid">
            <GridIcon />
          </GlassGroupItem>
          <GlassGroupItem value="text" selected={view === "text"} onPress={() => setView("text")}>
            Text
          </GlassGroupItem>
        </GlassGroup>
      </Section>
      <Section title="Actions · vertical">
        <View style={row}>
          <GlassGroup>
            <GlassGroupItem accessibilityLabel="Bold">
              <BoldIcon />
            </GlassGroupItem>
            <GlassGroupItem accessibilityLabel="Italic">
              <ItalicIcon />
            </GlassGroupItem>
          </GlassGroup>
          <GlassGroup orientation="vertical" indicator>
            <GlassGroupItem value="a" selected>
              A
            </GlassGroupItem>
            <GlassGroupItem value="b">B</GlassGroupItem>
          </GlassGroup>
        </View>
      </Section>
    </>
  )
}

/** Form controls: select, radio-group, field, input-group, button-group, toggle, toggle-group, stepper, calendar, date-picker, glass-group. */
export const demos: Record<string, Demo> = {
  select: { title: "Select", render: () => <SelectDemo /> },
  "radio-group": { title: "Radio group", render: () => <RadioDemo /> },
  field: { title: "Field", render: () => <FieldDemo /> },
  "input-group": { title: "Input group", render: () => <InputGroupDemo /> },
  "button-group": { title: "Button group", render: () => <ButtonGroupDemo /> },
  toggle: { title: "Toggle", render: () => <ToggleDemo /> },
  "toggle-group": { title: "Toggle group", render: () => <ToggleGroupDemo /> },
  stepper: { title: "Stepper", render: () => <StepperDemo /> },
  calendar: { title: "Calendar", render: () => <CalendarDemo /> },
  "date-picker": { title: "Date picker", render: () => <DatePickerDemo /> },
  "glass-group": { title: "Glass group", render: () => <GlassGroupDemo /> },
}
