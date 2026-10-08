import { cn } from "cn"

/** A small glass lens with the accent ring — the glasscn mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-7 items-center justify-center rounded-full", className)} aria-hidden>
      <span className="glass absolute inset-0 rounded-full [--glass-elevation:0_0_#0000]" />
      <span className="absolute inset-[5px] rounded-full bg-[conic-gradient(from_200deg,var(--aurora-1),var(--aurora-2),var(--primary),var(--aurora-3),var(--aurora-1))] opacity-90" />
      <span className="absolute inset-[9px] rounded-full bg-white/70 dark:bg-white/30" />
    </span>
  )
}
