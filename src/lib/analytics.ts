import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY ?? "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

/**
 * Initialise PostHog once. Safely no-ops when no key is configured, so local
 * dev and preview builds without the env var keep working.
 */
export function initAnalytics() {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // We send pageviews ourselves from the router so SPA navigations are caught.
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: true,
  });

  initialized = true;
}

export const analyticsEnabled = () => initialized;

export function capture(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
