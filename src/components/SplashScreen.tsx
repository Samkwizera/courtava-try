import { useEffect, useState } from "react";
import courtavaLogo from "@/assets/courtava-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const BasketballIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" fill="#EA580C" stroke="#111827" strokeWidth="1.4" />
    <path
      d="M2 20h36M20 1v38M6.5 6.5c4.6 4.6 4.6 22.4 0 27M33.5 6.5c-4.6 4.6-4.6 22.4 0 27"
      stroke="#111827"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

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
      <div className="animate-fade-in flex flex-col items-center gap-5">
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
        <p className="text-primary-foreground/80 text-sm -mt-3">
          Find your court. Build your squad.
        </p>

        {/* Bouncing basketball */}
        <div className="flex flex-col items-center pt-4" style={{ height: 96 }}>
          <div className="animate-ball-bounce" style={{ width: 34, height: 34 }}>
            <div className="animate-ball-spin w-full h-full">
              <BasketballIcon />
            </div>
          </div>
          <div
            className="animate-ball-shadow"
            style={{ width: 26, height: 7, borderRadius: "50%", background: "#000" }}
          />
        </div>
      </div>
    </div>
  );
}
