import { useCheckIns } from "@/hooks/useCheckIns";
import { useCheckInNotifications } from "@/hooks/useCheckInNotifications";
import { useSettings } from "@/hooks/useSettings";

/**
 * Invisible component that listens for check-ins at the user's current court
 * and triggers toast notifications.
 */
export function CheckInNotifier() {
  const { myCheckIn } = useCheckIns();
  const { settings } = useSettings();
  useCheckInNotifications(myCheckIn?.court_id ?? null, settings.notify_nearby_check_ins);
  return null;
}
