"use client"

import * as React from "react"
import { HeartIcon, PlusIcon, ShareIcon } from "lucide-react"

import { Backdrop } from "@/components/glass/backdrop"
import { GlassCluster, GlassClusterItem } from "@/components/glass/glass-cluster"

export default function GlassClusterDemo() {
  const [joined, setJoined] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  return <div className="relative isolate flex h-72 w-full items-center justify-center overflow-hidden rounded-surface"><Backdrop variant="image" src="/showcase/coast.jpg" className="absolute" /><GlassCluster spacing={joined ? 0 : 32}><GlassClusterItem aria-label={joined ? "Separate controls" : "Merge controls"} onClick={() => setJoined(!joined)}><PlusIcon /></GlassClusterItem><GlassClusterItem aria-label="Favorite" aria-pressed={saved} onClick={() => setSaved(!saved)}><HeartIcon className={saved ? "fill-current" : undefined} /></GlassClusterItem><GlassClusterItem aria-label="Share" onClick={() => setJoined(!joined)}><ShareIcon /></GlassClusterItem></GlassCluster></div>
}
