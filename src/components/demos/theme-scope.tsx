import { PenIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Switch } from "@/components/glass/switch"
import { ThemeScope } from "@/components/glass/theme-scope"

function Sample({ title }: { title: string }) {
  return (
    <Card size="sm" className="w-56">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Same component, its own theme.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <Button size="sm">
          <PenIcon data-icon="inline-start" /> Write
        </Button>
        <Switch defaultChecked aria-label="On" size="sm" />
      </CardContent>
    </Card>
  )
}

export default function ThemeScopeDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <ThemeScope palette="ocean" material="vivid">
        <Sample title="Ocean · vivid" />
      </ThemeScope>
      <ThemeScope palette="cherry" material="crystal" shape="sharp">
        <Sample title="Cherry · crystal · sharp" />
      </ThemeScope>
      {/* one prop, one group: the page's palette and material stay */}
      <ThemeScope shape="square">
        <Sample title="Square · your palette" />
      </ThemeScope>
      <ThemeScope palette="midnight" material="neon" scheme="dark" className="rounded-surface">
        <Sample title="Midnight · neon · dark" />
      </ThemeScope>
      <ThemeScope palette="sage" scheme="light" className="rounded-surface">
        <Sample title="Sage · always light" />
      </ThemeScope>
    </div>
  )
}
