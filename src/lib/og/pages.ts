/** Copy for the hand-written pages — shared by each page's metadata and its share card. */
import type { OgCard } from "@/lib/og/render"
import { registryNamespace } from "@/lib/site"

export interface PageCopy extends OgCard {
  title: string
  description: string
  path: string
}

export const PAGES = {
  home: {
    title: "Liquid Glass, for shadcn",
    description: "Apple-inspired controls and system materials, installed as source with the shadcn CLI.",
    path: "/",
    command: `npx shadcn add ${registryNamespace}/button`,
    photo: "alpine",
    scene: "showcase",
  },
  showcase: {
    title: "Liquid Glass showcase",
    description: "Photos, Music, Maps, Safari, Mail, Controls, Landmarks, Notes, Search and Materials, built from glasscn parts.",
    path: "/showcase",
    eyebrow: "Showcase",
    photo: "coast",
    scene: "navigation",
  },
  themes: {
    title: "Theme Studio",
    description: "Every glass primitive as a control: palettes, materials, shapes, motion, density — exported as CSS, a shadcn theme item or a link.",
    path: "/themes",
    eyebrow: "Studio",
    photo: "coast",
    scene: "studio",
  },
  docs: {
    title: "Introduction",
    description: "Liquid Glass components for shadcn: Apple-inspired controls and system materials, built on Radix and Tailwind v4, installed as source.",
    path: "/docs",
    eyebrow: "Docs",
    photo: "summit",
    scene: "surfaces",
  },
  installation: {
    title: "Installation",
    description: "Three commands in any project that uses shadcn — Next.js, Vite, React Router, Astro, TanStack Start.",
    path: "/docs/installation",
    eyebrow: "Guides",
    command: `npx shadcn add ${registryNamespace}/glass-style`,
    photo: "summit",
    scene: "controls",
  },
  theming: {
    title: "Theming",
    description: "Pick presets, turn any knob, theme a single card — all with CSS variables.",
    path: "/docs/theming",
    eyebrow: "Guides",
    photo: "alpine",
    scene: "studio",
  },
  fonts: {
    title: "Fonts & type",
    description: "Fonts the shadcn way, a modular type scale, and type presets that restyle every heading, figure and paragraph at once.",
    path: "/docs/fonts",
    eyebrow: "Guides",
    photo: "coast",
    scene: "type",
  },
  native: {
    title: "React Native",
    description: "Every glasscn component for Expo — one React Native file for iOS, Android and the web, Liquid Glass on iOS 27 included.",
    path: "/docs/native",
    eyebrow: "Guides",
    photo: "alpine",
    scene: "native",
  },
} satisfies Record<string, PageCopy>

export type PageKey = keyof typeof PAGES

/** The guide pages, in docs-nav order — shared by the nav, the sitemap and llms.txt. */
export const GUIDES: (PageCopy & { label: string })[] = [
  { ...PAGES.docs, label: "Introduction" },
  { ...PAGES.installation, label: "Installation" },
  { ...PAGES.theming, label: "Theming" },
  { ...PAGES.fonts, label: "Fonts & type" },
  { ...PAGES.themes, label: "Studio" },
  { ...PAGES.native, label: "React Native" },
]
