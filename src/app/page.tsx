import Link from "next/link"
import { ArrowRightIcon, CodeIcon, LayersIcon, SmartphoneIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Dashboard01 } from "@/components/blocks/dashboard-01"
import { Settings01 } from "@/components/blocks/settings-01"
import { Auth01 } from "@/components/blocks/auth-01"
import { InstallCommand } from "@/components/site/install-command"
import { ControlsSampler } from "@/components/site/controls-sampler"
import { PaletteDock } from "@/components/site/palette-dock"
import AreaChartDemo from "@/components/demos/area-chart"
import BarListDemo from "@/components/demos/bar-list"
import CategoryBarDemo from "@/components/demos/category-bar"
import ChatDemo from "@/components/demos/chat"
import DonutChartDemo from "@/components/demos/donut-chart"
import GaugeDemo from "@/components/demos/gauge"
import LineChartDemo from "@/components/demos/line-chart"
import TrackerDemo from "@/components/demos/tracker"
import { docs } from "@/lib/docs"
import { itemUrl } from "@/lib/site"

export default function Home() {
  const count = docs.length
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

      <section className="flex flex-col gap-6" aria-label="Data components">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-glass-heading text-3xl font-bold tracking-tight">Data that wears the theme</h2>
          <p className="text-muted-foreground">Charts, meters and lists with no colours of their own — switch palettes and they follow.</p>
        </div>
        <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-2" aria-label="Chat and line chart">
        <div className="flex flex-col gap-4">
          <h2 className="font-glass-heading text-2xl font-bold tracking-tight">A chat, out of the box</h2>
          <p className="text-muted-foreground">Threads, bubbles, typing states and a composer — it owns no messages and no networking, just glass.</p>
          <ChatDemo />
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

      <section className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-glass-heading text-2xl font-bold tracking-tight">Blocks</h2>
          <p className="text-muted-foreground">Whole screens, ready to wire up: a dashboard, Settings, sign-in.</p>
          <Settings01 />
        </div>
        <div className="flex h-full items-center">
          <Auth01 />
        </div>
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
      <PaletteDock />
    </main>
  )
}
