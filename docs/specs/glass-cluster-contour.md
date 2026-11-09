# Glass cluster contour that keeps up with its items

UX2-W10: while Landmarks badges reorder, the shared glass outline trails the badges by a frame or more, and at 320 ms it still shows the merged blob after the badges have split.

## Cause

`GlassCluster` measured its items every animation frame, built an SVG (rounded rects, Gaussian blur, alpha threshold) as a `data:` URL and passed it to React state, which set it as `mask-image`. Each frame therefore waited on a React render and an asynchronous image decode before the mask could paint, so the glass painted last frame's outline, or an older one.

## Approach

Trace the outline in script and write it straight to the DOM in the same `requestAnimationFrame` callback that measures the items.

- The union is a signed distance field: one rounded rectangle per item, joined with a polynomial smooth minimum whose width comes from `mergeDistance`. Items closer than that grow a neck between them, as the blur-and-threshold mask did.
- Marching squares on a 2 px grid trace the zero contour into a closed path. The surface gets `clip-path: path(evenodd, …)`.
- The rim is the same field traced twice, at the edge and 1.3 px inside it. The ring between the two clips the rim's light gradient (`path(evenodd, outer + inner)`), replacing the `feMorphology` erode.
- Surface and rim are always rendered and stay invisible until the first measurement. Geometry writes skip React, so per-frame updates cause no re-render. `data-shapes` on the surface records the measured item boxes for tests and debugging.

## Checks

- Unit: the tracer returns one loop for touching items, two for distant ones, and a ring for the rim.
- e2e: the existing cluster and morph coverage specs read `data-shapes` instead of decoding the mask. A new check reorders the badges and samples frames, confirming every item stays inside the clip path at each sample.
- Visual: the outline at rest is compared with the old mask in light and dark, on `/docs/glass-morph` and the showcase cluster.
