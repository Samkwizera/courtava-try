import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SplashScreen } from "@/components/SplashScreen";
import HomePage from "@/pages/HomePage";
import { BackendEnvErrorScreen } from "@/components/BackendEnvErrorScreen";

// Lazy-load anything that (directly or indirectly) imports the backend client,
// so the app can render a helpful message if env vars aren't available yet.
const AuthProvider = lazy(() => import("@/hooks/useAuth").then((m) => ({ default: m.AuthProvider })));
const CourtsPage = lazy(() => import("@/pages/CourtsPage"));
const CourtDetailsPage = lazy(() => import("@/pages/CourtDetailsPage"));
const GamesPage = lazy(() => import("@/pages/GamesPage"));
const PlayersPage = lazy(() => import("@/pages/PlayersPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const InstallPage = lazy(() => import("@/pages/InstallPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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

  const hasBackendEnv = useMemo(() => {
    // Vite only exposes variables prefixed with VITE_ and they are embedded at build time.
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    return Boolean(url && key);
  }, []);

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

        {!hasBackendEnv ? (
          <BackendEnvErrorScreen />
        ) : (
          <Suspense fallback={null}>
            <AuthProvider>
              <BrowserRouter>
                <Suspense fallback={null}>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/courts" element={<CourtsPage />} />
                      <Route path="/courts/:id" element={<CourtDetailsPage />} />
                      <Route path="/games" element={<GamesPage />} />
                      <Route path="/players" element={<PlayersPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/install" element={<InstallPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </Suspense>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
