"use client"

import * as React from "react"
import { BookmarkIcon, HeartIcon, PlusIcon } from "lucide-react"

import { BackgroundExtension } from "@/components/glass/background-extension"
import { Button } from "@/components/glass/button"
import { GlassMorph, GlassMorphItem } from "@/components/glass/glass-morph"

export default function GlassMorphDemo() {
  const [expanded, setExpanded] = React.useState(false)
  const [reverse, setReverse] = React.useState(false)
  const [favorite, setFavorite] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const ids = reverse ? ["save", "favorite"] : ["favorite", "save"]
  return <div className="grid w-full gap-4"><BackgroundExtension src="/showcase/coast.jpg" alt="Open mountain landscape" className="flex h-64 items-end justify-center p-pad">
    <GlassMorph value={`${expanded}:${reverse}`} spacing={12}>
      <GlassMorphItem id="expand" onPress={() => setExpanded(!expanded)} accessibilityLabel={expanded ? "Hide badges" : "Show badges"}><PlusIcon /></GlassMorphItem>
      {expanded ? ids.map((id) => <GlassMorphItem key={id} id={id} onPress={() => id === "favorite" ? setFavorite(!favorite) : setSaved(!saved)} accessibilityLabel={id === "favorite" ? "Favorite landmark" : "Save landmark"} aria-pressed={id === "favorite" ? favorite : saved}>{id === "favorite" ? <HeartIcon className={favorite ? "fill-current" : undefined} /> : <BookmarkIcon className={saved ? "fill-current" : undefined} />}</GlassMorphItem>) : null}
    </GlassMorph>
  </BackgroundExtension><Button variant="secondary" onClick={() => setReverse(!reverse)}>Reorder badges</Button></div>
}
