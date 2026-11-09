/**
 * The right half of a share card: a few glass parts drawn the way the components draw them.
 * Every pane is absolutely placed on the 1200×630 canvas and clips the blurred photo at its
 * own offset, which is how it looks frosted without backdrop-filter. Panes never nest.
 */
import type { CSSProperties, ReactNode } from "react"

import type { Group } from "@/lib/docs"
import type { OgColors } from "@/lib/og/colors"

export type OgPhoto = "alpine" | "coast" | "summit"
export type OgScene = "showcase" | "controls" | "data" | "chat" | "menu" | "navigation" | "type" | "surfaces" | "studio" | "native"

export const OG_PHOTOS: OgPhoto[] = ["alpine", "coast", "summit"]
export const OG_SCENES: OgScene[] = ["showcase", "controls", "data", "chat", "menu", "navigation", "type", "surfaces", "studio", "native"]

/** Each docs group gets its own photo and scene, so a card says which section it's from. */
export const GROUP_CARD: Record<Group, { photo: OgPhoto; scene: OgScene }> = {
  Surfaces: { photo: "summit", scene: "surfaces" },
  Typography: { photo: "coast", scene: "type" },
  Controls: { photo: "alpine", scene: "controls" },
  Overlays: { photo: "coast", scene: "menu" },
  Navigation: { photo: "summit", scene: "navigation" },
  Data: { photo: "alpine", scene: "data" },
  Chat: { photo: "coast", scene: "chat" },
  Blocks: { photo: "summit", scene: "data" },
}

export interface SceneProps {
  c: OgColors
  /** The blurred photo, as a data URI. */
  bg: string
  /** The sharp photo, for the phone screen in `native`. */
  photo: string
}

const X = 724
const W = 412
const SOFT = "rgba(255,255,255,0.72)"
const FAINT = "rgba(255,255,255,0.18)"

export function Scene({ scene, ...p }: SceneProps & { scene: OgScene }) {
  const S = SCENES[scene] ?? SCENES.showcase
  return <S {...p} />
}

const SCENES: Record<OgScene, (p: SceneProps) => ReactNode> = {
  showcase: ({ c, bg }) => (
    <>
      <Glass bg={bg} x={X} y={78} w={60} h={60} r={30} center>
        <Icon d={ICONS.back} />
      </Glass>
      <Glass bg={bg} x={X + W - 196} y={78} w={196} h={60} r={30} style={{ alignItems: "center", justifyContent: "space-around", padding: "0 10px" }}>
        <Icon d={ICONS.share} />
        <Icon d={ICONS.heart} />
        <Icon d={ICONS.more} width={3} />
      </Glass>
      <Glass bg={bg} x={X} y={158} w={W} h={232} r={38} style={{ flexDirection: "column", padding: 24, gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 92, height: 92, borderRadius: 18, display: "flex", backgroundImage: `linear-gradient(135deg, ${c.orange}, ${c.pink} 50%, ${c.purple})`, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Golden Hour</div>
            <div style={{ display: "flex", fontSize: 21, color: SOFT }}>Lakeside Radio</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Track value={0.42} fill="#fff" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: SOFT }}>
            <div style={{ display: "flex" }}>1:24</div>
            <div style={{ display: "flex" }}>-2:01</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 54 }}>
          <Icon d={ICONS.prev} fill size={30} />
          <Icon d={ICONS.pause} fill size={40} />
          <Icon d={ICONS.next} fill size={30} />
        </div>
      </Glass>
      <TabBar bg={bg} y={414} tabs={[{ icon: ICONS.photo, label: "Library" }, { icon: ICONS.heart, label: "For You" }, { icon: ICONS.stack, label: "Albums" }]} c={c} />
    </>
  ),

  controls: ({ c, bg }) => (
    <>
      <Glass bg={bg} x={X} y={78} w={W} h={60} r={30} style={{ padding: 5, gap: 4 }}>
        {["Day", "Week", "Month"].map((l, i) => (
          <div key={l} style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 25, fontSize: 21, color: i === 1 ? "#fff" : SOFT, fontWeight: i === 1 ? 700 : 500, background: i === 1 ? "rgba(255,255,255,0.26)" : "transparent" }}>
            {l}
          </div>
        ))}
      </Glass>
      <Glass bg={bg} x={X} y={158} w={W} h={232} r={34} style={{ flexDirection: "column", padding: "8px 24px" }}>
        <Row icon={ICONS.wifi} label="Wi-Fi" right={<Switch on c={c} />} />
        <Divider />
        <Row icon={ICONS.bell} label="Notifications" right={<Switch on c={c} />} />
        <Divider />
        <div style={{ display: "flex", alignItems: "center", gap: 16, height: 72 }}>
          <Icon d={ICONS.sun} size={22} />
          <div style={{ display: "flex", flex: 1 }}>
            <Track value={0.64} fill={c.accent} thumb />
          </div>
          <Icon d={ICONS.sun} size={30} />
        </div>
      </Glass>
      <Glass bg={bg} x={X} y={410} w={198} h={64} r={32} center style={{ fontSize: 23 }}>
        Cancel
      </Glass>
      <Prominent c={c} x={X + 214} y={410} w={198} h={64}>
        Save
      </Prominent>
    </>
  ),

  data: ({ c, bg }) => {
    const bars = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.95]
    return (
      <>
        <Glass bg={bg} x={X} y={78} w={W} h={290} r={34} style={{ flexDirection: "column", padding: "22px 26px", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 20, color: SOFT }}>Revenue · 7 days</div>
            <div style={{ display: "flex", padding: "3px 12px", borderRadius: 999, fontSize: 17, fontWeight: 700, color: c.green, background: "rgba(0,0,0,0.3)" }}>+12.4%</div>
          </div>
          <div style={{ display: "flex", fontSize: 50, fontWeight: 700, letterSpacing: "-0.04em" }}>$48,210</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flex: 1, gap: 12 }}>
            {bars.map((v, i) => (
              <div key={i} style={{ display: "flex", flex: 1, height: `${v * 100}%`, borderRadius: 8, background: i === bars.length - 1 ? c.accent : "rgba(255,255,255,0.34)" }} />
            ))}
          </div>
        </Glass>
        <Glass bg={bg} x={X} y={388} w={198} h={124} r={30} style={{ flexDirection: "column", padding: "18px 22px", gap: 6 }}>
          <div style={{ display: "flex", fontSize: 18, color: SOFT }}>Active users</div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>2,481</div>
          <Spark color={c.teal} />
        </Glass>
        <Glass bg={bg} x={X + 214} y={388} w={198} h={124} r={30} style={{ alignItems: "center", padding: "0 20px", gap: 16 }}>
          <Ring value={0.78} color={c.green} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>78%</div>
            <div style={{ display: "flex", fontSize: 17, color: SOFT }}>Retention</div>
          </div>
        </Glass>
      </>
    )
  },

  chat: ({ c, bg }) => (
    <>
      <Glass bg={bg} x={X} y={78} w={316} h={96} r={28} style={{ padding: "18px 24px", fontSize: 23, lineHeight: 1.3 }}>
        Is the sheet ready for review?
      </Glass>
      <div
        style={{
          position: "absolute",
          left: X + W - 300,
          top: 198,
          width: 300,
          display: "flex",
          padding: "18px 24px",
          borderRadius: 28,
          fontSize: 23,
          lineHeight: 1.3,
          background: c.accent,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 14px 30px rgba(0,0,0,0.3)",
        }}
      >
        Pushed it. Try the drag handle.
      </div>
      <Glass bg={bg} x={X} y={318} w={198} h={64} r={28} center style={{ fontSize: 23 }}>
        Looks great.
      </Glass>
      <div style={{ position: "absolute", left: X + 4, top: 392, display: "flex", fontSize: 16, color: SOFT }}>Read 9:41 AM</div>
      <Glass bg={bg} x={X} y={446} w={64} h={64} r={32} center>
        <Icon d={ICONS.plus} size={30} />
      </Glass>
      <Glass bg={bg} x={X + 78} y={446} w={W - 78} h={64} r={32} style={{ alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 24px" }}>
        <div style={{ display: "flex", fontSize: 22, color: SOFT }}>Message</div>
        <div style={{ width: 48, height: 48, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", background: c.accent }}>
          <Icon d={ICONS.up} size={26} width={2.6} />
        </div>
      </Glass>
    </>
  ),

  menu: ({ c, bg }) => {
    const items: [string, string[]][] = [
      ["Copy", ICONS.copy],
      ["Share", ICONS.share],
      ["Duplicate", ICONS.stack],
      ["Edit", ICONS.pencil],
    ]
    return (
      <>
        <Glass bg={bg} x={X + W - 132} y={70} w={132} h={60} r={30} style={{ alignItems: "center", justifyContent: "space-around", padding: "0 8px" }}>
          <Icon d={ICONS.pencil} />
          <Icon d={ICONS.more} width={3} />
        </Glass>
        <Glass bg={bg} x={X + 44} y={146} w={W - 44} h={366} r={30} style={{ flexDirection: "column", padding: "10px 0" }}>
          {items.map(([label, icon], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, margin: "0 10px", padding: "0 18px", borderRadius: 18, fontSize: 24, background: i === 1 ? "rgba(255,255,255,0.18)" : "transparent" }}>
              <div style={{ display: "flex" }}>{label}</div>
              <Icon d={icon} size={24} />
            </div>
          ))}
          <div style={{ display: "flex", height: 1, margin: "10px 28px", background: FAINT }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, margin: "0 10px", padding: "0 18px", fontSize: 24, color: c.red }}>
            <div style={{ display: "flex" }}>Delete</div>
            <Icon d={ICONS.trash} size={24} color={c.red} />
          </div>
        </Glass>
      </>
    )
  },

  navigation: ({ c, bg }) => (
    <>
      <Glass bg={bg} x={X} y={78} w={W} h={60} r={30} style={{ alignItems: "center", gap: 14, padding: "0 22px" }}>
        <Icon d={ICONS.search} size={24} color={SOFT} />
        <div style={{ display: "flex", flex: 1, fontSize: 22, color: SOFT }}>Search places</div>
        <Icon d={ICONS.mic} size={24} color={SOFT} />
      </Glass>
      <Glass bg={bg} x={X} y={158} w={W} h={232} r={34} style={{ flexDirection: "column", padding: "8px 10px" }}>
        {[
          [ICONS.house, "Home", "12 min"],
          [ICONS.pin, "Lakeside Cabin", "48 min"],
          [ICONS.star, "Summit Trail", "1 hr 20"],
        ].map(([icon, label, meta], i) => (
          <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 16, height: 72, padding: "0 14px", borderRadius: 24, background: i === 0 ? "rgba(255,255,255,0.18)" : "transparent" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? c.accent : "rgba(255,255,255,0.2)" }}>
              <Icon d={icon as string[]} size={22} />
            </div>
            <div style={{ display: "flex", flex: 1, fontSize: 24 }}>{label as string}</div>
            <div style={{ display: "flex", fontSize: 19, color: SOFT }}>{meta as string}</div>
          </div>
        ))}
      </Glass>
      <TabBar bg={bg} y={414} tabs={[{ icon: ICONS.map, label: "Explore" }, { icon: ICONS.star, label: "Saved" }, { icon: ICONS.user, label: "You" }]} c={c} />
    </>
  ),

  type: ({ bg }) => (
    <Glass bg={bg} x={X} y={78} w={W} h={434} r={36} style={{ flexDirection: "column", justifyContent: "center", padding: "0 30px", gap: 14 }}>
      {(
        [
          ["Large Title", 46, 700, "34"],
          ["Title", 36, 700, "28"],
          ["Headline", 27, 700, "17"],
          ["Body text", 27, 500, "17"],
          ["Footnote", 21, 500, "13"],
          ["Caption", 18, 500, "12"],
        ] as const
      ).map(([label, size, weight, pt]) => (
        <div key={label} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: size, fontWeight: weight, letterSpacing: size > 30 ? "-0.03em" : "-0.01em", color: size < 22 ? SOFT : "#fff" }}>{label}</div>
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 16, color: SOFT }}>{pt} pt</div>
        </div>
      ))}
    </Glass>
  ),

  surfaces: ({ c, bg }) => (
    <>
      <Glass bg={bg} x={X} y={78} w={W} h={252} r={36} style={{ flexDirection: "column", padding: 26, gap: 10 }}>
        <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: SOFT, letterSpacing: "0.04em" }}>TRIP</div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>Lake Braies</div>
        <div style={{ display: "block", fontSize: 21, lineHeight: 1.35, color: SOFT, lineClamp: 2 }}>Boathouse at sunrise, then the loop trail around the water.</div>
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <div style={{ display: "flex", padding: "12px 26px", borderRadius: 999, fontSize: 20, background: "rgba(255,255,255,0.2)" }}>Later</div>
          <div style={{ display: "flex", padding: "12px 26px", borderRadius: 999, fontSize: 20, fontWeight: 700, background: c.accent }}>Open</div>
        </div>
      </Glass>
      <Glass bg={bg} x={X} y={350} w={W} h={84} r={28} style={{ alignItems: "center", gap: 16, padding: "0 22px" }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", background: c.green }}>
          <Icon d={ICONS.check} size={24} width={2.6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>Backed up</div>
          <div style={{ display: "flex", fontSize: 18, color: SOFT }}>Synced 2 minutes ago</div>
        </div>
      </Glass>
      {["Regular", "Clear", "Tinted"].map((l, i) => (
        <Glass key={l} bg={bg} x={X + i * 140} y={454} w={132} h={56} r={28} center tint={i === 2 ? c.accent : undefined} style={{ fontSize: 20 }}>
          {l}
        </Glass>
      ))}
    </>
  ),

  studio: ({ c, bg }) => {
    const swatches = [c.accent, c.indigo, c.purple, c.pink, c.orange, c.green, c.teal]
    return (
      <>
        <Glass bg={bg} x={X} y={78} w={W} h={112} r={32} style={{ flexDirection: "column", padding: "18px 24px", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 19, color: SOFT }}>Palette</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {swatches.map((s, i) => (
              <div key={s} style={{ width: 40, height: 40, borderRadius: 20, display: "flex", background: s, border: i === 0 ? "3px solid #fff" : "1.5px solid rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </Glass>
        <Glass bg={bg} x={X} y={206} w={W} h={238} r={32} style={{ flexDirection: "column", justifyContent: "center", padding: "0 24px", gap: 16 }}>
          {(
            [
              ["Frost", "0.42", 0.42],
              ["Blur", "24px", 0.6],
              ["Radius", "28px", 0.74],
            ] as const
          ).map(([l, v, n]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19 }}>
                <div style={{ display: "flex" }}>{l}</div>
                <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 17, color: SOFT }}>{v}</div>
              </div>
              <Track value={n} fill={c.accent} thumb />
            </div>
          ))}
        </Glass>
        <Glass bg={bg} x={X} y={460} w={W} h={56} r={28} style={{ padding: 5, gap: 4 }}>
          {["Light", "Dark", "System"].map((l, i) => (
            <div key={l} style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 25, fontSize: 20, color: i === 2 ? "#fff" : SOFT, fontWeight: i === 2 ? 700 : 500, background: i === 2 ? "rgba(255,255,255,0.26)" : "transparent" }}>
              {l}
            </div>
          ))}
        </Glass>
      </>
    )
  },

  native: ({ c, bg, photo }) => {
    const px = X + 172
    const py = 56
    const pw = 240
    const ph = 486
    return (
      <>
        {["iOS", "Android", "Web"].map((l, i) => (
          <Glass key={l} bg={bg} x={X} y={170 + i * 82} w={140} h={60} r={30} center tint={i === 0 ? c.accent : undefined} style={{ fontSize: 21, fontWeight: i === 0 ? 700 : 500 }}>
            {l}
          </Glass>
        ))}
        {/* the phone: the sharp photo as its screen, glass parts on top */}
        <div style={{ position: "absolute", left: px - 8, top: py - 8, width: pw + 16, height: ph + 16, borderRadius: 52, display: "flex", background: "#0b0b0c", boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 0 0 1.5px rgba(255,255,255,0.18)" }} />
        <div style={{ position: "absolute", left: px, top: py, width: pw, height: ph, borderRadius: 44, overflow: "hidden", display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws <img> */}
          <img src={photo} width={1200} height={630} alt="" style={{ position: "absolute", left: -px, top: -py }} />
        </div>
        <div style={{ position: "absolute", left: px + pw / 2 - 40, top: py + 12, width: 80, height: 24, borderRadius: 12, display: "flex", background: "#000" }} />
        <Glass bg={bg} x={px + 14} y={py + 52} w={40} h={40} r={20} center>
          <Icon d={ICONS.back} size={20} />
        </Glass>
        <Glass bg={bg} x={px + pw - 54} y={py + 52} w={40} h={40} r={20} center>
          <Icon d={ICONS.more} size={20} width={3} />
        </Glass>
        <Glass bg={bg} x={px + 10} y={py + ph - 176} w={pw - 20} h={164} r={34} style={{ flexDirection: "column", padding: "10px 18px", gap: 8 }}>
          <div style={{ display: "flex", alignSelf: "center", width: 36, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.45)" }} />
          <div style={{ display: "flex", fontSize: 20, fontWeight: 700 }}>Lake Braies</div>
          <div style={{ display: "flex", fontSize: 15, color: SOFT }}>Dolomites · 1,496 m</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <div style={{ display: "flex", flex: 1, justifyContent: "center", padding: "9px 0", borderRadius: 999, fontSize: 15, fontWeight: 700, background: c.accent }}>Directions</div>
            <div style={{ display: "flex", flex: 1, justifyContent: "center", padding: "9px 0", borderRadius: 999, fontSize: 15, background: "rgba(255,255,255,0.22)" }}>Save</div>
          </div>
        </Glass>
      </>
    )
  },
}

/** A Liquid Glass pane: the blurred photo patch it covers, a light fill, a rim and a top highlight. */
function Glass({
  bg,
  x,
  y,
  w,
  h,
  r,
  tint,
  center,
  style,
  children,
}: {
  bg: string
  x: number
  y: number
  w: number
  h: number
  r: number
  /** Tinted glass: the accent over the frost. */
  tint?: string
  center?: boolean
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, display: "flex", boxShadow: "0 16px 40px rgba(0,0,0,0.28)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: r, overflow: "hidden", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws <img> */}
        <img src={bg} width={1200} height={630} alt="" style={{ position: "absolute", left: -x, top: -y, width: 1200, height: 630 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: h,
            display: "flex",
            backgroundImage: tint
              ? `linear-gradient(180deg, ${tint}e6, ${tint}c8)`
              : "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%), linear-gradient(0deg, rgba(0,0,0,0.16), rgba(0,0,0,0.16))",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: h,
          borderRadius: r,
          display: "flex",
          border: "1.5px solid rgba(255,255,255,0.3)",
          boxShadow: "inset 0 1.5px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(255,255,255,0.12)",
        }}
      />
      <div style={{ position: "relative", display: "flex", width: w, height: h, color: "#fff", ...(center ? { alignItems: "center", justifyContent: "center" } : {}), ...style }}>{children}</div>
    </div>
  )
}

function Prominent({ c, x, y, w, h, children }: { c: OgColors; x: number; y: number; w: number; h: number; children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: h / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 23,
        fontWeight: 700,
        background: c.accent,
        boxShadow: `inset 0 1.5px 1px rgba(255,255,255,0.45), 0 14px 30px ${c.accent}66`,
      }}
    >
      {children}
    </div>
  )
}

function TabBar({ bg, y, tabs, c }: { bg: string; y: number; tabs: { icon: string[]; label: string }[]; c: OgColors }) {
  const h = 76
  return (
    <>
      <Glass bg={bg} x={X} y={y} w={W - h - 14} h={h} r={h / 2} style={{ padding: 6, gap: 2 }}>
        {tabs.map((t, i) => (
          <div key={t.label} style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 32, background: i === 0 ? "rgba(255,255,255,0.22)" : "transparent" }}>
            <Icon d={t.icon} size={24} color={i === 0 ? c.accent : "#fff"} />
            <div style={{ display: "flex", fontSize: 14, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? c.accent : "#fff" }}>{t.label}</div>
          </div>
        ))}
      </Glass>
      <Glass bg={bg} x={X + W - h} y={y} w={h} h={h} r={h / 2} center>
        <Icon d={ICONS.search} size={28} />
      </Glass>
    </>
  )
}

function Row({ icon, label, right }: { icon: string[]; label: string; right: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, height: 72 }}>
      <Icon d={icon} size={24} />
      <div style={{ display: "flex", flex: 1, fontSize: 23 }}>{label}</div>
      {right}
    </div>
  )
}

const Divider = () => <div style={{ display: "flex", height: 1, marginLeft: 40, background: FAINT }} />

/** The iOS 27 switch: a capsule track with a pill thumb. */
function Switch({ on, c }: { on?: boolean; c: OgColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start", width: 64, height: 30, borderRadius: 15, padding: 2, background: on ? c.green : "rgba(255,255,255,0.22)" }}>
      <div style={{ width: 38, height: 26, borderRadius: 13, display: "flex", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
    </div>
  )
}

function Track({ value, fill, thumb }: { value: number; fill: string; thumb?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", position: "relative", height: thumb ? 26 : 8, width: "100%" }}>
      <div style={{ display: "flex", width: "100%", height: 7, borderRadius: 4, background: "rgba(255,255,255,0.24)" }}>
        <div style={{ display: "flex", width: `${value * 100}%`, height: 7, borderRadius: 4, background: fill }} />
      </div>
      {thumb ? <div style={{ position: "absolute", left: `${value * 100 - 7}%`, width: 38, height: 24, borderRadius: 12, display: "flex", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }} /> : null}
    </div>
  )
}

function Spark({ color }: { color: string }) {
  return (
    <svg width="154" height="28" viewBox="0 0 154 28" fill="none">
      <path d="M2 22 L22 18 L42 20 L62 12 L82 15 L102 8 L122 10 L152 3" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Ring({ value, color }: { value: number; color: string }) {
  const r = 26
  const len = 2 * Math.PI * r
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      <circle cx="34" cy="34" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="9" />
      <circle cx="34" cy="34" r={r} stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${len * value} ${len}`} transform="rotate(-90 34 34)" />
    </svg>
  )
}

/** Lucide paths (ISC), 24×24. */
const ICONS = {
  back: ["m15 18-6-6 6-6"],
  share: ["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "m16 6-4-4-4 4", "M12 2v13"],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  prev: ["M19 20 9 12l10-8v16z", "M5 19V5"],
  next: ["m5 4 10 8-10 8V4z", "M19 5v14"],
  pause: ["M7 4h3v16H7z", "M14 4h3v16h-3z"],
  photo: ["M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "m21 15-5-5L5 21", "M9 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4"],
  stack: ["M8 4h12a2 2 0 0 1 2 2v10", "M4 8h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"],
  search: ["M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16", "m21 21-4.3-4.3"],
  mic: ["M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z", "M19 10v2a7 7 0 0 1-14 0v-2", "M12 19v3"],
  wifi: ["M12 20h.01", "M2 8.82a15 15 0 0 1 20 0", "M5 12.859a10 10 0 0 1 14 0", "M8.5 16.429a5 5 0 0 1 7 0"],
  bell: ["M10.268 21a2 2 0 0 0 3.464 0", "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"],
  sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8", "M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41 1.41", "m19.07 4.93-1.41 1.41"],
  plus: ["M5 12h14", "M12 5v14"],
  up: ["m5 12 7-7 7 7", "M12 19V5"],
  copy: ["M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z", "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"],
  pencil: ["M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"],
  trash: ["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2"],
  house: ["M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  pin: ["M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6"],
  star: ["M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"],
  map: ["M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z", "M15 5.764v15", "M9 3.236v15"],
  user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8"],
  check: ["M20 6 9 17l-5-5"],
} satisfies Record<string, string[]>

function Icon({ d, size = 26, color = "#fff", width = 2, fill }: { d: string[]; size?: number; color?: string; width?: number; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  )
}
