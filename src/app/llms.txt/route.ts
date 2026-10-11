import { llmsTxt } from "@/lib/llms"

/** https://llmstxt.org — prerendered at build (no request data), regenerated with each deploy. */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
