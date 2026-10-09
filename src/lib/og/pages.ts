/** Copy for the hand-written pages — shared by each page's metadata and its share card. */
import type { OgCard } from "@/lib/og/render"

export interface PageCopy extends OgCard {
  title: string
  description: string
  path: string
}

export const PAGES = {
  home: {
    title: "Glass components for shadcn",
    description: "Frosted surfaces, a living aurora and iOS-grade controls — installed as source.",
    path: "/",
    command: "npx shadcn add @glasscn/button",
    palette: "dusk",
  },
  themes: {
    title: "Theme Studio",
    description: "Every glass primitive as a control: palettes, materials, shapes, motion, density — exported as CSS, a shadcn theme item or a link.",
    path: "/themes",
    eyebrow: "Studio",
    palette: "ocean",
  },
  docs: {
    title: "Introduction",
    description: "Glassmorphic components for shadcn — frosted surfaces over a living aurora, built on Radix and Tailwind v4, installed as source.",
    path: "/docs",
    eyebrow: "Docs",
    palette: "dusk",
  },
  installation: {
    title: "Installation",
    description: "Three commands in any project that uses shadcn — Next.js, Vite, React Router, Astro, TanStack Start.",
    path: "/docs/installation",
    eyebrow: "Guides",
    command: "npx shadcn add @glasscn/glass-style",
    palette: "lagoon",
  },
  theming: {
    title: "Theming",
    description: "Pick presets, turn any knob, theme a single card — all with CSS variables.",
    path: "/docs/theming",
    eyebrow: "Guides",
    palette: "lavender",
  },
  fonts: {
    title: "Fonts & type",
    description: "Fonts the shadcn way, a modular type scale, and type presets that restyle every heading, figure and paragraph at once.",
    path: "/docs/fonts",
    eyebrow: "Guides",
    palette: "amber",
  },
  native: {
    title: "React Native",
    description: "The glass started life in an Expo app. The native items bring it back there — Liquid Glass on iOS 26 included.",
    path: "/docs/native",
    eyebrow: "Guides",
    palette: "midnight",
  },
} satisfies Record<string, PageCopy>

export type PageKey = keyof typeof PAGES
