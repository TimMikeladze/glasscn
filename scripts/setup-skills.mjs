#!/usr/bin/env node
/**
 * Mirrors `skills/` into the places this repo's agents look: `.claude/skills/` and
 * `.agents/skills/`. `skills/` is the source of truth and the only committed copy —
 * also the layout `npx skills add <owner>/glasscn` reads. Mirrors are replaced, not
 * merged, so a deleted reference never lingers.
 */
import { cp, mkdir, readdir, rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = resolve(root, "skills")
const skills = (await readdir(source, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)

for (const mirror of [resolve(root, ".claude/skills"), resolve(root, ".agents/skills")]) {
  await mkdir(mirror, { recursive: true })
  for (const skill of skills) {
    await rm(resolve(mirror, skill), { recursive: true, force: true })
    await cp(resolve(source, skill), resolve(mirror, skill), { recursive: true })
  }
}
console.log(`Installed ${skills.length} glasscn skills: ${skills.join(", ")}`)
