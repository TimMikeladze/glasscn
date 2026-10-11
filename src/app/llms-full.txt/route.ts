import { llmsFullTxt } from "@/lib/llms"

/** llms.txt plus every item's props, notes and usage, and the design rules. Prerendered at build. */
export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
