import { createCn } from "cn/config"

/** Named glass tokens participate in Tailwind's normal last-class-wins groups. */
export const cn = createCn({
  extend: {
    theme: {
      radius: ["surface", "surface-sm", "control", "control-sm", "control-xs", "button", "badge", "concentric"],
      spacing: ["control-2xs", "control-xs", "control-sm", "control", "control-lg", "knob", "pad-xs", "pad-sm", "pad", "pad-lg", "card", "card-sm"],
    },
  },
})
