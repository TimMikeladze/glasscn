import type { PropRow } from "@/lib/docs"

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl [--glass-elevation:0_0_#0000]">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-glass-border">
            <th className="px-4 py-2.5 font-semibold">Prop</th>
            <th className="px-4 py-2.5 font-semibold">Type</th>
            <th className="px-4 py-2.5 font-semibold">Default</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-foreground/5 align-top last:border-0">
              <td className="px-4 py-3 font-mono text-[0.8rem] font-medium whitespace-nowrap text-primary">{r.name}</td>
              <td className="px-4 py-3">
                <code className="font-mono text-[0.78rem] break-words text-foreground/80">{r.type}</code>
                {r.description ? <p className="mt-1 text-xs text-muted-foreground">{r.description}</p> : null}
              </td>
              <td className="px-4 py-3 font-mono text-[0.78rem] whitespace-nowrap text-muted-foreground">{r.default ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
