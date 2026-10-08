/** `1.7k` past a thousand, the plain number below it — GitHub's own rounding. */
export function formatStars(count: number) {
  if (count < 1000) return String(count)
  const thousands = count / 1000
  return `${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1)}k`
}
