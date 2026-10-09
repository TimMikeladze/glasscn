import { decodeTheme, themeToRegistryItem } from "@/lib/glass-theme"
import { itemUrl } from "@/lib/site"

/** A studio theme as a shadcn registry item, so `npx shadcn add <origin>/r/theme/<code>` installs it. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const theme = decodeTheme(code.replace(/\.json$/, ""))
  if (!theme) return Response.json({ error: "Unreadable theme code" }, { status: 400 })
  return Response.json(themeToRegistryItem(theme, "my-glass-theme", "My glass theme", { fontItemUrl: itemUrl }), {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  })
}
