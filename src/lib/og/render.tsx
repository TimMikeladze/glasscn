/**
 * The share card every page uses: a showcase photograph, a scrimmed text column on
 * the left and a scene of glass parts on the right (see docs/og-images.md).
 * Satori rules apply: every multi-child div is `display: flex`, colours are hex or rgba.
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { cacheLife } from "next/cache"
import { ImageResponse } from "next/og"
import sharp from "sharp"

import { ogColors } from "@/lib/og/colors"
import { Scene, type OgPhoto, type OgScene, type SceneProps } from "@/lib/og/scenes"
import { site } from "@/lib/site"

export type { OgPhoto, OgScene } from "@/lib/og/scenes"

export const ogSize = { width: 1200, height: 630 }
/** JPEG: a photo card as PNG is over 1 MB, past WhatsApp's ~600 KB unfurl limit. */
export const ogContentType = "image/jpeg"

export interface OgCard {
  title: string
  description?: string
  /** Small pill above the title: a section or group. */
  eyebrow?: string
  /** Footer: a command shown in mono, e.g. `npx shadcn add @glasscn-app/button`. */
  command?: string
  /** The page this card is for, e.g. `/docs/button` (used by page metadata). */
  path?: string
  photo?: OgPhoto
  scene?: OgScene
}

const FONT_DIR = join(process.cwd(), "src/lib/og/fonts")
const PHOTO_DIR = join(process.cwd(), "public/showcase")
/** How far each photo's frost is dimmed so white labels hold contrast; summit's sky is bright. */
const FROST_BRIGHTNESS: Record<OgPhoto, number> = { alpine: 0.82, coast: 0.8, summit: 0.6 }

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

const dataUri = (buf: Buffer) => `data:image/jpeg;base64,${buf.toString("base64")}`

/** The photo at card size, and a blurred copy the glass panes clip from. */
async function loadPhoto(photo: OgPhoto): Promise<{ sharp: string; blurred: string }> {
  const base = sharp(await readFile(join(PHOTO_DIR, `${photo}.jpg`))).resize(ogSize.width, ogSize.height, { fit: "cover" })
  const full = await base.clone().jpeg({ quality: 90 }).toBuffer()
  // blurred at quarter size and scaled back up by Satori: same look, a 20th of the bytes
  const blurred = await sharp(full)
    .resize(300, 158)
    .blur(7)
    .modulate({ brightness: FROST_BRIGHTNESS[photo], saturation: 1.35 })
    .jpeg({ quality: 80 })
    .toBuffer()
  return { sharp: dataUri(full), blurred: dataUri(blurred) }
}

/** Shorter titles get bigger type; long ones wrap to two lines at most. */
export function titleSize(title: string): number {
  const n = title.length
  if (n <= 10) return 104
  if (n <= 16) return 88
  if (n <= 24) return 74
  if (n <= 36) return 62
  return 52
}

const host = new URL(site.url).host

export async function renderOg(card: OgCard): Promise<Response> {
  return new Response(await renderJpeg(card), { headers: { "content-type": ogContentType } })
}

/** Cached so cards prerender at build time; reading files would otherwise make each route dynamic. */
async function renderJpeg(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  "use cache"
  cacheLife("max")
  const photo = await loadPhoto(card.photo ?? "alpine")
  const png = await new ImageResponse(<Card {...card} photoSrc={photo.sharp} blurred={photo.blurred} />, { ...ogSize, fonts: await loadFonts() }).arrayBuffer()
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer()
  return new Uint8Array(jpeg)
}

/** Left edge of the scene column; the text column stops short of it. */
export const SCENE_X = 724

function Card({ title, description, eyebrow, command, scene = "showcase", photoSrc, blurred }: OgCard & { photoSrc: string; blurred: string }) {
  const c = ogColors()
  const props: SceneProps = { c, bg: blurred, photo: photoSrc }
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#000", fontFamily: "Geist", color: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws <img>, not next/image */}
      <img src={photoSrc} width={ogSize.width} height={ogSize.height} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.08) 100%), linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <div style={{ position: "absolute", left: 64, top: 60, bottom: 56, width: SCENE_X - 64 - 40, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Mark accent={c.accent} />
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>{site.name}</div>
          {eyebrow ? <Pill>{eyebrow}</Pill> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 18 }}>
          <div style={{ display: "flex", fontSize: titleSize(title), fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.02, lineClamp: 2 }}>{title}</div>
          {description ? (
            <div style={{ display: "block", fontSize: 27, lineHeight: 1.38, color: "rgba(255,255,255,0.78)", lineClamp: 2 }}>{description}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {command ? (
            <div
              style={{
                display: "flex",
                fontFamily: "Geist Mono",
                fontSize: 21,
                padding: "11px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              <div style={{ display: "flex", color: "rgba(255,255,255,0.5)", marginRight: 12 }}>$</div>
              <div style={{ display: "flex" }}>{command}</div>
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.72)" }}>{site.tagline}</div>
          )}
        </div>
      </div>

      <Scene scene={scene} {...props} />

      <div style={{ position: "absolute", right: 64, bottom: 30, display: "flex", fontSize: 20, color: "rgba(255,255,255,0.78)" }}>{host}</div>
    </div>
  )
}

function Pill({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        marginLeft: 6,
        padding: "6px 16px",
        borderRadius: 999,
        fontSize: 20,
        color: "rgba(255,255,255,0.92)",
        background: "rgba(255,255,255,0.14)",
        border: "1.5px solid rgba(255,255,255,0.24)",
      }}
    >
      {children}
    </div>
  )
}

/** The glasscn mark: a glass lens with the accent ring, as in the site header. */
function Mark({ accent, size = 48 }: { accent: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.16)",
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
          background: `linear-gradient(200deg, #1c1c1e, ${accent}, #64d2ff, #1c1c1e)`,
        }}
      >
        <div style={{ width: size - 30, height: size - 30, borderRadius: 999, background: "rgba(255,255,255,0.4)" }} />
      </div>
    </div>
  )
}
