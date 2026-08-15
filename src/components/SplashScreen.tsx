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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-500 overflow-hidden ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        src="/splash-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/60" />

      <div className="relative animate-fade-in flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-xl bg-card flex items-center justify-center overflow-hidden">
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
      <div className="absolute bottom-20 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground/40"
          />
        ))}
      </div>
    </div>
  );
}
