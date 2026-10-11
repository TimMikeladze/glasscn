#!/usr/bin/env node
/**
 * Builds the registry into `public/r`.
 *
 * `registry.json` refers to its own items by URL — the only way a registry
 * dependency can point at a registry other than shadcn's own. The host isn't
 * known until deploy, so the manifest carries `{REGISTRY_URL}` and this script
 * stamps it in (see registry-url.mjs: production → glasscn.app, previews → their own URL).
 */
import { execFileSync } from "node:child_process"
import { readFileSync, rmSync, writeFileSync } from "node:fs"
import { registryUrl } from "./registry-url.mjs"

const url = registryUrl()
const stamped = readFileSync("registry.json", "utf8").replaceAll("{REGISTRY_URL}", url)
const temporary = "registry.build.json"
writeFileSync(temporary, stamped)
try {
  execFileSync("node_modules/.bin/shadcn", ["build", temporary, "--output", "public/r"], { stdio: "inherit" })
} finally {
  rmSync(temporary, { force: true })
}
console.log(`\nRegistry built for ${url}`)
