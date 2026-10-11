"use client"

import * as React from "react"
import {
  AtSignIcon,
  CheckIcon,
  CloudSunIcon,
  EllipsisIcon,
  HeartIcon,
  LinkIcon,
  MailPlusIcon,
  MessageCircleIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  Settings2Icon,
  SkipBackIcon,
  SkipForwardIcon,
  SparklesIcon,
  StarIcon,
  UserPlusIcon,
  Volume2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/glass/avatar"
import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/card"
import { Checkbox } from "@/components/glass/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/glass/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/glass/dropdown-menu"
import { Glass } from "@/components/glass/glass"
import { Input } from "@/components/glass/input"
import { Kbd } from "@/components/glass/kbd"
import { Label } from "@/components/glass/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"
import { ProgressRing } from "@/components/glass/progress-ring"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Separator } from "@/components/glass/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/sheet"
import { Slider } from "@/components/glass/slider"
import { Sparkline } from "@/components/glass/sparkline"
import { Switch } from "@/components/glass/switch"
import { Textarea } from "@/components/glass/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/glass/tooltip"

const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

/** A now-playing card: art from the palette, a scrubber, transport and volume. */
function NowPlaying() {
  const length = 214
  const [at, setAt] = React.useState([78])
  const [playing, setPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState([70])
  const [liked, setLiked] = React.useState(false)

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setAt(([s]) => [s >= length ? 0 : s + 1]), 1000)
    return () => clearInterval(id)
  }, [playing])

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-surface-sm bg-linear-to-br from-primary via-chart-2 to-chart-3 text-primary-foreground" aria-hidden>
            <MusicIcon className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-glass-heading text-lg font-semibold">Slow Tide</div>
            <div className="truncate text-sm text-muted-foreground">Harbour Lights · Night Swims</div>
            <Badge variant="tinted" className="mt-2">
              Lossless
            </Badge>
          </div>
          <Button variant="ghost" size="icon" aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked} onClick={() => setLiked((l) => !l)}>
            <HeartIcon className={liked ? "fill-primary text-primary" : undefined} />
          </Button>
        </div>
        <div className="grid gap-2">
          <Slider value={at} max={length} onValueChange={setAt} aria-label="Position" />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{time(at[0])}</span>
            <span>-{time(length - at[0])}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="icon-lg" aria-label="Previous" onClick={() => setAt([0])}>
            <SkipBackIcon />
          </Button>
          <Button size="icon-lg" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button variant="ghost" size="icon-lg" aria-label="Next" onClick={() => setAt([length])}>
            <SkipForwardIcon />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Volume2Icon className="size-4 shrink-0 text-muted-foreground" />
          <Slider value={volume} onValueChange={setVolume} aria-label="Volume" />
        </div>
      </CardContent>
    </Card>
  )
}

interface Notice {
  id: number
  who: string
  initials: string
  what: string
  when: string
  mention: boolean
}

const NOTICES: Notice[] = [
  { id: 1, who: "Maya Kim", initials: "MK", what: "mentioned you in “Q4 roadmap”", when: "2m", mention: true },
  { id: 2, who: "Jon Reyes", initials: "JR", what: "approved your pull request #482", when: "18m", mention: false },
  { id: 3, who: "Ari Chen", initials: "AC", what: "replied: “ship it on Thursday?”", when: "1h", mention: true },
  { id: 4, who: "Lee Park", initials: "LP", what: "invited you to Design Crit", when: "3h", mention: false },
]

/** An inbox: filter with a segmented control, mark-all-read, avatars and separators. */
function Inbox() {
  const [filter, setFilter] = React.useState("all")
  const [read, setRead] = React.useState<Set<number>>(new Set([4]))
  const shown = NOTICES.filter((n) => filter === "all" || n.mention)
  const unread = NOTICES.filter((n) => !read.has(n.id)).length
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription>{unread ? `${unread} unread` : "All caught up"}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" disabled={!unread} onClick={() => setRead(new Set(NOTICES.map((n) => n.id)))}>
            Mark all read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <SegmentedControl value={filter} onValueChange={(v) => v && setFilter(v)} className="w-full" aria-label="Filter">
          <SegmentedControlItem value="all">
            <MessageCircleIcon /> All
          </SegmentedControlItem>
          <SegmentedControlItem value="mentions">
            <AtSignIcon /> Mentions
          </SegmentedControlItem>
        </SegmentedControl>
        <ul className="flex flex-col">
          {shown.map((n, i) => (
            <li key={n.id}>
              {i > 0 ? <Separator className="my-1" /> : null}
              <button
                type="button"
                onClick={() => setRead((r) => new Set(r).add(n.id))}
                className="flex w-full items-center gap-3 rounded-control px-2 py-2 text-left transition-colors hover:bg-fill"
              >
                <Avatar size="sm">
                  <AvatarFallback>{n.initials}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{n.who}</span> <span className="text-muted-foreground">{n.what}</span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{n.when}</span>
                <span className={read.has(n.id) ? "size-2 shrink-0" : "size-2 shrink-0 rounded-full bg-primary"} aria-label={read.has(n.id) ? undefined : "Unread"} />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

const HABITS = ["Ten minutes of reading", "Walk before lunch", "No screens after 10", "Write one line tonight"]

/** A habit list that fills a ring as you tick it off. */
function Habits() {
  const [done, setDone] = React.useState<Record<number, boolean>>({ 0: true, 1: true })
  const count = Object.values(done).filter(Boolean).length
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>Small things, every day.</CardDescription>
        <CardAction>
          <ProgressRing value={count / HABITS.length} size={52} stroke={6}>
            <span className="text-xs tabular-nums">
              {count}/{HABITS.length}
            </span>
          </ProgressRing>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {HABITS.map((h, i) => (
          <div key={h} className="flex items-center gap-3">
            <Checkbox id={`home-habit-${i}`} checked={!!done[i]} onCheckedChange={(v) => setDone((d) => ({ ...d, [i]: v === true }))} />
            <Label htmlFor={`home-habit-${i}`} className={done[i] ? "text-muted-foreground line-through" : undefined}>
              {h}
            </Label>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between text-sm text-muted-foreground">
        <span>{count === HABITS.length ? "Perfect day 🎉" : `${HABITS.length - count} to go`}</span>
        <Badge variant="secondary">12-day chain</Badge>
      </CardFooter>
    </Card>
  )
}

const TEAM = [
  { name: "Maya Kim", initials: "MK", role: "Design" },
  { name: "Jon Reyes", initials: "JR", role: "Engineering" },
  { name: "Ari Chen", initials: "AC", role: "Product" },
]

/** A project card wired to every overlay: tooltip, popover, dropdown, dialog and sheet. */
function Project() {
  const [notify, setNotify] = React.useState(true)
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Aurora redesign</CardTitle>
          <CardDescription>Ships in 9 days · 64% done</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Project actions">
                  <EllipsisIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Aurora redesign</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => toast("Link copied")}>
                  <LinkIcon /> Copy link <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Starred")}>
                  <StarIcon /> Star
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => toast("Archived", { description: "Undo from the archive." })}>
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <AvatarGroup>
              {TEAM.map((m) => (
                <Tooltip key={m.initials}>
                  <TooltipTrigger asChild>
                    <Avatar tabIndex={0}>
                      <AvatarFallback>{m.initials}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    {m.name} · {m.role}
                  </TooltipContent>
                </Tooltip>
              ))}
              <AvatarGroupCount>+2</AvatarGroupCount>
            </AvatarGroup>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="glass" size="sm">
                  Progress
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex-row items-center gap-4">
                <ProgressRing value={0.64} size={56}>
                  64%
                </ProgressRing>
                <div className="text-sm">
                  <div className="font-semibold">18 of 28 tasks</div>
                  <div className="text-muted-foreground">On track for Oct 19.</div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <UserPlusIcon data-icon="inline-start" /> Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite to Aurora redesign</DialogTitle>
                  <DialogDescription>They’ll get an email with a link to the project.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="home-invite">Email</Label>
                  <Input id="home-invite" type="email" placeholder="name@company.com" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="glass">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => toast.success("Invite sent")}>
                      <MailPlusIcon data-icon="inline-start" /> Send invite
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button variant="glass" size="icon" aria-label="Project settings">
                      <Settings2Icon />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  Settings <Kbd>,</Kbd>
                </TooltipContent>
              </Tooltip>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Project settings</SheetTitle>
                  <SheetDescription>Aurora redesign</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 px-5">
                  <div className="grid gap-2">
                    <Label htmlFor="home-project-name">Name</Label>
                    <Input id="home-project-name" defaultValue="Aurora redesign" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="home-project-notify">Email me on updates</Label>
                    <Switch id="home-project-notify" checked={notify} onCheckedChange={setNotify} />
                  </div>
                </div>
                <SheetFooter>
                  <Button onClick={() => toast.success("Saved")}>Save</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

const MOODS = ["😔", "😐", "🙂", "😄"]

/** A journal composer: prompt, mood, a live count and ⌘↵ to save. */
function Composer() {
  const [text, setText] = React.useState("")
  const [mood, setMood] = React.useState("2")
  const save = () => {
    if (!text.trim()) return
    toast.success("Saved tonight’s entry", { description: `${text.trim().split(/\s+/).length} words · ${MOODS[Number(mood)]}` })
    setText("")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tonight</CardTitle>
        <CardDescription>What went well today?</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save()
          }}
          placeholder="One line is enough…"
          aria-label="Tonight’s entry"
          className="min-h-24"
        />
        <SegmentedControl value={mood} onValueChange={(v) => v && setMood(v)} className="w-full" aria-label="Mood">
          {MOODS.map((m, i) => (
            <SegmentedControlItem key={m} value={String(i)}>
              {m}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">{text.length} / 280</span>
        <Button onClick={save} disabled={!text.trim()}>
          Save <Kbd>⌘↵</Kbd>
        </Button>
      </CardFooter>
    </Card>
  )
}

const PLANS = [
  { name: "Solo", monthly: 0, blurb: "Everything to start.", perks: ["Unlimited entries", "All palettes", "Sync on one device"] },
  { name: "Plus", monthly: 6, blurb: "For the long run.", perks: ["Everything in Solo", "Sync everywhere", "Insights & exports"], featured: true },
]

/** Pricing: a billing toggle that changes every figure. */
function Pricing() {
  const [yearly, setYearly] = React.useState(true)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3 text-sm">
        <Label htmlFor="home-billing">Monthly</Label>
        <Switch id="home-billing" checked={yearly} onCheckedChange={setYearly} aria-label="Bill yearly" />
        <Label htmlFor="home-billing">Yearly</Label>
        <Badge variant="tinted">Save 20%</Badge>
      </div>
      <div className="grid *:min-w-0 gap-4 sm:grid-cols-2">
        {PLANS.map((p) => {
          const price = (yearly ? p.monthly * 0.8 : p.monthly).toFixed(p.monthly ? 2 : 0)
          return (
            <Card key={p.name} tint={p.featured ? "primary" : "none"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {p.name}
                  {p.featured ? (
                    <Badge>
                      <SparklesIcon /> Popular
                    </Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>{p.blurb}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="type-glass-display text-4xl tabular-nums">${price}</span>
                  <span className="text-sm text-muted-foreground">/ month{yearly && p.monthly ? ", billed yearly" : ""}</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" /> {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={p.featured ? "default" : "glass"} onClick={() => toast(`${p.name} selected`)}>
                  {p.monthly ? "Start free trial" : "Get started"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const HOURS = [14, 13, 13, 15, 17, 19, 21, 22, 22, 21, 19, 17]

/** A weather widget on a bare Glass pane. */
function Weather() {
  return (
    <Glass className="flex flex-col gap-4 rounded-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Lisbon</div>
          <div className="type-glass-display text-6xl tabular-nums">21°</div>
        </div>
        <CloudSunIcon className="size-10 text-primary" />
      </div>
      <div className="text-sm">
        Partly sunny · <span className="text-muted-foreground">H 22° L 13°</span>
      </div>
      <Sparkline data={HOURS} height={56} color="var(--chart-2)" />
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>6 AM</span>
        <span>Noon</span>
        <span>6 PM</span>
      </div>
    </Glass>
  )
}

/** App-shaped compositions that exist only on the home page — every part a glasscn component. */
export function HomeExamples() {
  return (
    <div className="grid *:min-w-0 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NowPlaying />
      <Inbox />
      <Habits />
      <Project />
      <Composer />
      <Weather />
      <div className="md:col-span-2 lg:col-span-3">
        <Pricing />
      </div>
    </div>
  )
}
