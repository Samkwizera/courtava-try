import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { haptic } from "@/lib/haptics";

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
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!selected) haptic("selection");
        onClick?.();
      }}
      aria-pressed={selected}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 30 }}
      className={`relative isolate inline-flex items-center gap-1.5 shrink-0 overflow-hidden rounded-full border px-3 py-1.5 text-13 font-semibold transition-colors ${
        selected
          ? "text-background border-transparent"
          : "bg-card text-muted-foreground border-border hover:bg-muted/60"
      }`}
    >
      {selected && (
        <motion.span
          className="absolute inset-0 -z-10 bg-foreground"
          style={{ borderRadius: 999 }}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 460, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">{icon}{children}</span>
      {count !== undefined && (
        <span
          className={`ml-0.5 rounded-full px-1.5 text-11 font-bold tabular-nums ${
            selected ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
