import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

/**
 * Fades in + translates up ~20px as the element enters the viewport.
 * Wrap existing markup with this — it never touches styling, only adds motion.
 * Accepts `style`/`className` purely as passthrough so it can stand in for
 * a plain wrapper div without altering the layout it wraps.
 */

export const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;

interface ScrollRevealProps {
  children: ReactNode;
  /** ms, applied as a CSS-style delay (converted to seconds internally) */
  delay?: number;
  /** ms, defaults to 600 (within the 400-800ms range) */
  duration?: number;
  /** px, defaults to 20 */
  distance?: number;
  /** re-trigger every time the element enters view (default: only once) */
  repeat?: boolean;
  /** fraction of the element that must be visible to trigger, default 0.15 */
  amount?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "li";
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 600,
  distance = 20,
  repeat = false,
  amount = 0.15,
  className,
  style,
  as = "div",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : duration / 1000,
        delay: prefersReducedMotion ? 0 : delay / 1000,
        ease: EASE_SETTLE,
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
