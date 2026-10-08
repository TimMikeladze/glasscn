import type { ComponentType } from "react"

import ActivityRings from "./activity-rings"
import Auth01 from "./auth-01"
import Aurora from "./aurora"
import Badge from "./badge"
import Button from "./button"
import Card from "./card"
import Dashboard01 from "./dashboard-01"
import Dialog from "./dialog"
import Dock from "./dock"
import DropdownMenu from "./dropdown-menu"
import Glass from "./glass"
import GroupedList from "./grouped-list"
import Heatmap from "./heatmap"
import Input from "./input"
import Kbd from "./kbd"
import Label from "./label"
import Popover from "./popover"
import Progress from "./progress"
import ProgressRing from "./progress-ring"
import SegmentedControl from "./segmented-control"
import Separator from "./separator"
import Settings01 from "./settings-01"
import Sheet from "./sheet"
import Slider from "./slider"
import Sparkline from "./sparkline"
import Stat from "./stat"
import Switch from "./switch"
import Tabs from "./tabs"
import Textarea from "./textarea"
import Toaster from "./toaster"
import Tooltip from "./tooltip"

/** One live example per documented item. Their source is the "Usage" on each page. */
export const demos: Record<string, ComponentType> = {
  aurora: Aurora,
  glass: Glass,
  card: Card,
  button: Button,
  badge: Badge,
  input: Input,
  textarea: Textarea,
  label: Label,
  switch: Switch,
  "segmented-control": SegmentedControl,
  tabs: Tabs,
  slider: Slider,
  progress: Progress,
  kbd: Kbd,
  separator: Separator,
  dialog: Dialog,
  sheet: Sheet,
  popover: Popover,
  tooltip: Tooltip,
  "dropdown-menu": DropdownMenu,
  toaster: Toaster,
  dock: Dock,
  "grouped-list": GroupedList,
  "activity-rings": ActivityRings,
  "progress-ring": ProgressRing,
  sparkline: Sparkline,
  stat: Stat,
  heatmap: Heatmap,
  "dashboard-01": Dashboard01,
  "settings-01": Settings01,
  "auth-01": Auth01,
}
