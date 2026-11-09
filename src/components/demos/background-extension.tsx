"use client"

import { CompassIcon, InfoIcon, MapIcon, ShareIcon, StarIcon } from "lucide-react"

import { BackgroundExtension } from "@/components/glass/background-extension"
import { Glass } from "@/components/glass/glass"

// A sidebar and an inspector over the mirrored image, as in Apple's Landmarks sample
export default function BackgroundExtensionDemo() {
  return <div className="relative isolate grid w-full grid-cols-[4rem_minmax(0,1fr)_4rem] overflow-hidden rounded-surface">
    <Glass variant="liquid" className="relative z-10 flex flex-col items-center gap-4 rounded-none py-pad" aria-hidden>
      <MapIcon className="size-5" /><CompassIcon className="size-5" /><StarIcon className="size-5" />
    </Glass>
    <BackgroundExtension src="/showcase/alpine.jpg" alt="Mountain peaks above a lake" start={64} end={64} className="h-64">
      <div className="relative flex h-full items-end bg-linear-to-t from-background/80 to-transparent p-pad"><h3 className="type-title-2 font-semibold">A quieter place</h3></div>
    </BackgroundExtension>
    <Glass variant="liquid" className="relative z-10 flex flex-col items-center gap-4 rounded-none py-pad" aria-hidden>
      <InfoIcon className="size-5" /><ShareIcon className="size-5" />
    </Glass>
  </div>
}
