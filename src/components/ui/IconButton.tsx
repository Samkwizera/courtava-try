import { type ReactNode } from "react";

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /** Required — these buttons are icon-only, so they need an accessible name. */
  label: string;
  /**
   * `plain` — bordered card circle (in a header row).
   * `solid` — inverted fill, for a primary action.
   * `glass` — frosted, for floating over imagery or a map.
   */
  variant?: "plain" | "solid" | "glass";
  size?: number;
}

/**
 * Circular icon-only button.
 *
 * The same 38px bordered circle was hand-written in Profile (twice),
 * Court Details, Home, and Games, each re-specifying border, background and
 * cursor inline — and none of them carried an accessible name.
 */
export function IconButton({
  children,
  onClick,
  label,
  variant = "plain",
  size = 38,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`ios-tap grid place-items-center rounded-full cursor-pointer ${
        variant === "solid"
          ? "bg-foreground text-background border-0"
          : variant === "glass"
            ? "glass text-foreground border-0 shadow-card"
            : "bg-card text-muted-foreground border border-border"
      }`}
      style={{ width: size, height: size }}
    >
      {children}
    </button>
  );
}
