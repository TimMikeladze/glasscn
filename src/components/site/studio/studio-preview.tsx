"use client"

import * as React from "react"
import { cn } from "cn"
import { BellIcon, BookOpenIcon, CheckIcon, FlameIcon, MoonIcon, PenIcon, SearchIcon, BarChart3Icon, DropletIcon, ClockIcon } from "lucide-react"

import { ActivityRings } from "@/components/glass/activity-rings"
import { Aurora } from "@/components/glass/aurora"
import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/card"
import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"
import { GroupedList, GroupedListChevron, GroupedListContent, GroupedListHeader, GroupedListIcon, GroupedListItem, GroupedListTitle, GroupedListValue } from "@/components/glass/grouped-list"
import { Heatmap } from "@/components/glass/heatmap"
import { Input } from "@/components/glass/input"
import { Kbd } from "@/components/glass/kbd"
import { Progress } from "@/components/glass/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { Sparkline } from "@/components/glass/sparkline"
import { Stat, StatIcon, StatLabel, StatTrend, StatValue } from "@/components/glass/stat"
import { Switch } from "@/components/glass/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { ThemeScope } from "@/components/glass/theme-scope"
import { Blockquote, Display, Heading, InlineCode, Text, TextLink } from "@/components/glass/typography"
import { demos } from "@/components/demos"
import { GROUPS, docs } from "@/lib/docs"
import { typeScale } from "@/lib/glass-theme"
import type { GlassTheme } from "@/lib/glass-theme"

const sleep = [7.5, 6.8, 7.9, 8.2, 6.5, 7.1, 7.8, 8.4, 7.2, 6.9, 7.6, 8.1, 7.4, 7.9]
const today = "2026-10-08"
const heat = Object.fromEntries(Array.from({ length: 16 * 7 }, (_, i) => [new Date(Date.UTC(2026, 9, 8 - i)).toISOString().slice(0, 10), Math.round((Math.sin(i * 1.3) + Math.cos(i * 0.37) + 1.2) * 1.6)]))

/**
 * Every item in the registry, each with its docs demo — built from the same sources as the
 * docs, so a new component shows up here without anyone editing the studio. Demos are
 * memoised: they take no props, so a token drag re-renders only these wrappers (the theme
 * arrives through the scope's <style>, not through React).
 */
const CATALOGUE = GROUPS.map((group) => ({
  group,
  items: docs.filter((d) => d.group === group && demos[d.slug]).map((d) => ({ slug: d.slug, title: d.title, Demo: React.memo(demos[d.slug]) })),
})).filter((g) => g.items.length > 0)

/** Everything wearing the studio's theme — scoped, with its own aurora and scheme, independent of the page. */
export function StudioPreview({ theme, scheme }: { theme: GlassTheme; scheme: "light" | "dark" }) {
  const [tab, setTab] = React.useState("today")
  const scale = Object.entries(typeScale(theme, scheme))
    .filter(([n]) => Number(n) >= 0)
    .map(([, px]) => Math.round(px))
  return (
    <ThemeScope theme={theme} scheme={scheme} loadFonts className="relative isolate overflow-hidden rounded-[calc(var(--glass-radius-surface)*1.25)] text-foreground">
      <Aurora className="absolute" />
      <div className="relative grid gap-4 p-4 sm:p-6 xl:grid-cols-[1.15fr_1fr]">
          <Card className="xl:col-span-2">
            <CardContent className="grid gap-4">
              <Text variant="overline">Type specimen · scale {scale.join(" · ")}px</Text>
              <Heading level={1}>Small gains, every night.</Heading>
              <Text variant="lead">
                Name what mattered today and decide how it changes tomorrow. Read the <TextLink href="#">method</TextLink>, or store the answer as <InlineCode>carryId</InlineCode>.
              </Text>
              <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
                <Display>1,826</Display>
                <Blockquote className="max-w-sm">“Breathe twice before engaging.”</Blockquote>
              </div>
            </CardContent>
          </Card>
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Tonight’s reflection</CardTitle>
              <CardDescription>Two questions, a few minutes.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <ActivityRings size={120} stroke={13} rings={[{ value: 0.72 }, { value: 0.45 }, { value: 1.12 }]} />
              <div className="grid flex-1 gap-3">
                <SegmentedControl defaultValue="yes" className="w-full" aria-label="Verdict">
                  <SegmentedControlItem value="yes">Did it</SegmentedControlItem>
                  <SegmentedControlItem value="partly">Partly</SegmentedControlItem>
                  <SegmentedControlItem value="no">Didn’t</SegmentedControlItem>
                </SegmentedControl>
                <Progress value={64} aria-label="Progress" />
                <div className="flex flex-wrap gap-1.5">
                  <Badge>Kept</Badge>
                  <Badge variant="tinted">Work</Badge>
                  <Badge variant="glass">Draft</Badge>
                  <Badge variant="destructive">Missed</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>
                <PenIcon data-icon="inline-start" /> Write tonight
              </Button>
              <Button variant="glass">Later</Button>
              <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Kbd>⌘</Kbd>
                <Kbd>↵</Kbd>
              </span>
            </CardFooter>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <Stat>
              <StatIcon className="text-primary">
                <FlameIcon />
              </StatIcon>
              <StatValue className="text-primary">18</StatValue>
              <StatLabel>Chain</StatLabel>
            </Stat>
            <Stat>
              <StatIcon>
                <BookOpenIcon />
              </StatIcon>
              <StatValue>311</StatValue>
              <StatLabel>Nights</StatLabel>
              <StatTrend>12%</StatTrend>
            </Stat>
            <Stat>
              <StatIcon>
                <CheckIcon />
              </StatIcon>
              <StatValue>71%</StatValue>
              <StatLabel>Kept</StatLabel>
              <StatTrend direction="down">3%</StatTrend>
            </Stat>
          </div>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Sleep</CardTitle>
              <CardDescription>7.9 hours last night</CardDescription>
            </CardHeader>
            <CardContent>
              <Sparkline data={sleep} height={56} />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <Heatmap values={heat} today={today} weeks={16} cellSize={20} />
            </CardContent>
          </Card>
        </div>
        <div className="grid content-start gap-4">
          <Card size="sm">
            <CardContent className="grid gap-4">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search your nights" className="pl-9" aria-label="Search" />
              </div>
              <Tabs defaultValue="week">
                <TabsList className="w-full">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
              <Slider defaultValue={[60]} aria-label="Intensity" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="tinted">
                  Tinted
                </Button>
                <Button size="sm" variant="secondary">
                  Secondary
                </Button>
                <Button size="sm" variant="outline">
                  Outline
                </Button>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
          <GroupedList>
            <GroupedListHeader>Settings</GroupedListHeader>
            <GroupedListContent>
              <GroupedListItem>
                <GroupedListIcon className="bg-chart-3">
                  <BellIcon />
                </GroupedListIcon>
                <GroupedListTitle>Evening reminder</GroupedListTitle>
                <Switch defaultChecked aria-label="Evening reminder" />
              </GroupedListItem>
              <GroupedListItem asChild>
                <button type="button">
                  <GroupedListIcon className="bg-chart-2">
                    <ClockIcon />
                  </GroupedListIcon>
                  <GroupedListTitle>Rhythm</GroupedListTitle>
                  <GroupedListValue>5 years</GroupedListValue>
                  <GroupedListChevron />
                </button>
              </GroupedListItem>
              <GroupedListItem asChild>
                <button type="button">
                  <GroupedListIcon>
                    <DropletIcon />
                  </GroupedListIcon>
                  <GroupedListTitle>Appearance</GroupedListTitle>
                  <GroupedListChevron />
                </button>
              </GroupedListItem>
            </GroupedListContent>
          </GroupedList>
          <div className="glass-strong grid gap-3 rounded-surface p-5" role="dialog" aria-label="Example dialog">
            <div className="type-glass-heading text-lg">Erase every night?</div>
            <p className="text-sm text-muted-foreground">311 nights will be removed from this device.</p>
            <div className="flex justify-end gap-2">
              <Button variant="glass" size="sm">
                Cancel
              </Button>
              <Button variant="destructive" size="sm">
                Erase
              </Button>
            </div>
          </div>
          <Dock position="static">
            <DockBar value={tab} onValueChange={setTab} aria-label="Sections">
              <DockItem value="today">
                <MoonIcon />
                Today
              </DockItem>
              <DockItem value="journal">
                <BookOpenIcon />
                Journal
              </DockItem>
              <DockItem value="insights">
                <BarChart3Icon />
                Insights
              </DockItem>
            </DockBar>
            <DockAction aria-label="Write">
              <PenIcon />
            </DockAction>
          </Dock>
        </div>
      </div>
      <div className="relative grid gap-6 border-t border-glass-border p-4 pt-6 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Heading level={2}>Every item, on your theme.</Heading>
          <Text variant="small">Straight from the registry — every component and block, with its docs demo.</Text>
        </div>
        {CATALOGUE.map(({ group, items }) => (
          <section key={group} className="grid gap-3" aria-label={group}>
            <Text variant="overline">{group}</Text>
            <div className="grid items-start gap-4 md:grid-cols-2">
              {items.map(({ slug, title, Demo }) => (
                <figure key={slug} className={cn("glass-subtle grid gap-4 rounded-surface p-4 [--glass-elevation:0_0_#0000] sm:p-5", group === "Blocks" && "md:col-span-2")}>
                  <figcaption className="type-glass-heading text-sm">{title}</figcaption>
                  <div className="flex min-h-32 items-center justify-center overflow-x-auto">
                    <Demo />
                  </div>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ThemeScope>
  )
}
