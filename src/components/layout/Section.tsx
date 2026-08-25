import { type ReactNode } from "react";

interface SectionProps {
  /** Uppercase section label. Omit for an unlabelled group. */
  label?: string;
  /** Trailing control on the label row — usually a "See all" link. */
  action?: ReactNode;
  /** Wrap children in a grouped card surface (iOS inset-grouped style). */
  grouped?: boolean;
  children: ReactNode;
}

/**
 * A labelled page section with consistent vertical rhythm.
 *
 * Pages previously hand-wrote this with `mb-3` / `mb-2` / `marginBottom: 10`
 * and three different label treatments, so no two screens lined up.
 */
export function Section({ label, action, grouped, children }: SectionProps) {
  return (
    <section className="mb-6">
      {(label || action) && (
        <div className="flex items-end justify-between mb-2 px-1">
          {label && <h2 className="type-label">{label}</h2>}
          {action}
        </div>
      )}
      {grouped ? <div className="ios-group">{children}</div> : children}
    </section>
  );
}
