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
        <h1 className="max-w-3xl font-heading text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-7xl">
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
            <Link href="/docs/theming">Make it yours</Link>
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
          { icon: SmartphoneIcon, title: "Web and React Native", body: "The same palettes ship for Expo: Liquid Glass on iOS 26, blur on older iOS, a fill on Android, backdrop-filter on the web." },
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
          <h2 className="font-heading text-3xl font-bold tracking-tight">Controls that feel like iOS</h2>
          <p className="text-muted-foreground">Sliding thumbs, springy switches, squash on press. Try them.</p>
        </div>
        <ControlsSampler />
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Blocks</h2>
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
            <h2 className="font-heading text-3xl font-bold tracking-tight">Copy it. Own it.</h2>
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
