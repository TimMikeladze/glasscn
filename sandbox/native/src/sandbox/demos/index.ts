import { demos as basics } from "@/sandbox/demos/basics"
import { demos as composite } from "@/sandbox/demos/composite"
import { demos as controls } from "@/sandbox/demos/controls"
import { demos as data } from "@/sandbox/demos/data"
import { demos as overlays } from "@/sandbox/demos/overlays"

/** Every ported component's demo, keyed by registry name (without `native-`). */
export const DEMOS = { ...basics, ...controls, ...overlays, ...data, ...composite }
