import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CSSProperties, ReactNode } from "react";
import { EASE_SETTLE } from "./ScrollReveal";

/**
 * Wrap a list of children with <StaggerGroup> and each child with
 * <StaggerItem> to cascade them in as the group enters the viewport.
 * Pure motion wrapper — `style`/`className` are passthrough only, so
 * these can stand in for a plain flex/grid container without changing
 * its layout.
 */

interface StaggerGroupProps {
  children: ReactNode;
  /** ms between each child's animation start, default 80 (within 60-100ms) */
  stagger?: number;
  /** fraction of the group that must be visible to trigger, default 0.1 */
  amount?: number;
  repeat?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "ul" | "section";
}

export function StaggerGroup({
  children,
  stagger = 80,
  amount = 0.1,
  repeat = false,
  className,
  style,
  as = "div",
}: StaggerGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: prefersReducedMotion
        ? {}
        : { staggerChildren: stagger / 1000, delayChildren: 0 },
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
      variants={container}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  distance?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "li";
}

export function StaggerItem({
  children,
  distance = 20,
  duration = 600,
  className,
  style,
  as = "div",
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : duration / 1000,
        ease: EASE_SETTLE,
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag className={className} style={style} variants={item}>
      {children}
    </MotionTag>
  );
}
