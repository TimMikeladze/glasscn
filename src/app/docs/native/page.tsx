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

const usage = `import { View } from "react-native"
import { Aurora } from "@/components/glass/native/aurora"
import { Button } from "@/components/glass/native/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/native/card"
import { ActivityRings } from "@/components/glass/native/activity-rings"
import { GlassThemeProvider } from "@/components/glass/native/tokens"
import { Toaster, toast } from "@/components/glass/native/toaster"

export default function Screen() {
  return (
    <GlassThemeProvider palette="ocean">
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Aurora />
        <Card>
          <CardHeader>
            <CardTitle>Tonight’s reflection</CardTitle>
            <CardDescription>Three rings, closing as the day goes.</CardDescription>
          </CardHeader>
          <CardContent style={{ alignItems: "center" }}>
            <ActivityRings rings={[{ value: 0.8 }, { value: 0.55 }, { value: 1.2 }]} size={140} />
          </CardContent>
          <CardFooter>
            <Button onPress={() => toast.success("Sealed")}>Seal tonight</Button>
          </CardFooter>
        </Card>
        <Toaster />
      </View>
    </GlassThemeProvider>
  )
}`

export default function Native() {
  return (
    <>
      <PageHeader eyebrow="Guides" title="React Native" description="Every component and block, for Expo: one React Native file for iOS, Android and the web — Liquid Glass on iOS 26 included." />
      <P>
        Every component is plain React Native, so the same file runs on iOS, Android and the web. <C>native-glass</C> picks the best surface the platform has: native Liquid Glass (<C>expo-glass-effect</C>) on iOS 26, a UIVisualEffect blur (<C>expo-blur</C>) on older iOS,{" "}
        <C>backdrop-filter</C> under react-native-web, and a translucent fill on Android. The palettes are the same six, as plain values.
      </P>
      <InstallCommand args={`add ${FOUNDATION.map((n) => itemUrl(n)).join(" ")}`} />
      <P className="mt-4">
        Needs a <C>components.json</C> in the Expo project (as react-native-reusables uses) so the CLI knows your aliases. Files land in <C>components/glass/native/</C>.
      </P>
      <H2>Usage</H2>
      <CodeBlock code={usage} html={`<pre><code>${usage.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>`} title="app/index.tsx" />
      <H2>Two rules from shipping it</H2>
      <P>
        Liquid Glass won’t render under an ancestor whose opacity starts below 1. Fade entrances and screen transitions blank it — so on iOS 26, animate with translate and scale instead (
        <C>canFade()</C> from <C>native-glass</C> tells you when).
      </P>
      <P>Animated drops Pressable’s function-style form, so <C>Press</C> takes a plain style.</P>
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
