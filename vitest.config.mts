import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) }
const exclude = ["**/node_modules/**", ".verify/**", "sandbox/**"]

// Two projects: the engine and registry tests stay in plain node (fast); component tests
// (`*.test.tsx`) render into jsdom with Testing Library.
export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      { resolve: { alias }, test: { name: "node", environment: "node", include: ["src/**/*.test.ts", "registry/**/*.test.mjs"], exclude } },
      { resolve: { alias }, test: { name: "dom", environment: "jsdom", include: ["src/**/*.test.tsx"], exclude, setupFiles: ["./src/test/setup-dom.ts"] } },
    ],
  },
})
