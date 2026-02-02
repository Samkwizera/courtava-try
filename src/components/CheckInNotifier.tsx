import { useCheckIns } from "@/hooks/useCheckIns";
import { useCheckInNotifications } from "@/hooks/useCheckInNotifications";

/**
 * Invisible component that listens for check-ins at the user's current court
 * and triggers toast notifications.
 */
export function CheckInNotifier() {
  const { myCheckIn } = useCheckIns();
  useCheckInNotifications(myCheckIn?.court_id ?? null);
  return null;
}
