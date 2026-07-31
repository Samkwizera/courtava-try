export interface CourtIdentity {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const GENERIC_COURT_WORDS = new Set([
  "basketball",
  "court",
  "courts",
  "gym",
  "gymnasium",
]);

function normalizeCourtName(name: string) {
  return name
    .toLowerCase()
    .replace(/\bafrican?\s+leadership\s+university\b/g, "alu")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((part) => part && !GENERIC_COURT_WORDS.has(part))
    .join(" ");
}

function getDistanceKm(latA: number, lngA: number, latB: number, lngB: number) {
  const radiusKm = 6371;
  const dLat = ((latB - latA) * Math.PI) / 180;
  const dLng = ((lngB - lngA) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latA * Math.PI) / 180) *
      Math.cos((latB * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isDuplicateCourt(a: CourtIdentity, b: CourtIdentity) {
  const sameCanonicalName = normalizeCourtName(a.name) === normalizeCourtName(b.name);
  if (!sameCanonicalName) return false;

  return getDistanceKm(a.lat, a.lng, b.lat, b.lng) <= 0.5;
}

export function dedupeCourts<T extends CourtIdentity>(courts: T[]) {
  return courts.reduce<T[]>((uniqueCourts, court) => {
    const duplicate = uniqueCourts.some((existingCourt) =>
      isDuplicateCourt(existingCourt, court)
    );

    if (!duplicate) uniqueCourts.push(court);
    return uniqueCourts;
  }, []);
}
