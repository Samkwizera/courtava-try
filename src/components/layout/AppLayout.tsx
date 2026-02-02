import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { CheckInNotifier } from "@/components/CheckInNotifier";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <CheckInNotifier />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
