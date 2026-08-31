export type Coordinates = {
  latitude: number;
  longitude: number;
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Calculates the distance between two GPS coordinates.
 *
 * Returns distance in kilometres.
 */
export function calculateDistanceKm(
  from: Coordinates,
  to: Coordinates
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    toRadians(
      to.latitude - from.latitude
    );

  const longitudeDifference =
    toRadians(
      to.longitude - from.longitude
    );

  const latitude1 =
    toRadians(from.latitude);

  const latitude2 =
    toRadians(to.latitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

/**
 * Formats a distance for display.
 */
export function formatDistance(
  distanceKm: number
): string {
  if (!Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(
      distanceKm * 1000
    )} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}