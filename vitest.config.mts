import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) }
const nativeAlias = { ...alias, "react-native": fileURLToPath(new URL("./src/test/react-native-stub.ts", import.meta.url)) }
const exclude = ["**/node_modules/**", ".verify/**", "sandbox/**"]

// Three projects: the engine, registry and native-helper tests stay in plain node (fast); component tests
// (`*.test.tsx`) render into jsdom with Testing Library.
export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      { resolve: { alias }, test: { name: "node", environment: "node", include: ["src/**/*.test.ts", "registry/**/*.test.mjs"], exclude } },
      // registry/native pure helpers (chart-math, hitSlop): react-native is a tiny stub; components are tested in sandbox/native (jest-expo)
      { resolve: { alias: nativeAlias }, test: { name: "native", environment: "node", include: ["registry/native/**/*.test.ts"], exclude } },
      { resolve: { alias }, test: { name: "dom", environment: "jsdom", include: ["src/**/*.test.tsx"], exclude, setupFiles: ["./src/test/setup-dom.ts"] } },
    ],
  },
})
