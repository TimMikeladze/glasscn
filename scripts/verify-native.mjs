#!/usr/bin/env node
/**
 * Install the native-* items into an Expo app and type-check it.
 *
 *   node scripts/verify-native.mjs [path-to-expo-app]   (default ../kaizen)
 *
 * The app is copied (sources only, node_modules linked) into .verify/native,
 * given a components.json, and `shadcn add`s every native item from a local
 * server — the app itself is never touched (its node_modules are cloned, not linked).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
import { join, resolve } from "node:path";

const root = resolve(".");
const source = resolve(process.argv[2] ?? "../kaizen");
const app = join(root, ".verify", "native");
const run = (cmd, args, cwd = root, env = {}) =>
  execFileSync(cmd, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
const port = await new Promise((ok) => {
  const s = createServer().listen(0, () => {
    const { port } = s.address();
    s.close(() => ok(port));
  });
});
const url = `http://127.0.0.1:${port}`;

run("node", ["scripts/generate.mjs"]);
run("node", ["scripts/build-registry.mjs"], root, {
  NEXT_PUBLIC_REGISTRY_URL: url,
});
const server = spawn("node", ["scripts/serve-static.mjs", String(port)], {
  cwd: root,
  stdio: "ignore",
});
// the server child keeps this process alive, so it must be stopped explicitly — on success and on failure
process.on("exit", () => server.kill());
await new Promise((r) => setTimeout(r, 500));

try {
  rmSync(app, { recursive: true, force: true });
  mkdirSync(app, { recursive: true });
  for (const f of [
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "app.json",
    "expo-env.d.ts",
    "src",
  ])
    if (existsSync(join(source, f)))
      cpSync(join(source, f), join(app, f), { recursive: true });
  // the copy gets its own node_modules — a copy-on-write clone on APFS, so it's instant and the app stays untouched
  run("cp", ["-cR", join(source, "node_modules"), join(app, "node_modules")]);
  writeFileSync(
    join(app, "components.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: false,
        tsx: true,
        tailwind: {
          config: "",
          css: "",
          baseColor: "neutral",
          cssVariables: false,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
      },
      null,
      2,
    ),
  );
  const items = [
    "native-tokens",
    "native-glass",
    "native-aurora",
    "native-press",
  ];
  // the CLI sees Expo and installs dependencies with `npx expo install` — into the copy
  run(
    "pnpm",
    [
      "dlx",
      "shadcn@latest",
      "add",
      ...items.map((n) => `${url}/r/${n}.json`),
      "-y",
      "--overwrite",
    ],
    app,
  );
  writeFileSync(
    join(app, "src", "glass-native-check.tsx"),
    `import { Text, View } from "react-native"
import { Aurora } from "@/components/glass/native/aurora"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GlassThemeProvider, useGlassTheme } from "@/components/glass/native/tokens"

function Inner() {
  const t = useGlassTheme()
  return (
    <Press haptic hover={1.02} onPress={() => {}}>
      <Glass interactive style={{ padding: 20, opacity: canFade() ? 1 : 1 }}>
        <Text style={{ color: t.foreground }}>glass</Text>
      </Glass>
    </Press>
  )
}

export default function Check() {
  return (
    <GlassThemeProvider palette="ocean" scheme="dark">
      <View style={{ flex: 1 }}>
        <Aurora />
        <Inner />
      </View>
    </GlassThemeProvider>
  )
}
`,
  );
  run("npx", ["tsc", "--noEmit"], app);
  console.log(
    `\n✔ ${items.length} native items installed into a copy of ${source} and type-checked`,
  );
  rmSync(app, { recursive: true, force: true });
} finally {
  server.kill();
}
