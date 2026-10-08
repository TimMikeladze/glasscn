import { CodeBlock } from "@/components/site/code-block"
import { InstallCommand } from "@/components/site/install-command"
import { C, H2, P, PageHeader } from "@/components/site/prose"
import { nativeItems } from "@/lib/docs"
import { sources } from "@/lib/sources.generated"
import { itemUrl } from "@/lib/site"

export const metadata = { title: "React Native" }

const usage = `import { View, Text } from "react-native"
import { Aurora } from "@/components/glass/native/aurora"
import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GlassThemeProvider, useGlassTheme } from "@/components/glass/native/tokens"

export default function Screen() {
  return (
    <GlassThemeProvider palette="ocean">
      <View style={{ flex: 1 }}>
        <Aurora />
        <Card />
      </View>
    </GlassThemeProvider>
  )
}

function Card() {
  const t = useGlassTheme()
  return (
    <Press haptic>
      <Glass style={{ margin: 20, padding: 20 }}>
        <Text style={{ color: t.foreground, fontSize: 17, fontWeight: "600" }}>Tonight’s reflection</Text>
      </Glass>
    </Press>
  )
}`

export default function Native() {
  return (
    <>
      <PageHeader eyebrow="Guides" title="React Native" description="The glass started life in an Expo app. The native items bring it back there — Liquid Glass on iOS 26 included." />
      <P>
        <C>native-glass</C> picks the best surface the platform has: native Liquid Glass (<C>expo-glass-effect</C>) on iOS 26, a UIVisualEffect blur (<C>expo-blur</C>) on older iOS,{" "}
        <C>backdrop-filter</C> under react-native-web, and a translucent fill on Android. The palettes are the same six, as plain values.
      </P>
      <InstallCommand args={nativeItems.map((i) => itemUrl(i.name)).join(" ")} />
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
      <H2>Source</H2>
      <div className="grid gap-4">
        {nativeItems.flatMap((i) => (sources[i.name] ?? []).map((f) => <CodeBlock key={f.path} code={f.code} html={f.html} title={f.path} maxHeight={360} />))}
      </div>
    </>
  )
}
