import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useMemo, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { BackendEnvErrorScreen } from "@/components/BackendEnvErrorScreen";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CourtDetailsPage from "@/pages/CourtDetailsPage";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div
      className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
      aria-hidden
    />
  </div>
);

// Lazy-load anything that imports the backend client until we know env exists.
const AuthProvider = lazy(() => import("@/hooks/useAuth").then((m) => ({ default: m.AuthProvider })));
const AppLayout = lazy(() => import("@/components/layout/AppLayout").then((m) => ({ default: m.AppLayout })));
const RequireAuth = lazy(() => import("@/components/auth/RequireAuth").then((m) => ({ default: m.RequireAuth })));
const HomePage = lazy(() => import("@/pages/HomePage"));
const CourtsPage = lazy(() => import("@/pages/CourtsPage"));
const GamesPage = lazy(() => import("@/pages/GamesPage"));
const CreateGamePage = lazy(() => import("@/pages/CreateGamePage"));
const PlayersPage = lazy(() => import("@/pages/PlayersPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const InstallPage = lazy(() => import("@/pages/InstallPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

// Check if this is the first visit or if on install page
const hasSeenSplash = () => {
  try {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/install") return true;
      return sessionStorage.getItem("courtava_splash_seen") === "true";
    }
  } catch {
    // sessionStorage may throw in private mode
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
    try {
      sessionStorage.setItem("courtava_splash_seen", "true");
    } catch {
      /* ignore */
    }
  };

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

            {!hasBackendEnv ? (
              <BackendEnvErrorScreen />
            ) : (
              <Suspense fallback={<PageLoader />}>
                <AuthProvider>
                  <BrowserRouter>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courts" element={<CourtsPage />} />
                        <Route path="/courts/:id" element={<CourtDetailsPage />} />
                        <Route path="/games" element={<GamesPage />} />
                        <Route path="/create-game" element={<CreateGamePage />} />
                        <Route path="/players" element={<PlayersPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>
                      <Route element={<RequireAuth />}>
                        <Route path="/onboarding" element={<OnboardingPage />} />
                      </Route>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
      </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
};

export default App;
