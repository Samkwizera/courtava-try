import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

/**
 * Pins `pinned` in place while the user scrolls through this section's
 * height, revealing `children` as they scroll past — the classic
 * "product feature reveal" pattern. Purely additive: it wraps existing
 * markup in a taller scroll track, it doesn't restyle what's inside.
 *
 * Falls back to a normal (non-pinned, non-scaling) stack for users with
 * prefers-reduced-motion.
 */
interface PinRevealProps {
  pinned: ReactNode;
  children: ReactNode;
  /** how much extra scroll room the pin gets, in viewport-heights. Default 1 (i.e. 200vh track). */
  trackHeight?: number;
  className?: string;
}

export function PinReveal({ pinned, children, trackHeight = 1, className }: PinRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const pinnedOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const pinnedScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {pinned}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={className}
      style={{ position: "relative", minHeight: `${100 * (1 + trackHeight)}vh` }}
    >
      <motion.div
        style={{
          position: "sticky",
          top: 0,
          opacity: pinnedOpacity,
          scale: pinnedScale,
        }}
      >
        {pinned}
      </motion.div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
