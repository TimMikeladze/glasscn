import { FlameIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Progress } from "@/components/glass/progress"
import { Switch } from "@/components/glass/switch"
import { ThemeScope } from "@/components/glass/theme-scope"

const COMBOS: { palette: string; material: string; shape: string; scheme?: "light" | "dark" }[] = [
  { palette: "ocean", material: "vivid", shape: "round" },
  { palette: "cherry", material: "crystal", shape: "sharp" },
  { palette: "sage", material: "matte", shape: "soft" },
  { palette: "amber", material: "vapor", shape: "round" },
  { palette: "graphite", material: "smoked", shape: "square", scheme: "dark" },
  { palette: "midnight", material: "neon", shape: "soft", scheme: "dark" },
]

/** The same card under six ThemeScopes: palette, material, shape and scheme all from CSS variables. */
export function ThemeStrip() {
  return (
    <div className="grid *:min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {COMBOS.map((c) => (
        <ThemeScope key={c.palette} palette={c.palette} material={c.material} shape={c.shape} scheme={c.scheme} className="rounded-surface">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="capitalize">{c.palette}</CardTitle>
              <CardDescription className="capitalize">
                {c.material} · {c.shape}
                {c.scheme ? ` · ${c.scheme}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Progress value={68} aria-label={`${c.palette} progress`} />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button size="sm">
                    <FlameIcon data-icon="inline-start" /> Keep
                  </Button>
                  <Button size="sm" variant="glass">
                    Skip
                  </Button>
                </div>
                <Switch defaultChecked size="sm" aria-label={`${c.palette} switch`} />
              </div>
              <div className="flex gap-2">
                <Badge>12 nights</Badge>
                <Badge variant="tinted">68%</Badge>
              </div>
            </CardContent>
          </Card>
        </ThemeScope>
      ))}
    </div>
  )
}
