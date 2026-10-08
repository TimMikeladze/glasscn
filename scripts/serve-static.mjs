#!/usr/bin/env node
/** Serve ./public on 127.0.0.1:<port> — used by verify-install (a separate process so it never blocks). */
import { createServer } from "node:http"
import { existsSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"

const port = Number(process.argv[2])
const root = resolve("public")
createServer((req, res) => {
  const file = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname))
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { "content-type": "application/json" }).end(readFileSync(file))
}).listen(port, "127.0.0.1")
