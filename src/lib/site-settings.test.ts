import { runInNewContext } from "node:vm"
import { describe, expect, it } from "vitest"

import { SITE_SETTINGS_VERSION, SITE_SETTINGS_VERSION_KEY, siteSettingsResetScript } from "./site-settings"

function runReset(data: Map<string, string>) {
  runInNewContext(siteSettingsResetScript, {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  })
}

describe("site settings reset", () => {
  it.each([undefined, "older-version"])("clears saved site settings for version %s", (version) => {
    const data = new Map([
      ["glasscn-palette", "rose"],
      ["glasscn-custom-css", ":root{--glass-blur:0px}"],
      ["theme", "dark"],
      ["glass-preferences", '{"clarity":1,"reduceTransparency":true}'],
      ["unrelated", "keep"],
    ])
    if (version) data.set(SITE_SETTINGS_VERSION_KEY, version)

    runReset(data)

    expect(Object.fromEntries(data)).toEqual({
      unrelated: "keep",
      [SITE_SETTINGS_VERSION_KEY]: SITE_SETTINGS_VERSION,
    })
  })

  it("preserves new choices on subsequent loads", () => {
    const data = new Map<string, string>()
    runReset(data)
    data.set("glasscn-palette", "ocean")
    data.set("glasscn-custom-css", ":root{--glass-blur:12px}")
    data.set("theme", "light")
    data.set("glass-preferences", '{"clarity":0.7}')
    const saved = Object.fromEntries(data)

    runReset(data)

    expect(Object.fromEntries(data)).toEqual(saved)
  })

  it("allows rendering when localStorage is unavailable", () => {
    expect(() => runInNewContext(siteSettingsResetScript, {
      get localStorage() { throw new Error("Storage blocked") },
    })).not.toThrow()
  })
})
