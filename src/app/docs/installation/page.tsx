import { CodeBlock } from "@/components/site/code-block"
import { InstallCommand } from "@/components/site/install-command"
import { C, H2, P, PageHeader, Step } from "@/components/site/prose"
import { itemUrl, registryNamespace, registryUrl } from "@/lib/site"
import { pageMetadata } from "@/lib/metadata"
import { PAGES } from "@/lib/og/pages"

export const metadata = pageMetadata(PAGES.installation)

const componentsJson = `{
  "registries": {
    "${registryNamespace}": "${registryUrl}/r/{name}.json"
  }
}`

const layout = `import { GlassEffects } from "@/components/glass/glass-effects"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-(--aurora-base)">
        <GlassEffects />
        {children}
      </body>
    </html>
  )
}`

export default function Installation() {
  return (
    <>
      <PageHeader eyebrow="Guides" title="Installation" description="Three commands in any project that uses shadcn — Next.js, Vite, React Router, Astro, TanStack Start." />
      <Step n={1} title="Set up shadcn">
        <P className="mb-0">If the project doesn’t have a components.json yet:</P>
        <InstallCommand args="init" />
      </Step>
      <Step n={2} title="Add the foundation and a palette">
        <P className="mb-0">
          <C>glass-style</C> brings the tokens, the <C>glass</C> utilities and the keyframes. A palette sets the accent, ring, ground and chart colours. <C>theme-system</C> is Apple&rsquo;s default appearance; twelve coloured palettes add an aurora.
        </P>
        <InstallCommand args={`add ${itemUrl("glass-style")} ${itemUrl("glass-effects")} ${itemUrl("theme-system")}`} />
      </Step>
      <Step n={3} title="Add components">
        <P className="mb-0">Each pulls in what it needs (the foundation, helpers, Radix) automatically.</P>
        <InstallCommand args={`add ${itemUrl("card")} ${itemUrl("button")}`} />
      </Step>
      <Step n={4} title="Add a ground and the glass runtime">
        <P className="mb-0">Put photos, an article or a list behind floating controls. The page ground is <C>--aurora-base</C>; add <C>aurora</C> if you pick a coloured palette. GlassEffects enhances control surfaces and newly opened portals on Chromium; other engines keep the CSS material. LiquidGlass installs the shared runtime automatically.</P>
        <CodeBlock code={layout} html={`<pre><code>${layout.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>`} title="app/layout.tsx" />
      </Step>
      <H2>Use the {registryNamespace} namespace</H2>
      <P>
        Add the registry to <C>components.json</C> once and install by name:
      </P>
      <CodeBlock code={componentsJson} html={`<pre><code>${componentsJson}</code></pre>`} title="components.json" />
      <div className="mt-4">
        <InstallCommand args={`add ${["button", "dock", "activity-rings"].map((n) => `${registryNamespace}/${n}`).join(" ")}`} />
      </div>
      <H2>Where files go</H2>
      <P>
        Components install to <C>components/glass/*</C> (beside shadcn’s <C>components/ui</C>, never over it), blocks to <C>components/glass-blocks/*</C>, helpers to <C>lib/</C> and{" "}
        <C>hooks/</C>. Imports follow your <C>components.json</C> aliases. Class merging uses the foundation’s <C>glass-cn</C> helper, which teaches <C>cn</C> the named radius and spacing tokens.
      </P>
    </>
  )
}
