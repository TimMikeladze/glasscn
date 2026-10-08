import type { ComponentType } from "react"

import ActivityRings from "./activity-rings"
import Analytics01 from "./analytics-01"
import Auth01 from "./auth-01"
import Avatar from "./avatar"
import Chat from "./chat"
import Chat01 from "./chat-01"
import Aurora from "./aurora"
import Badge from "./badge"
import Button from "./button"
import Card from "./card"
import Checkbox from "./checkbox"
import DataTable from "./data-table"
import Dashboard01 from "./dashboard-01"
import Dialog from "./dialog"
import Dock from "./dock"
import DropdownMenu from "./dropdown-menu"
import Glass from "./glass"
import GroupedList from "./grouped-list"
import BarList from "./bar-list"
import CategoryBar from "./category-bar"
import Gauge from "./gauge"
import Heatmap from "./heatmap"
import LineChart from "./line-chart"
import Chart from "./chart"
import AreaChart from "./area-chart"
import BarChart from "./bar-chart"
import DonutChart from "./donut-chart"
import Tracker from "./tracker"
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
import Table from "./table"
import Tabs from "./tabs"
import Textarea from "./textarea"
import ThemeScope from "./theme-scope"
import Typography from "./typography"
import Prose from "./prose"
import Toaster from "./toaster"
import Tooltip from "./tooltip"

/** One live example per documented item. Their source is the "Usage" on each page. */
export const demos: Record<string, ComponentType> = {
  aurora: Aurora,
  glass: Glass,
  card: Card,
  "theme-scope": ThemeScope,
  typography: Typography,
  prose: Prose,
  button: Button,
  badge: Badge,
  input: Input,
  textarea: Textarea,
  label: Label,
  switch: Switch,
  checkbox: Checkbox,
  "segmented-control": SegmentedControl,
  tabs: Tabs,
  slider: Slider,
  progress: Progress,
  kbd: Kbd,
  separator: Separator,
  avatar: Avatar,
  dialog: Dialog,
  sheet: Sheet,
  popover: Popover,
  tooltip: Tooltip,
  "dropdown-menu": DropdownMenu,
  toaster: Toaster,
  dock: Dock,
  "grouped-list": GroupedList,
  chat: Chat,
  "activity-rings": ActivityRings,
  "progress-ring": ProgressRing,
  sparkline: Sparkline,
  stat: Stat,
  heatmap: Heatmap,
  chart: Chart,
  "area-chart": AreaChart,
  "bar-chart": BarChart,
  "line-chart": LineChart,
  "donut-chart": DonutChart,
  table: Table,
  "data-table": DataTable,
  "bar-list": BarList,
  gauge: Gauge,
  tracker: Tracker,
  "category-bar": CategoryBar,
  "dashboard-01": Dashboard01,
  "analytics-01": Analytics01,
  "settings-01": Settings01,
  "auth-01": Auth01,
  "chat-01": Chat01,
}
