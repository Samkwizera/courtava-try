export type CourtHeat = "high" | "medium" | "low";

/** Activity tier from live check-in count. Shared by the home map card and CourtMap markers so "hot/warm/quiet" means the same thing everywhere. */
export function getCourtHeat(playerCount: number): CourtHeat {
  if (playerCount >= 6) return "high";
  if (playerCount >= 2) return "medium";
  return "low";
}
