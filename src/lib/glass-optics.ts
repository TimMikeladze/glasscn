export type LensGeometry = { width: number; height: number; radius: number; bezel: number }

const positive = (value: number, fallback: number) => Number.isFinite(value) && value > 0 ? value : fallback

/** Geometry only: no backdrop pixels are read. The 180k-pixel cap bounds map generation cost. */
export function lensGeometry(input: LensGeometry): LensGeometry {
  const width = Math.max(1, Math.round(positive(input.width, 1)))
  const height = Math.max(1, Math.round(positive(input.height, 1)))
  const ratio = Math.min(1, Math.sqrt(180_000 / (width * height)))
  const w = Math.max(1, Math.floor(width * ratio))
  const h = Math.max(1, Math.floor(height * ratio))
  const limit = Math.min(w, h) / 2
  return {
    width: w,
    height: h,
    radius: Math.min(limit, Number.isFinite(input.radius) ? Math.max(0, input.radius * ratio) : limit),
    bezel: Math.min(limit, positive(input.bezel, 12) * ratio),
  }
}

/**
 * glasscn's rounded convex lens approximation, not Apple's unpublished shader.
 * RG encode inward displacement; the interior and pixels outside the shape stay neutral.
 * A circular bezel profile supplies surface normals; Snell's law (index 1.5) bends them.
 */
export function createLensMap(input: LensGeometry) {
  const geometry = lensGeometry(input)
  const { width, height, radius, bezel } = geometry
  const data = new Uint8ClampedArray(width * height * 4)
  const halfW = width / 2
  const halfH = height / 2
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - halfW
      const dy = y + 0.5 - halfH
      const qx = Math.abs(dx) - halfW + radius
      const qy = Math.abs(dy) - halfH + radius
      const cx = Math.max(qx, 0)
      const cy = Math.max(qy, 0)
      const cornerDistance = Math.hypot(cx, cy)
      const distance = -(cornerDistance + Math.min(Math.max(qx, qy), 0) - radius)
      let bendX = 0
      let bendY = 0
      if (distance > 0 && distance < bezel) {
        const t = distance / bezel
        const profile = Math.sqrt(1 - (1 - t) ** 2)
        const incident = Math.atan2(1 - t, profile)
        const transmitted = Math.asin(Math.sin(incident) / 1.5)
        const bend = Math.min(1, Math.sin(incident - transmitted) * profile * 2.8)
        const normalX = cornerDistance > 0 ? cx / cornerDistance : qx > qy ? 1 : 0
        const normalY = cornerDistance > 0 ? cy / cornerDistance : qx > qy ? 0 : 1
        bendX = -Math.sign(dx) * normalX * bend
        bendY = -Math.sign(dy) * normalY * bend
      }
      const i = (y * width + x) * 4
      data[i] = Math.round(128 + bendX * 127)
      data[i + 1] = Math.round(128 + bendY * 127)
      data[i + 2] = 128
      data[i + 3] = 255
    }
  }
  return { ...geometry, data }
}
