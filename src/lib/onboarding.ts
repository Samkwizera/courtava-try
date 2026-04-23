export function isOnboardingDone(userId: string) {
  return localStorage.getItem(`courtava_onboarding_${userId}`) === "1";
}

export function markOnboardingDone(userId: string) {
  localStorage.setItem(`courtava_onboarding_${userId}`, "1");
}
