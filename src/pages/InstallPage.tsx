import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import courtavaLogo from "@/assets/courtava-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
          <img src={courtavaLogo} alt="Courtava" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Already Installed!</h1>
        <p className="text-muted-foreground mb-6">
          Courtava is installed on your device. Open it from your home screen.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Go to App
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center safe-top safe-bottom">
      {/* Logo */}
      <div className="w-24 h-24 rounded-3xl gradient-hero flex items-center justify-center shadow-button mb-6">
        <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center">
          <img src={courtavaLogo} alt="Courtava" className="w-16 h-16 object-contain" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Install Courtava</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        Add Courtava to your home screen for the best experience
      </p>

      {/* Install Button (Android/Desktop) */}
      {deferredPrompt && (
        <Button size="lg" onClick={handleInstall} className="w-full max-w-xs mb-4">
          <Download className="w-5 h-5" />
          Install App
        </Button>
      )}

      {/* iOS Instructions */}
      {isIOS && (
        <div className="bg-secondary rounded-2xl p-6 max-w-xs w-full">
          <h3 className="font-semibold text-foreground mb-4">Install on iPhone/iPad</h3>
          <ol className="text-left space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              <span>Tap the <Share className="w-4 h-4 inline text-primary" /> Share button at the bottom of Safari</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              <span>Scroll down and tap "Add to Home Screen"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              <span>Tap "Add" in the top right corner</span>
            </li>
          </ol>
        </div>
      )}

      {/* Desktop/non-supported browser message */}
      {!deferredPrompt && !isIOS && (
        <div className="bg-secondary rounded-2xl p-6 max-w-xs w-full">
          <p className="text-sm text-muted-foreground">
            Open this page on your mobile device to install Courtava, or use Chrome/Edge on desktop.
          </p>
        </div>
      )}

      {/* Skip link */}
      <Button variant="ghost" className="mt-6" onClick={() => window.location.href = "/"}>
        Continue to Web App
      </Button>
    </div>
  );
}
