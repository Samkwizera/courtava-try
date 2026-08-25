/**
 * Courtava design tokens — the single source of truth for colors used in
 * inline `style={{}}` props.
 *
 * Every value resolves to a CSS custom property defined in `src/index.css`,
 * so the whole palette follows the active theme (light / dark) automatically.
 * Never inline a raw color literal in a component — add it here instead.
 */
export const C = {
  /* Surfaces */
  bg: "hsl(var(--background))",
  surface: "hsl(var(--card))",

  /* Text — ink2 and ink3 are distinct steps, not aliases */
  ink: "hsl(var(--foreground))",
  ink2: "hsl(var(--ink-2))",
  ink3: "hsl(var(--ink-3))",

  /* Hairlines */
  hair: "hsl(var(--border))",
  hair2: "hsl(var(--muted))",

  /* Brand green */
  green: "var(--c-green)",
  greenSoft: "hsl(var(--secondary))",
  greenInk: "hsl(var(--secondary-foreground))",

  /* Status */
  amber: "var(--c-amber)",
  red: "var(--c-red)",

  /* Foreground colors for text/icons sitting ON a filled surface.
     Use these instead of "#fff" — a hardcoded white is invisible on a
     light-green fill once the theme flips. */
  onGreen: "hsl(var(--primary-foreground))",
  onInk: "hsl(var(--background))",

  /* Scrims over imagery/maps, where content must stay legible in both themes */
  scrim: "var(--c-scrim)",
  scrimStrong: "var(--c-scrim-strong)",
  overlayInk: "var(--c-overlay-ink)",

  /* Always-light text. Only for content on a ground that is dark in BOTH
     themes — a dark scrim badge, or initials on a saturated avatar fill. */
  onOverlay: "#ffffff",

  /* Soft tints for icon chips */
  redTint: "var(--c-red-tint)",
  amberTint: "var(--c-amber-tint)",
} as const;

/**
 * Elevation. Always use these rather than an inline `rgba(0,0,0,…)` shadow —
 * a black shadow is invisible against a dark background, so the dark theme
 * redefines each ramp with its own depth.
 */
export const SHADOW = {
  card: "var(--shadow-card)",
  float: "var(--shadow-float)",
  nav: "var(--shadow-nav)",
} as const;

/** Bottom scrim behind a sticky CTA — fades to the page ground, not to white. */
export const FADE_UP = "var(--c-fade-up)";

/**
 * Type scale. Pick the nearest step — do NOT invent intermediate sizes.
 * 14/15/16 and 22/24/26 are perceptually identical at arm's length; having
 * all of them is what makes screens feel like they were built by three
 * different people.
 */
export const TEXT = {
  label: 11,     // uppercase section labels
  caption: 12,   // metadata, counts, timestamps
  subtitle: 13,  // secondary descriptive text
  body: 15,      // default body / control text
  title: 17,     // row + card titles
  section: 20,   // section headings
  headline: 24,  // page headlines
  large: 28,     // large titles
  display: 32,   // stat numerals
} as const;

/**
 * Radius scale. Four steps, matching the --radius base of 12px.
 * `pill` is for anything fully rounded.
 */
export const RADIUS = {
  chip: 8,   // inner chips, small icon tiles
  ctrl: 12,  // inputs, buttons, small controls
  card: 16,  // cards, sheets, grouped rows
  lg: 24,    // large surfaces (bottom nav, modals)
  pill: 99,
} as const;

/**
 * Spacing scale — a 4px grid. Use for inline padding/gap values.
 */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/**
 * Translucent ring colors for heat/status halos. These need real alpha, which
 * `hsl(var(--x))` cannot express, so they are their own theme-aware variables.
 */
export const RING = {
  green: "var(--c-green-ring)",
  amber: "var(--c-amber-ring)",
  neutral: "var(--c-neutral-ring)",
} as const;

export type ColorToken = keyof typeof C;
