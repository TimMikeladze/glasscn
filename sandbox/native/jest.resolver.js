// The registry files live outside this app (like Metro's nodeModulesPaths): resolve their
// bare imports from this app's node_modules, never the repo root's (a second React, the web's deps).
const path = require("node:path")

module.exports = (request, options) => {
  const bare = !request.startsWith(".") && !path.isAbsolute(request)
  const outside = !options.basedir.startsWith(__dirname)
  return options.defaultResolver(request, bare && outside ? { ...options, basedir: __dirname } : options)
}
