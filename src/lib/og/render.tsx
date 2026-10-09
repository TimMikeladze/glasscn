/**
 * The share card every page uses: a frosted pane over an aurora drawn from a
 * real palette, with a small glass control cluster on the right.
 * Satori rules apply — every multi-child div is `display: flex`, colours are hex.
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { cacheLife } from "next/cache"
import { ImageResponse } from "next/og"
import sharp from "sharp"

import { ogColors, type OgColors } from "@/lib/og/colors"
import { site } from "@/lib/site"

export const ogSize = { width: 1200, height: 630 }
/**
 * JPEG, not PNG: the aurora's gradients make a ~570 KB PNG, over WhatsApp's
 * ~600 KB unfurl limit on a bad day; as JPEG it is a fraction of that.
 */
export const ogContentType = "image/jpeg"

export interface OgCard {
  title: string
  description?: string
  /** Small pill above the title — a section or group. */
  eyebrow?: string
  /** Footer left: a command shown in mono, e.g. `npx shadcn add @glasscn/button`. */
  command?: string
  /** The page this card is for, e.g. `/docs/button` (used by page metadata). */
  path?: string
  /** A key of PALETTES. */
  palette?: string
}

const FONT_DIR = join(process.cwd(), "src/lib/og/fonts")
type Fonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]>
let fonts: Promise<Fonts> | undefined
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(join(FONT_DIR, "Geist-Medium.ttf")),
    readFile(join(FONT_DIR, "Geist-Bold.ttf")),
    readFile(join(FONT_DIR, "GeistMono-Medium.ttf")),
  ]).then(([medium, bold, mono]) => [
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Geist", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ]))

/** Shorter titles get bigger type; long ones wrap to two lines at most. */
export function titleSize(title: string): number {
  const n = title.length
  if (n <= 10) return 112
  if (n <= 16) return 96
  if (n <= 24) return 80
  if (n <= 36) return 66
  return 56
}

const host = new URL(site.url).host

export async function renderOg(card: OgCard): Promise<Response> {
  return new Response(await renderJpeg(card), { headers: { "content-type": ogContentType } })
}

/** Cached so cards prerender at build time — reading the fonts would otherwise make each route dynamic. */
async function renderJpeg(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  "use cache"
  cacheLife("max")
  const png = await new ImageResponse(<Card {...card} colors={ogColors(card.palette)} />, { ...ogSize, fonts: await loadFonts() }).arrayBuffer()
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer()
  return new Uint8Array(jpeg)
}

function Card({ title, description, eyebrow, command, colors: c }: OgCard & { colors: OgColors }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: c.ground, fontFamily: "Geist", color: "#fff" }}>
      <Aurora c={c} />
      {/* the pane */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          width: ogSize.width - 96,
          height: ogSize.height - 96,
          display: "flex",
          borderRadius: 44,
          background: "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 55%, rgba(255,255,255,0.10) 100%)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 30px 80px rgba(0,0,0,0.35)",
          padding: "52px 56px 44px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark c={c} />
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>{site.name}</div>
            {eyebrow ? (
              <div
                style={{
                  display: "flex",
                  marginLeft: 8,
                  padding: "6px 18px",
                  borderRadius: 999,
                  fontSize: 22,
                  color: "rgba(255,255,255,0.92)",
                  background: `${c.primary}33`,
                  border: `1.5px solid ${c.primary}88`,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 18, paddingRight: 24 }}>
            <div style={{ display: "flex", fontSize: titleSize(title), fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.02, lineClamp: 2 }}>{title}</div>
            {description ? (
              <div style={{ display: "block", fontSize: 30, lineHeight: 1.35, color: "rgba(255,255,255,0.74)", lineClamp: 2, maxWidth: 680 }}>{description}</div>
            ) : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            {command ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "Geist Mono",
                  fontSize: 22,
                  padding: "10px 18px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.28)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <div style={{ display: "flex", color: c.primary, marginRight: 14 }}>$</div>
                <div style={{ display: "flex" }}>{command}</div>
              </div>
            ) : (
              <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)" }}>{site.tagline}</div>
            )}
            <div style={{ display: "flex", flexShrink: 0, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>{host}</div>
          </div>
        </div>
        <Controls c={c} />
      </div>
    </div>
  )
}

/** Layered radial glows on one element — separate off-canvas blobs clip into hard bands in Satori. */
function Aurora({ c }: { c: OgColors }) {
  const glow = (color: string, alpha: string, at: string, reach: string) => `radial-gradient(circle at ${at}, ${color}${alpha} 0%, ${color}00 ${reach})`
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundImage: [
          glow(c.primary, "99", "88% 92%", "42%"),
          glow(c.aurora[0], "cc", "92% 6%", "58%"),
          glow(c.aurora[1], "cc", "8% 10%", "60%"),
          glow(c.aurora[2], "aa", "45% 105%", "55%"),
        ].join(", "),
      }}
    />
  )
}

/** The glasscn mark: a lens with the accent ring. */
function Mark({ c, size = 52 }: { c: OgColors; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.18)",
        border: "1.5px solid rgba(255,255,255,0.4)",
      }}
    >
      <div
        style={{
          width: size - 14,
          height: size - 14,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(200deg, ${c.aurora[0]}, ${c.aurora[1]}, ${c.primary}, ${c.aurora[2]})`,
        }}
      >
        <div style={{ width: size - 30, height: size - 30, borderRadius: 999, background: "rgba(255,255,255,0.55)" }} />
      </div>
    </div>
  )
}

/** A small stack of glass controls — a hint of what the library looks like. */
function Controls({ c }: { c: OgColors }) {
  const pane = {
    display: "flex",
    borderRadius: 22,
    background: "rgba(255,255,255,0.12)",
    border: "1.5px solid rgba(255,255,255,0.22)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 12px 30px rgba(0,0,0,0.25)",
  } as const
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, width: 272, flexShrink: 0 }}>
      {/* segmented control */}
      <div style={{ ...pane, padding: 6, gap: 6 }}>
        {["Day", "Week", "Month"].map((l, i) => (
          <div
            key={l}
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              padding: "10px 0",
              borderRadius: 16,
              fontSize: 20,
              color: i === 1 ? "#fff" : "rgba(255,255,255,0.65)",
              background: i === 1 ? "rgba(255,255,255,0.22)" : "transparent",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      {/* switch + slider */}
      <div style={{ ...pane, flexDirection: "column", padding: "18px 20px", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,0.85)" }}>Frost</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: 64, height: 36, borderRadius: 999, background: c.primary, padding: 3 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", height: 24, position: "relative" }}>
          <div style={{ display: "flex", width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.2)" }}>
            <div style={{ width: "64%", height: 8, borderRadius: 999, background: `linear-gradient(90deg, ${c.ring}, ${c.primary})` }} />
          </div>
          <div style={{ position: "absolute", left: "58%", width: 24, height: 24, borderRadius: 999, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      {/* buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...pane, flex: 1, justifyContent: "center", padding: "14px 0", fontSize: 20, color: "rgba(255,255,255,0.9)", borderRadius: 999 }}>Cancel</div>
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            padding: "14px 0",
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 999,
            color: "#fff",
            background: c.primary,
            boxShadow: `0 10px 26px ${c.primary}66, inset 0 1px 0 rgba(255,255,255,0.35)`,
          }}
        >
          Save
        </div>
      </div>
    </div>
  )
}
