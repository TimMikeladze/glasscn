import { CodeBlock } from "@/components/site/code-block"
import { InstallCommand } from "@/components/site/install-command"
import { C, H2, P, PageHeader } from "@/components/site/prose"
import { nativeItems } from "@/lib/docs"
import { sources } from "@/lib/sources.generated"
import { itemUrl } from "@/lib/site"
import { pageMetadata } from "@/lib/metadata"
import { PAGES } from "@/lib/og/pages"

export const metadata = pageMetadata(PAGES.native)

/** The base every native component builds on; components pull it in themselves. */
const FOUNDATION = ["native-tokens", "native-glass", "native-aurora", "native-press", "native-ui"]
const components = nativeItems.filter((i) => !FOUNDATION.includes(i.name) && i.name !== "native-chart-math")

const usage = `import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { LiquidGlass01 } from "@/components/glass/native/liquid-glass-01"

export default function Screen() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <LiquidGlass01 scene="music" style={{ flex: 1 }} />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}`

export default function Native() {
  return (
    <>
      <PageHeader eyebrow="Guides" title="React Native" description="Every component and block, for Expo: system Liquid Glass on iOS 27, generated themes, and the same parts on Android and the web." />
      <P>
        Native Liquid Glass starts untinted and follows the system appearance. Regular glass carries floating controls; clear glass belongs over media. Content cards use standard material. System switches, sliders, pickers, menus and sheets use Expo’s native UI components. The same source renders on Android and react-native-web with platform materials and generated theme tokens.
      </P>
      <InstallCommand args={`add ${FOUNDATION.map((n) => itemUrl(n)).join(" ")}`} />
      <P className="mt-4">
        Needs a <C>components.json</C> in the Expo project (as react-native-reusables uses) so the CLI knows your aliases. Files land in <C>components/glass/native/</C>.
      </P>
      <H2>Run the Apple-inspired examples</H2>
      <InstallCommand args={`add ${itemUrl("native-liquid-glass-01")}`} />
      <P>Choose Photos, Music, Maps, Safari, Mail or Controls. The native sandbox has all six scenes, separate material examples, and sibling glass merging.</P>
      <InstallCommand args={`add ${itemUrl("native-liquid-glass-02")}`} />
      <P>For Landmarks, Notes, Search and Materials, use <C>LiquidGlass02</C> from <C>native/liquid-glass-02</C> with the matching lowercase scene name. These add image extension, identified badges, prioritized toolbar overflow, editable nonmodal formatting and scoped search tokens.</P>
      <CodeBlock code={usage} html={`<pre><code>${usage.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>`} title="app/index.tsx" />
      <H2>Preserve the system effect</H2>
      <P>
        Keep opacity at one on native glass and its ancestors. Animate position, size or the optical effect instead (
        <C>canFade()</C> from <C>native-glass</C> tells you when).
      </P>
      <P>Use <C>materialized</C> for optical presentation exits; <C>visible</C> hides the entire surface. Reduce Motion stops elastic/effect animation. <C>GText</C> and <C>GIcon</C> supply dynamic neutral foregrounds so labels stay readable when regular glass changes appearance.</P>
      <P>Leave palette and scheme unset to preserve system defaults. Set them explicitly in <C>GlassThemeProvider</C> to theme a subtree. Android can opt into a blur target with <C>GlassBlurTarget</C>; otherwise the material uses a readable fill. Bright media can use a dim behind clear controls; dark media needs none.</P>
      <H2>Components</H2>
      <P>
        Every web component and block has a native twin under the same name with a <C>native-</C> prefix: the same parts and props, one file that renders on iOS, Android and the web
        (react-native-web). Each installs on its own and brings what it needs:
      </P>
      <InstallCommand args={`add ${itemUrl("native-button")} ${itemUrl("native-dialog")} ${itemUrl("native-activity-rings")}`} />
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        {components.map((i) => (
          <li key={i.name}>
            <C>{i.name}</C>
          </li>
        ))}
      </ul>
      <H2>Foundation source</H2>
      <div className="grid gap-4">
        {nativeItems.filter((i) => FOUNDATION.includes(i.name)).flatMap((i) => (sources[i.name] ?? []).map((f) => <CodeBlock key={f.path} code={f.code} html={f.html} title={f.path} maxHeight={360} />))}
      </div>
    </>
  )
}
