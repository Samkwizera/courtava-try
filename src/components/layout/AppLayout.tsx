import { Outlet, Navigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { CheckInNotifier } from "@/components/CheckInNotifier";
import { useAuth } from "@/hooks/useAuth";
import { isOnboardingDone } from "@/lib/onboarding";

export function AppLayout() {
  const { user } = useAuth();

  // Redirect to onboarding if not completed yet
  if (user && !isOnboardingDone(user)) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckInNotifier />
      <main className="pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
