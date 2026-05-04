import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function isOnboardingDone(user: User): boolean {
  // Fast path: localStorage (same device, works immediately after completion)
  if (localStorage.getItem(`courtava_onboarding_${user.id}`) === "1") return true;
  // Cross-device path: server-side flag stored in auth user_metadata
  return user.user_metadata?.onboarding_done === true;
}

export function markOnboardingDone(userId: string): void {
  localStorage.setItem(`courtava_onboarding_${userId}`, "1");
  // Persist to auth metadata so it survives across devices/browsers
  supabase.auth.updateUser({ data: { onboarding_done: true } }).catch(() => {});
}
