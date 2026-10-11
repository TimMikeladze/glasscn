import * as React from "react"
import { useColorScheme } from "react-native"
import * as Linking from "expo-linking"

import { forceA11y, type A11ySetting } from "@/components/glass/native/a11y"
import { GlassThemeProvider, PALETTE_NAMES, type DensityName, type MaterialName, type MotionName, type PaletteName, type Scheme, type ShapeName, type TypeName } from "@/components/glass/native/tokens"
import { PRESETS } from "@/components/glass/native/tokens.generated"

/** Every generated palette (12), straight from tokens.generated.ts. */
export const PALETTES: PaletteName[] = PALETTE_NAMES

/** Preset names per group, from the generated tokens. */
export const PRESET_NAMES = {
  material: Object.keys(PRESETS.material) as MaterialName[],
  shape: Object.keys(PRESETS.shape) as ShapeName[],
  motion: Object.keys(PRESETS.motion) as MotionName[],
  density: Object.keys(PRESETS.density) as DensityName[],
  type: Object.keys(PRESETS.type) as TypeName[],
}
export type PresetGroup = keyof typeof PRESET_NAMES
type Presets = { material?: MaterialName; shape?: ShapeName; motion?: MotionName; density?: DensityName; type?: TypeName }

export const A11Y_SETTINGS: A11ySetting[] = ["reduceMotion", "reduceTransparency", "highContrast", "boldText"]

type SandboxTheme = {
  palette: PaletteName
  scheme: Scheme
  presets: Presets
  /** Settings forced on via `forceA11y` (unset = follow the OS). */
  a11y: Partial<Record<A11ySetting, boolean>>
  setPalette: (p: PaletteName) => void
  setScheme: (s: Scheme) => void
  setPreset: <G extends PresetGroup>(group: G, name: Presets[G] | undefined) => void
  setA11y: (setting: A11ySetting, on: boolean | null) => void
}

const Ctx = React.createContext<SandboxTheme | null>(null)

/**
 * The palette, scheme, presets and forced a11y settings every screen renders in;
 * starts on the system scheme. A deep link's `?palette=…&scheme=…&still=1` query (Maestro's
 * screenshot flows use it) picks them on launch.
 */
export function SandboxThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const url = Linking.useLinkingURL()
  const [palette, setPalette] = React.useState<PaletteName>("dusk")
  const [scheme, setScheme] = React.useState<Scheme>(system === "dark" ? "dark" : "light")
  const [presets, setPresets] = React.useState<Presets>({})
  const [a11y, setA11yState] = React.useState<Partial<Record<A11ySetting, boolean>>>({})

  React.useEffect(() => {
    if (!url) return
    const q = Linking.parse(url).queryParams ?? {}
    if (typeof q.palette === "string" && PALETTES.includes(q.palette as PaletteName)) setPalette(q.palette as PaletteName)
    if (q.scheme === "light" || q.scheme === "dark") setScheme(q.scheme)
    // ?still=1 forces Reduce Motion: the aurora freezes, so screenshots are stable baselines
    // ?force=reduceTransparency,highContrast forces settings on, like the /tokens chips
    const forced = [...(q.still === "1" ? ["reduceMotion"] : []), ...(typeof q.force === "string" ? q.force.split(",") : [])].filter((k): k is A11ySetting =>
      ["reduceMotion", "reduceTransparency", "highContrast", "boldText"].includes(k)
    )
    for (const k of forced) forceA11y(k, true)
    if (forced.length) setA11yState((s) => ({ ...s, ...Object.fromEntries(forced.map((k) => [k, true])) }))
  }, [url])

  const value = React.useMemo<SandboxTheme>(
    () => ({
      palette,
      scheme,
      presets,
      a11y,
      setPalette,
      setScheme,
      setPreset: (group, name) => setPresets((p) => ({ ...p, [group]: name })),
      setA11y: (setting, on) => {
        forceA11y(setting, on)
        setA11yState((s) => {
          const next = { ...s }
          if (on === null) delete next[setting]
          else next[setting] = on
          return next
        })
      },
    }),
    [palette, scheme, presets, a11y]
  )
  return (
    <Ctx.Provider value={value}>
      <GlassThemeProvider palette={palette} scheme={scheme} {...presets}>
        {children}
      </GlassThemeProvider>
    </Ctx.Provider>
  )
}

export function useSandboxTheme() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useSandboxTheme needs <SandboxThemeProvider>")
  return ctx
}
