type HapticPattern = "selection" | "success" | "warning" | "error";

const patterns: Record<HapticPattern, number | number[]> = {
  selection: 8,
  success: [12, 45, 18],
  warning: [18, 55, 18],
  error: [28, 45, 28],
};

/**
 * Progressive enhancement for installed/mobile PWAs. Unsupported browsers,
 * reduced-motion users, and background tabs simply receive no vibration.
 */
export function haptic(pattern: HapticPattern = "selection") {
  if (typeof window === "undefined" || document.visibilityState !== "visible") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate?.(patterns[pattern]);
}
