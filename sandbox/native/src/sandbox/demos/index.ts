import { demos as basics } from "@/sandbox/demos/basics"
import { demos as composite } from "@/sandbox/demos/composite"
import { demos as controls } from "@/sandbox/demos/controls"
import { demos as data } from "@/sandbox/demos/data"
import { demos as forms } from "@/sandbox/demos/forms"
import { demos as navigation } from "@/sandbox/demos/navigation"
import { demos as overlays } from "@/sandbox/demos/overlays"

/** Every ported component's demo, keyed by registry name (without `native-`). */
export const DEMOS = { ...basics, ...controls, ...forms, ...overlays, ...navigation, ...data, ...composite }
