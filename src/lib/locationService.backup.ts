export type Coordinates = [number, number];

export type LocationSource =
  | "device"
  | "network"
  | "manual"
  | "none";

export type LocationResult = {
  coordinates: Coordinates | null;
  source: LocationSource;
  accuracy: number | null;
  city: string | null;
  region: string | null;
  country: string | null;
  warning: string | null;
};

type IpLocationResponse = {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

const MAX_REASONABLE_DEVICE_NETWORK_DISTANCE_KM = 100;

function distanceKm(
  a: Coordinates,
  b: Coordinates
): number {
  const R = 6371;

  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;

  const dLat =
    ((b[0] - a[0]) * Math.PI) / 180;

  const dLon =
    ((b[1] - a[1]) * Math.PI) / 180;

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
  );
}

function getDeviceLocation(): Promise<{
  coordinates: Coordinates;
  accuracy: number | null;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Browser geolocation is not supported."
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: [
            position.coords.latitude,
            position.coords.longitude,
          ],
          accuracy:
            Number.isFinite(
              position.coords.accuracy
            )
              ? position.coords.accuracy
              : null,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  });
}

async function getNetworkLocation(): Promise<{
  coordinates: Coordinates;
  city: string | null;
  region: string | null;
  country: string | null;
} | null> {
  try {
    const response = await fetch(
      "https://ipwho.is/",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as IpLocationResponse;

    if (
      !data.success ||
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number"
    ) {
      return null;
    }

    return {
      coordinates: [
        data.latitude,
        data.longitude,
      ],
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
    };
  } catch (error) {
    console.warn(
      "Network location unavailable:",
      error
    );

    return null;
  }
}

export async function getBestLocation(): Promise<LocationResult> {
  const [
    deviceResult,
    networkResult,
  ] = await Promise.allSettled([
    getDeviceLocation(),
    getNetworkLocation(),
  ]);

  const device =
    deviceResult.status === "fulfilled"
      ? deviceResult.value
      : null;

  const network =
    networkResult.status === "fulfilled"
      ? networkResult.value
      : null;

  console.log(
    "ECOS LOCATION COMPARISON:",
    {
      device: device?.coordinates || null,
      network: network?.coordinates || null,
      deviceAccuracy:
        device?.accuracy || null,
    }
  );

  if (device && network) {
    const distance = distanceKm(
      device.coordinates,
      network.coordinates
    );

    console.log(
      "ECOS LOCATION DISTANCE:",
      `${distance.toFixed(1)} km`
    );

    if (
      distance <=
      MAX_REASONABLE_DEVICE_NETWORK_DISTANCE_KM
    ) {
      return {
        coordinates: device.coordinates,
        source: "device",
        accuracy: device.accuracy,
        city: network.city,
        region: network.region,
        country: network.country,
        warning: null,
      };
    }

    console.warn(
      "ECOS: device and network locations disagree significantly. Using network location."
    );

    return {
      coordinates: network.coordinates,
      source: "network",
      accuracy: null,
      city: network.city,
      region: network.region,
      country: network.country,
      warning:
        "The browser/device location differed significantly from the network location.",
    };
  }

  if (device) {
    return {
      coordinates: device.coordinates,
      source: "device",
      accuracy: device.accuracy,
      city: null,
      region: null,
      country: null,
      warning: null,
    };
  }

  if (network) {
    return {
      coordinates: network.coordinates,
      source: "network",
      accuracy: null,
      city: network.city,
      region: network.region,
      country: network.country,
      warning:
        "Device GPS was unavailable, so ECOS used your network location.",
    };
  }

  return {
    coordinates: null,
    source: "none",
    accuracy: null,
    city: null,
    region: null,
    country: null,
    warning:
      "We could not determine your location. You can choose a location manually on the map.",
  };
}
