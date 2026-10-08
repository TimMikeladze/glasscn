#!/usr/bin/env node
/**
 * The honest test of a registry: install it the way a user would.
 *
 * 1. Build the registry stamped for a local static server and serve `public/`.
 * 2. Scaffold a fresh Next.js app in .verify/app, `shadcn init` it.
 * 3. `shadcn add` every web item (foundation, themes, components, blocks) by URL.
 * 4. Render the blocks and a few components on a page, then type-check and `next build` it.
 *
 * Usage: node scripts/verify-install.mjs [--keep]   (needs network for create-next-app / npm)
 */
import { execFileSync, spawn } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { createServer } from "node:net"
import { join, resolve } from "node:path"

const root = resolve(".")
const work = join(root, ".verify")
const app = join(work, "app")
const run = (cmd, args, cwd = root, env = {}) => execFileSync(cmd, args, { cwd, stdio: "inherit", env: { ...process.env, ...env } })

const freePort = () =>
  new Promise((ok) => {
    const s = createServer().listen(0, () => {
      const { port } = s.address()
      s.close(() => ok(port))
    })
  })

const port = await freePort()
const url = `http://127.0.0.1:${port}`
console.log(`\n▸ registry for ${url}`)
run("node", ["scripts/generate.mjs"])
run("node", ["scripts/build-registry.mjs"], root, { NEXT_PUBLIC_REGISTRY_URL: url })

// serve public/ from a child process — this script blocks on execFileSync, so it can't serve itself
const server = spawn("node", ["scripts/serve-static.mjs", String(port)], { cwd: root, stdio: "ignore" })
const stop = () => server.kill()
process.on("exit", stop)
await new Promise((r) => setTimeout(r, 500))

try {
  rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })
  console.log("\n▸ fresh Next app")
  run("pnpm", ["dlx", "create-next-app@latest", "app", "--ts", "--tailwind", "--app", "--src-dir", "--eslint", "--use-pnpm", "--import-alias", "@/*", "--yes"], work)
  run("pnpm", ["dlx", "shadcn@latest", "init", "-d", "--base", "radix"], app)

  const registry = (await import(join(root, "registry", "items.mjs")))
  const web = [
    ...registry.foundations.map((i) => i.name),
    "theme-dusk",
    ...registry.components.map((i) => i.name),
    ...registry.blocks.map((i) => i.name),
  ]
  console.log(`\n▸ shadcn add ${web.length} items`)
  run("pnpm", ["dlx", "shadcn@latest", "add", ...web.map((n) => `${url}/r/${n}.json`), "-y", "--overwrite"], app)

  writeFileSync(
    join(app, "src/app/page.tsx"),
    `import { Aurora } from "@/components/glass/aurora"
import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { Toaster } from "@/components/glass/toaster"
import { ProgressRing } from "@/components/glass/progress-ring"
import { Dashboard01 } from "@/components/glass-blocks/dashboard-01"
import { Settings01 } from "@/components/glass-blocks/settings-01"
import { Auth01 } from "@/components/glass-blocks/auth-01"

export default function Page() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-8">
      <Aurora />
      <Dashboard01 />
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="auth">Sign in</TabsTrigger>
        </TabsList>
        <TabsContent value="settings"><Settings01 /></TabsContent>
        <TabsContent value="auth"><Auth01 /></TabsContent>
      </Tabs>
      <ProgressRing value={0.6}>60%</ProgressRing>
      <Dock>
        <DockBar defaultValue="a">
          <DockItem value="a">A</DockItem>
          <DockItem value="b">B</DockItem>
        </DockBar>
        <DockAction aria-label="Add">+</DockAction>
      </Dock>
      <Toaster />
    </main>
  )
}
`
  )
  console.log("\n▸ type-check and build the consumer app")
  run("pnpm", ["exec", "tsc", "--noEmit"], app)
  run("pnpm", ["exec", "next", "build"], app)
  console.log(`\n✔ ${web.length} items installed, type-checked and built in a fresh Next app`)
  if (!process.argv.includes("--keep")) rmSync(work, { recursive: true, force: true })
} finally {
  stop()
}
