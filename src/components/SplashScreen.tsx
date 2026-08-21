import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const WORD = "Courtava";

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800);
    const timer2 = setTimeout(() => onComplete(), 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">
          {WORD.split("").map((letter, i) => (
            <span
              key={i}
              className="animate-letter-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {letter}
            </span>
          ))}
        </h1>

        <div className="w-32 h-1 rounded-full bg-primary-foreground/25 overflow-hidden">
          <div className="h-full w-full rounded-full bg-primary-foreground animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
