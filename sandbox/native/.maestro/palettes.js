// Every palette × scheme for screenshots.yaml — keep in step with PALETTE_NAMES (tokens.generated.ts).
const palettes = ["dusk", "ocean", "rose", "sage", "amber", "graphite", "lavender", "mint", "cherry", "lagoon", "sand", "midnight"]
output.shots = []
palettes.forEach((palette) => ["light", "dark"].forEach((scheme) => output.shots.push({ palette, scheme })))
output.i = 0
