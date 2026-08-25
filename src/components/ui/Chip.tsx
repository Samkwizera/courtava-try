import { type ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  /** Leading glyph or icon. */
  icon?: ReactNode;
  /** Trailing count badge. */
  count?: number;
}

/**
 * Selectable filter / segment chip.
 *
 * Every page had its own version of this — same shape, but each one
 * re-derived the selected colors inline (`background: x ? C.ink : "#fff"`),
 * which is where the hardcoded whites that broke dark mode came from.
 */
export function Chip({ children, selected = false, onClick, icon, count }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`ios-tap inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-13 font-semibold transition-colors ${
        selected
          ? "bg-foreground text-background border-transparent"
          : "bg-card text-muted-foreground border-border hover:bg-muted/60"
      }`}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          className={`ml-0.5 rounded-full px-1.5 text-11 font-bold tabular-nums ${
            selected ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
