"use client"

import { BackgroundExtension } from "@/components/glass/background-extension"
import { Glass } from "@/components/glass/glass"

export default function BackgroundExtensionDemo() {
  return <div className="relative isolate grid w-full grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] overflow-hidden rounded-surface">
    <Glass variant="liquid" className="relative z-10 rounded-none" aria-hidden />
    <BackgroundExtension src="/showcase/alpine.jpg" alt="Mountain peaks above a lake" start={56} end={56} className="h-64">
      <div className="relative flex h-full items-end bg-linear-to-t from-background/80 to-transparent p-pad"><h3 className="type-title-2 font-semibold">A quieter place</h3></div>
    </BackgroundExtension>
    <Glass variant="liquid" className="relative z-10 rounded-none" aria-hidden />
  </div>
}
