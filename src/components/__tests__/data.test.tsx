// Behaviour of the data components: roles, text alternatives, states and the data table's modes.
import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ChartDataTable, ChartState, ChartSummary } from "@/components/glass/chart"
import { createDataTableColumnHelper, DataTable } from "@/components/glass/data-table"
import { Kpi } from "@/components/glass/kpi"
import { RangeChart } from "@/components/glass/range-chart"
import { StatValue } from "@/components/glass/stat"
import { fromInteractive } from "@/lib/glass-charts"

type Day = { day: string; steps: number | null }
const days: Day[] = [
  { day: "Mon", steps: 4000 },
  { day: "Tue", steps: null },
  { day: "Wed", steps: 9000 },
]
const series = [{ id: "steps", label: "Steps", value: (d: Day) => d.steps }]

describe("chart text alternatives", () => {
  it("ChartDataTable is a real table with a row per datum and a dash for gaps", () => {
    render(<ChartDataTable data={days} x={(d) => d.day} xLabel="Day" series={series} caption="Steps this week" />)
    const table = screen.getByRole("table", { name: "Steps this week" })
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(4)
    expect(within(rows[2]).getByRole("rowheader").textContent).toBe("Tue")
    expect(rows[2].textContent).toContain("–")
  })

  it("ChartSummary says low, high, latest and trend", () => {
    render(<ChartSummary data={days} series={series} />)
    expect(screen.getByText(/Steps: 2 values, low 4,000, high 9,000, latest 9,000, trending up\./)).toBeTruthy()
  })

  it("ChartState: loading is a busy status, error is an alert with a retry", () => {
    const retry = vi.fn()
    const { rerender } = render(<ChartState state="loading" />)
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true")
    rerender(<ChartState state="error" onRetry={retry} />)
    fireEvent.click(within(screen.getByRole("alert")).getByRole("button", { name: "Retry" }))
    expect(retry).toHaveBeenCalledOnce()
    rerender(<ChartState state="empty" />)
    expect(screen.getByRole("status").textContent).toContain("No data for this range")
  })
})

describe("Kpi", () => {
  it("colours the trend by whether the direction is good", () => {
    const { container, rerender } = render(<Kpi label="Resting HR" value={58} trend={{ value: -0.05, good: "down" }} />)
    const trend = () => container.querySelector("[data-slot=stat-trend]")!
    expect(trend().getAttribute("data-direction")).toBe("down")
    expect(trend().getAttribute("data-sentiment")).toBe("positive")
    rerender(<Kpi label="Steps" value={58} trend={{ value: -0.05 }} />)
    expect(trend().getAttribute("data-sentiment")).toBe("negative")
    rerender(<Kpi label="Steps" value={12480} locale="en-US" />)
    expect(screen.getByText("12.5K")).toBeTruthy()
  })

  it("shows a busy skeleton while loading", () => {
    render(<Kpi label="Steps" value={0} loading />)
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true")
  })
})

describe("StatValue", () => {
  it("puts text into title so a truncated figure can be read", () => {
    render(<StatValue>1,234,567</StatValue>)
    expect(screen.getByText("1,234,567").getAttribute("title")).toBe("1,234,567")
  })
})

describe("RangeChart", () => {
  it("is a list that reads low, high and now per row", () => {
    render(<RangeChart data={[{ d: "Mon", lo: 6, hi: 12, now: 9 }]} label={(r) => r.d} low={(r) => r.lo} high={(r) => r.hi} current={(r) => r.now} valueFormat={(v) => `${v}°`} />)
    const item = screen.getByRole("listitem")
    expect(item.textContent).toContain("low 6°, high 12°, now 9°")
  })
})

type Session = { id: string; activity: string; minutes: number }
const sessions: Session[] = Array.from({ length: 12 }, (_, i) => ({ id: String(i), activity: i % 2 ? "Run" : "Yoga", minutes: 20 + i }))
const col = createDataTableColumnHelper<Session>()
const columns = col.columns([
  col.accessor("activity", { header: "Activity", filterFn: "arrIncludesSome", meta: { label: "Activity" } }),
  col.accessor("minutes", { header: "Minutes", meta: { numeric: true, label: "Minutes" } }),
  col.display({ id: "open", cell: ({ row }) => <a href={`#${row.original.id}`}>Open</a> }),
])

describe("DataTable", () => {
  it("row click ignores links inside the row; Enter and Space activate the row", () => {
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} data={sessions} getRowId={(s) => s.id} onRowClick={onRowClick} />)
    const body = screen.getAllByRole("rowgroup")[1]
    const first = within(body).getAllByRole("row")[0]
    fireEvent.click(within(first).getByRole("link", { name: "Open" }))
    expect(onRowClick).not.toHaveBeenCalled()
    fireEvent.click(within(first).getAllByRole("cell")[0])
    fireEvent.keyDown(first, { key: " " })
    fireEvent.keyDown(first, { key: "Enter" })
    expect(onRowClick).toHaveBeenCalledTimes(3)
  })

  it("paginates by pageSize and reports controlled pagination changes", () => {
    const onStateChange = vi.fn()
    render(<DataTable columns={columns} data={sessions} pageSize={5} state={{ pagination: { pageIndex: 0, pageSize: 5 } }} onStateChange={onStateChange} />)
    expect(within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row")).toHaveLength(5)
    fireEvent.click(screen.getByRole("button", { name: "Next page" }))
    expect(onStateChange).toHaveBeenCalledWith({ pagination: { pageIndex: 1, pageSize: 5 } })
  })

  it("manual mode shows the rows it's given and pages by rowCount", () => {
    render(<DataTable columns={columns} data={sessions.slice(0, 3)} pageSize={3} manual rowCount={30} />)
    expect(within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row")).toHaveLength(3)
    expect(screen.getByText("Page 1 of 10")).toBeTruthy()
  })

  it("loading renders skeleton rows; error renders an alert with retry", () => {
    const retry = vi.fn()
    const { rerender } = render(<DataTable columns={columns} data={[]} loading />)
    expect(screen.getByText("Loading rows")).toBeTruthy()
    rerender(<DataTable columns={columns} data={[]} error="Couldn't load sessions" onRetry={retry} />)
    fireEvent.click(within(screen.getByRole("alert")).getByRole("button", { name: "Retry" }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it("translates its strings", () => {
    render(<DataTable columns={columns} data={sessions} labels={{ next: "Suivante", rows: (n) => `${n} lignes` }} />)
    expect(screen.getByRole("button", { name: "Suivante" })).toBeTruthy()
  })
})

describe("fromInteractive", () => {
  it("finds an interactive ancestor between the target and the row", () => {
    const row = document.createElement("tr")
    row.innerHTML = `<td><button><span id="in">x</span></button></td><td id="plain">y</td>`
    expect(fromInteractive(row.querySelector("#in"), row)).toBe(true)
    expect(fromInteractive(row.querySelector("#plain"), row)).toBe(false)
  })
})
