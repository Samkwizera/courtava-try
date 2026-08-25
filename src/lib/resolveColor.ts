/**
 * Resolve a CSS color expression to a concrete `rgba()` string.
 *
 * Canvas-based renderers (Mapbox GL) cannot read CSS custom properties, and
 * their color parsers do not understand `oklch()`.
 *
 * Two steps are needed, and neither alone is enough:
 *  1. `getComputedStyle` resolves `var(--x)` against `:root` — but modern
 *     Chrome *preserves* the original color space, so this still hands back
 *     `oklch(...)`. Assigning to `canvas.fillStyle` does not convert it either.
 *  2. So we rasterize a single pixel and read it back, which forces the
 *     browser through its real color pipeline and yields true sRGB bytes.
 *
 * Call this at paint time, not at module load — the value depends on the
 * active theme, so a cached module-level constant would freeze the light
 * palette into dark mode.
 */
export function resolveColor(cssValue: string, fallback = "rgba(0, 0, 0, 1)"): string {
  if (typeof document === "undefined") return fallback;

  // 1. Resolve custom properties via the cascade.
  const probe = document.createElement("span");
  probe.style.color = cssValue;
  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  if (!computed) return fallback;

  // 2. Rasterize to force conversion out of oklch/lab into sRGB bytes.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return computed;

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);

  try {
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  } catch {
    // getImageData can throw in locked-down contexts; the computed value is
    // still better than the fallback.
    return computed;
  }
}

/** Resolve several tokens at once, preserving the key names. */
export function resolveColors<T extends Record<string, string>>(
  tokens: T,
): Record<keyof T, string> {
  const out = {} as Record<keyof T, string>;
  for (const key in tokens) out[key] = resolveColor(tokens[key]);
  return out;
}
