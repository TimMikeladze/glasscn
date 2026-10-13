import Link from "next/link"
import { ArrowRightIcon, CodeIcon, LayersIcon, SmartphoneIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Dashboard01 } from "@/components/blocks/dashboard-01"
import { Settings01 } from "@/components/blocks/settings-01"
import { Auth01 } from "@/components/blocks/auth-01"
import { Analytics01 } from "@/components/blocks/analytics-01"
import { Chat01 } from "@/components/blocks/chat-01"
import { ComponentGallery } from "@/components/site/component-gallery"
import { HomeExamples } from "@/components/site/home-examples"
import { ThemeStrip } from "@/components/site/theme-strip"
import { InstallCommand } from "@/components/site/install-command"
import { ControlsSampler } from "@/components/site/controls-sampler"
import AreaChartDemo from "@/components/demos/area-chart"
import BarListDemo from "@/components/demos/bar-list"
import CategoryBarDemo from "@/components/demos/category-bar"
import BarChartDemo from "@/components/demos/bar-chart"
import DataTableDemo from "@/components/demos/data-table"
import HeatmapDemo from "@/components/demos/heatmap"
import ProgressRingDemo from "@/components/demos/progress-ring"
import SparklineDemo from "@/components/demos/sparkline"
import StatDemo from "@/components/demos/stat"
import TypographyDemo from "@/components/demos/typography"
import DockDemo from "@/components/demos/dock"
import GroupedListDemo from "@/components/demos/grouped-list"
import DonutChartDemo from "@/components/demos/donut-chart"
import GaugeDemo from "@/components/demos/gauge"
import LineChartDemo from "@/components/demos/line-chart"
import TrackerDemo from "@/components/demos/tracker"
import { docs } from "@/lib/docs"
import { itemUrl } from "@/lib/site"

export default function Home() {
  const count = docs.length
  const gallery = docs.filter((d) => d.group !== "Blocks").map(({ slug, title, description, group }) => ({ slug, title, description, group }))
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-24 px-4 pt-16 sm:px-6 sm:pt-24">
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="glass" className="h-7 px-3">
          shadcn registry · {count} components & blocks
        </Badge>
        <h1 className="max-w-3xl font-glass-heading text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-7xl">
          Glass, for <span className="bg-linear-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">shadcn</span>.
        </h1>
        <p className="max-w-xl text-lg text-balance text-muted-foreground">
          Frosted surfaces over a living aurora, iOS-grade controls and data pieces — installed as source with the shadcn CLI, themed entirely with CSS variables.
        </p>
        <InstallCommand className="w-full max-w-2xl text-left" args={`add ${itemUrl("glass-style")} ${itemUrl("theme-dusk")}`} />
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/docs">
              Browse components <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link href="/themes">Make it yours</Link>
          </Button>
        </div>
      </section>

      <section aria-label="A dashboard built from glasscn">
        <Dashboard01 />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: CodeIcon, title: "shadcn's APIs, in glass", body: "Button, Card, Dialog, Tabs… keep their props and parts. Swapping is an import path: @/components/ui → @/components/glass." },
          { icon: LayersIcon, title: "Tokens all the way down", body: "Frost, rim, blur, saturation, aurora — every one a CSS variable. Two hooks (--glass-bg, --glass-elevation) restyle any surface from a class." },
          { icon: SmartphoneIcon, title: "Web and React Native", body: "Every component has a native-* twin for Expo: one React Native file for iOS, Android and the web. Liquid Glass on iOS 26, blur on older iOS, a fill on Android." },
        ].map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <f.icon className="mb-2 size-5 text-primary" />
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Controls that feel like iOS</h2>
          <p className="text-muted-foreground">Sliding thumbs, springy switches, squash on press. Try them.</p>
        </div>
        <ControlsSampler />
      </section>

      <section className="flex flex-col gap-6" aria-label="Examples">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Put together, it’s an app</h2>
          <p className="text-muted-foreground">A player, an inbox, a project wired to every overlay, a composer, pricing — nothing here but glasscn parts.</p>
        </div>
        <HomeExamples />
      </section>

      <section className="flex flex-col gap-6" aria-label="Data components">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Data that wears the theme</h2>
          <p className="text-muted-foreground">Charts, meters and lists with no colours of their own — switch palettes and they follow.</p>
        </div>
        <div className="grid *:min-w-0 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <AreaChartDemo />
          </div>
          <DonutChartDemo />
          <Card>
            <CardContent className="flex flex-col gap-5">
              <TrackerDemo />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-5">
              <BarListDemo />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-5">
              <GaugeDemo />
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <BarChartDemo />
          </div>
          <Card>
            <CardContent className="flex flex-col gap-5">
              <SparklineDemo />
            </CardContent>
          </Card>
          <div className="md:col-span-2 lg:col-span-3 [&>*]:max-w-none">
            <StatDemo />
          </div>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Half a year of nights</CardTitle>
              <CardDescription>A heatmap that tints with the palette.</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapDemo />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-1 items-center justify-center py-8">
              <ProgressRingDemo />
            </CardContent>
          </Card>
          <div className="md:col-span-2 lg:col-span-3 [&>*]:max-w-none">
            <DataTableDemo />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6" aria-label="ThemeScope">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">One component, any theme</h2>
          <p className="text-muted-foreground">ThemeScope themes a subtree: six palettes, materials and shapes on one page, from CSS variables alone.</p>
        </div>
        <ThemeStrip />
      </section>

      <section className="grid *:min-w-0 items-start gap-8 lg:grid-cols-2" aria-label="Chat and line chart">
        <div className="flex flex-col gap-4">
          <h2 className="font-glass-heading text-2xl font-bold tracking-tight">A chat, out of the box</h2>
          <p className="text-muted-foreground">Threads, bubbles, typing states, suggestions and a composer — it owns no messages and no networking, just glass.</p>
          <Chat01 />
        </div>
        <div className="flex flex-col gap-4">
          <LineChartDemo />
          <Card>
            <CardContent className="flex flex-col gap-5">
              <CategoryBarDemo />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-6" aria-label="Blocks">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Blocks</h2>
          <p className="text-muted-foreground">Whole screens, ready to wire up: analytics, Settings and sign-in — plus the dashboard and chat above.</p>
        </div>
        <Analytics01 />
        <div className="grid *:min-w-0 items-start gap-8 lg:grid-cols-2">
          <Settings01 />
          <div className="flex h-full items-center">
            <Auth01 />
          </div>
        </div>
      </section>

      <section className="grid *:min-w-0 items-start gap-4 md:grid-cols-3" aria-label="Typography and navigation">
        <Card className="md:col-span-2">
          <CardContent>
            <TypographyDemo />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex justify-center">
              <GroupedListDemo />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex justify-center">
              <DockDemo />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-6" aria-label="Every component">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Every component, live</h2>
          <p className="text-muted-foreground">All {gallery.length} components, grouped as in the docs. Each tile is the real demo — open one for props and source.</p>
        </div>
        <ComponentGallery items={gallery} />
      </section>

      <section>
        <Card className="items-center text-center">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Copy it. Own it.</h2>
            <p className="max-w-lg text-muted-foreground">Like every shadcn registry, glasscn writes source into your repo. No package to update, nothing to fight.</p>
            <Button asChild size="lg">
              <Link href="/docs/installation">Install glasscn</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
