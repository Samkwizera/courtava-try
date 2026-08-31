import { Outlet, Navigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
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
    <div className="min-h-[100dvh] bg-background">
      <CheckInNotifier />
      <DesktopSidebar />
      <main className="min-h-[100dvh] pb-28 lg:ml-28 lg:pb-0">
        <Outlet />
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
