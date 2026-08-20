import { useEffect, useRef } from "react";

const MAX_TILT = 10;

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;

    const setTilt = (rotateX: number, rotateY: number, scale: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * MAX_TILT * 2;
      const rotateX = (0.5 - py) * MAX_TILT * 2;
      setTilt(rotateX, rotateY, 1.02);
    };

    const reset = () => {
      el.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      setTilt(6, -8, 1);
      window.setTimeout(() => {
        el.style.transition = "";
      }, 500);
    };

    const handlePointerDown = (e: PointerEvent) => {
      el.style.transition = "none";
      el.setPointerCapture(e.pointerId);
      handlePointerMove(e);
    };

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", reset);
    el.addEventListener("pointercancel", reset);
    el.addEventListener("pointerleave", reset);

    // Resting tilt, matches the previous static CSS treatment
    reset();

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", reset);
      el.removeEventListener("pointercancel", reset);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);

  return ref;
}
