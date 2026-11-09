# Reset saved site settings

Reset the site's saved palette, custom CSS, next-themes scheme and glass preferences once when a visitor next loads the site, including the landing page. Run before the existing palette and glass-preference scripts so stale settings never reach the first paint.

Store a settings version in localStorage. A missing or older version removes the four known settings and records the current version. Later loads preserve new choices. Storage access failures must not prevent rendering. This affects the docs site only; installed registry components keep their existing storage behavior.

Deploying a new build publishes new fingerprinted Next.js assets. No service worker or Cache Storage is used by this site. The reset takes effect when a browser loads the new deployment; already open pages keep their current state until navigation or reload.

1. Add regression coverage for old settings, later choices and unavailable storage.
2. Prepend the versioned reset to the site's existing before-paint script; update browser theme fixtures to represent choices saved after the reset.
3. Run typecheck, lint, unit and browser checks; push main and confirm CI and production.
