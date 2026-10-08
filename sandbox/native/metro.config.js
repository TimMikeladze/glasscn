// The sandbox renders the registry's native items live from ../../registry/native.
// Metro watches that folder, maps the `@/` aliases itself (tsconfig paths are off
// in app.json — tsconfig's catch-all `*` is for the type-checker only) and
// resolves the registry files' imports from this app's node_modules.
const path = require("node:path")
const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)
const registry = path.resolve(__dirname, "../../registry/native")
const src = path.resolve(__dirname, "src")

config.watchFolders = [...(config.watchFolders ?? []), registry]
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")]

const NATIVE = "@/components/glass/native/"
config.resolver.resolveRequest = (context, name, platform) => {
  if (name.startsWith(NATIVE)) return context.resolveRequest(context, path.join(registry, name.slice(NATIVE.length)), platform)
  if (name.startsWith("@/")) return context.resolveRequest(context, path.join(src, name.slice(2)), platform)
  return context.resolveRequest(context, name, platform)
}

module.exports = config
