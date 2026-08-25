import { type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  /** Accepts a node so titles can carry emphasis spans. Omit for an
   *  actions-only bar (Profile leads with an avatar block instead). */
  title?: ReactNode;
  /** Small meta line above the title — "ACTIVITY", "TUE · 11:01 AM". */
  eyebrow?: ReactNode;
  /** Show a back chevron. Pass a path to force a destination, else goes back. */
  back?: boolean | string;
  /** Trailing controls — buttons, toggles, avatars. */
  actions?: ReactNode;
  /**
   * Stick to the top on scroll with a glass background. Default true.
   * Feed-style pages that scroll their title away pass `sticky={false}`.
   */
  sticky?: boolean;
  /** Secondary row under the title: search field, filter chips, tabs. */
  children?: ReactNode;
}

/**
 * The single page header.
 *
 * Replaces ten hand-rolled variants that disagreed on background
 * (`glass-nav` vs `bg-background` vs none), z-index (10 vs 40), title size,
 * and top inset (`safe-top` vs a hardcoded `70px`) — which is what made
 * screens feel unrelated. Every page should use this rather than composing
 * its own header.
 */
export function PageHeader({
  title,
  eyebrow,
  back,
  actions,
  sticky = true,
  children,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={
        sticky
          ? "sticky top-0 z-40 glass-nav safe-top"
          : "safe-top bg-transparent"
      }
      style={sticky ? { boxShadow: "inset 0 -0.5px 0 0 hsl(var(--border))" } : undefined}
    >
      <div className={sticky ? "px-4 pt-2 pb-3" : "px-5 pt-6 pb-3"}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            {back && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Go back"
                onClick={() => (typeof back === "string" ? navigate(back) : navigate(-1))}
                className="shrink-0 -ml-2 ios-tap"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            {(title || eyebrow) && (
              <div className="min-w-0">
                {eyebrow && <div className="type-label mb-1">{eyebrow}</div>}
                {title && (
                  <h1
                    className={`text-foreground ${back ? "ios-title truncate" : "ios-large-title"}`}
                  >
                    {title}
                  </h1>
                )}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </header>
  );
}
