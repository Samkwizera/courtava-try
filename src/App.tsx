import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SplashScreen } from "@/components/SplashScreen";
import HomePage from "@/pages/HomePage";
import CourtsPage from "@/pages/CourtsPage";
import GamesPage from "@/pages/GamesPage";
import PlayersPage from "@/pages/PlayersPage";
import ProfilePage from "@/pages/ProfilePage";
import InstallPage from "@/pages/InstallPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Check if this is the first visit or if on install page
const hasSeenSplash = () => {
  if (typeof window !== "undefined") {
    // Don't show splash on install page
    if (window.location.pathname === "/install") return true;
    return sessionStorage.getItem("courtava_splash_seen") === "true";
  }
  return false;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(!hasSeenSplash());

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("courtava_splash_seen", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/courts" element={<CourtsPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/install" element={<InstallPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
