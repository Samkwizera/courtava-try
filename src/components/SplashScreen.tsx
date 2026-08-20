import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

// Exact spec (reverse-engineered from reference recording):
// t=0-250ms fade in, t=250-1900ms bar fills, t~2000ms hold, then transition out.
const FADE_IN_MS = 250;
const FILL_MS = 1650;
const HOLD_MS = 100;
const FADE_OUT_MS = 250;

const BG = "#69B928";
const TRACK = "#A1D961";

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [filled, setFilled] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Committed on first paint as false, then flipped — guarantees the
    // opacity transition actually animates instead of snapping to 1.
    setVisible(true);

    const startFill = setTimeout(() => setFilled(true), FADE_IN_MS);
    const startFadeOut = setTimeout(() => setFadeOut(true), FADE_IN_MS + FILL_MS + HOLD_MS);
    const complete = setTimeout(
      () => onComplete(),
      FADE_IN_MS + FILL_MS + HOLD_MS + FADE_OUT_MS
    );

    return () => {
      clearTimeout(startFill);
      clearTimeout(startFadeOut);
      clearTimeout(complete);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: BG,
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 14,
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_IN_MS}ms ease-out`,
        }}
      >
        <h1
          className="font-wordmark"
          style={{
            whiteSpace: "nowrap",
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#FFFFFF",
            margin: 0,
          }}
        >
          Courtava
        </h1>

        <div
          style={{
            width: "100%",
            height: 3.5,
            borderRadius: 999,
            background: TRACK,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: filled ? "100%" : "0%",
              borderRadius: 999,
              background: "#FFFFFF",
              transition: `width ${FILL_MS}ms ease-in-out`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
