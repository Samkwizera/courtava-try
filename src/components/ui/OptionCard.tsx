import { type ReactNode } from "react";

interface OptionCardProps {
  label: string;
  sub?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  /**
   * Selected treatment.
   * `ink`   — solid inverted fill, for primary either/or choices.
   * `green` — soft brand tint, for confirming/scheduling choices.
   */
  tone?: "ink" | "green";
  /** Leading visual: a level meter, icon, or emoji. */
  leading?: ReactNode;
  /** Show the trailing radio dot. */
  radio?: boolean;
  /** `stack` centers label over sub; `row` lays them out beside the leading slot. */
  layout?: "stack" | "row";
}

/**
 * A selectable option card — label plus supporting line.
 *
 * Replaces the `<div onClick>` cards that Onboarding and Create Game each
 * rolled by hand. Those were not focusable or keyboard-operable and re-derived
 * their selected colors inline; this renders a real radio button and takes its
 * colors from the theme, so it inverts correctly in dark mode.
 */
export function OptionCard({
  label,
  sub,
  selected = false,
  onClick,
  tone = "ink",
  leading,
  radio = false,
  layout = "stack",
}: OptionCardProps) {
  const selectedClasses =
    tone === "green"
      ? "bg-secondary text-secondary-foreground border-primary"
      : "bg-foreground text-background border-transparent";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`ios-tap w-full rounded-2xl border p-3 transition-colors ${
        selected ? selectedClasses : "bg-card text-foreground border-border hover:bg-muted/50"
      } ${layout === "row" ? "flex items-center gap-3.5 px-4 py-3.5 text-left" : "text-center"}`}
    >
      {leading && <span className="shrink-0">{leading}</span>}

      <span className={layout === "row" ? "flex-1 min-w-0" : "block"}>
        <span className="block text-13 font-semibold">{label}</span>
        {sub && (
          <span className="block text-11 opacity-70 mt-0.5 truncate">{sub}</span>
        )}
      </span>

      {radio && (
        <span
          className={`shrink-0 grid place-items-center rounded-full border-2 ${
            selected ? "border-current" : "border-border"
          }`}
          style={{ width: 20, height: 20 }}
          aria-hidden
        >
          {selected && (
            <span
              className="rounded-full bg-current"
              style={{ width: 10, height: 10 }}
            />
          )}
        </span>
      )}
    </button>
  );
}
