import { DocsNav } from "@/components/site/docs-nav"

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 pt-8 sm:px-6">
      <aside className="sticky top-24 hidden h-[calc(100dvh-7rem)] w-56 shrink-0 md:block">
        <div className="glass h-full overflow-y-auto rounded-3xl p-3 [--glass-elevation:0_0_#0000]">
          <DocsNav />
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-12">{children}</main>
    </div>
  )
}
