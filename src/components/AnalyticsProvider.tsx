import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { capture, identifyUser, initAnalytics, resetAnalytics } from "@/lib/analytics";

/**
 * Wires PostHog into the app: init once, capture SPA pageviews, and keep the
 * identified person in sync with the Supabase session. Renders nothing.
 * Must be rendered inside both <BrowserRouter> and <AuthProvider>.
 */
export function AnalyticsProvider() {
  const location = useLocation();
  const { user } = useAuth();
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    capture("$pageview", { $current_url: window.location.href });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (user && identifiedId.current !== user.id) {
      identifyUser(user.id, { email: user.email });
      identifiedId.current = user.id;
    } else if (!user && identifiedId.current) {
      resetAnalytics();
      identifiedId.current = null;
    }
  }, [user]);

  return null;
}
