import { useEffect, useState } from "react";
import courtavaLogo from "@/assets/courtava-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-fade-in flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-2xl bg-card shadow-lg flex items-center justify-center overflow-hidden">
          <img
            src={courtavaLogo}
            alt="Courtava"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">
          Courtava
        </h1>
        <p className="text-primary-foreground/80 text-sm">
          Find your court. Build your squad.
        </p>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-20 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
