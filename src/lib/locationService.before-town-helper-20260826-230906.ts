export type Coordinates = [
  number,
  number
];

export type LocationSource =
  | "device"
  | "browser"
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

export const MAX_AUTO_LOCATION_ACCURACY_METERS = 1000;

type BrowserLocationResult = {
  coordinates: Coordinates;
  accuracy: number | null;
  timestamp: number;
};

type IpLocationResponse = {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

/*
 * ============================================================
 * BROWSER LOCATION
 * ============================================================
 *
 * We deliberately use the browser's Geolocation API.
 *
 * We do NOT:
 *
 * - search Bambili
 * - search Bambui
 * - search Tubah
 * - search Bamenda
 * - use a hard-coded coordinate
 *
 * The browser is the only automatic coordinate source.
 */
function getBrowserLocation(): Promise<BrowserLocationResult> {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Browser geolocation is not supported."
          )
        );

        return;
      }

      console.log(
        "ECOS: Starting browser/device location watch..."
      );

      let bestResult:
        | BrowserLocationResult
        | null = null;

      let finished = false;

      let watchId:
        | number
        | null = null;

      const startedAt =
        Date.now();

      /*
       * Give the browser enough time to improve
       * a Wi-Fi/network estimate.
       *
       * This does NOT invent a location.
       */
      const MAX_WAIT =
        30000;

      const finish = (
        result:
          | BrowserLocationResult
          | null,
        error?: GeolocationPositionError
      ) => {
        if (finished) {
          return;
        }

        finished = true;

        if (
          watchId !== null
        ) {
          navigator.geolocation.clearWatch(
            watchId
          );
        }

        if (result) {
          console.log(
            "ECOS: BEST BROWSER/DEVICE LOCATION:",
            {
              coordinates:
                result.coordinates,

              accuracy:
                result.accuracy,

              timestamp:
                new Date(
                  result.timestamp
                ).toISOString(),
            }
          );

          resolve(
            result
          );

          return;
        }

        reject(
          error ??
            new Error(
              "Browser/device location could not be determined."
            )
        );
      };

      const success = (
        position:
          GeolocationPosition
      ) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const accuracy =
          Number.isFinite(
            position.coords.accuracy
          )
            ? position.coords.accuracy
            : null;

        if (
          !Number.isFinite(
            latitude
          ) ||
          !Number.isFinite(
            longitude
          )
        ) {
          console.warn(
            "ECOS: Browser returned invalid coordinates."
          );

          return;
        }

        const candidate:
          BrowserLocationResult = {
            coordinates: [
              latitude,
              longitude,
            ],

            accuracy,

            timestamp:
              position.timestamp,
          };

        console.log(
          "ECOS BROWSER LOCATION UPDATE:",
          {
            coordinates:
              candidate.coordinates,

            accuracy:
              candidate.accuracy,

            ageMs:
              Date.now() -
              candidate.timestamp,
          }
        );

        /*
         * Always keep the most accurate result
         * received so far.
         */
        if (
          !bestResult ||
          (
            accuracy !== null &&
            (
              bestResult.accuracy === null ||
              accuracy <
                bestResult.accuracy
            )
          )
        ) {
          bestResult =
            candidate;

          console.log(
            "ECOS: NEW BEST LOCATION:",
            bestResult
          );
        }

        /*
         * If we obtain a genuinely accurate result,
         * stop immediately.
         */
        if (
          accuracy !== null &&
          accuracy <=
            MAX_AUTO_LOCATION_ACCURACY_METERS
        ) {
          console.log(
            "ECOS: Accurate browser/device location obtained."
          );

          finish(
            bestResult
          );

          return;
        }

        /*
         * Otherwise continue watching until the
         * maximum wait period.
         */
        if (
          Date.now() -
            startedAt >=
          MAX_WAIT
        ) {
          finish(
            bestResult
          );
        }
      };

      const error = (
        geoError:
          GeolocationPositionError
      ) => {
        console.warn(
          "ECOS BROWSER LOCATION ERROR:",
          {
            code:
              geoError.code,

            message:
              geoError.message,
          }
        );

        /*
         * If we already received something useful,
         * return the best result instead of throwing.
         */
        if (bestResult) {
          finish(
            bestResult,
            geoError
          );

          return;
        }

        finish(
          null,
          geoError
        );
      };

      /*
       * Ask the browser for the best available
       * location source.
       *
       * maximumAge = 0 prevents stale cached
       * coordinates from being preferred.
       */
      watchId =
        navigator.geolocation.watchPosition(
          success,
          error,
          {
            enableHighAccuracy:
              true,

            timeout:
              30000,

            maximumAge:
              0,
          }
        );

      /*
       * Absolute safety timeout.
       */
      window.setTimeout(
        () => {
          if (finished) {
            return;
          }

          console.log(
            "ECOS: Browser location watch timeout reached."
          );

          finish(
            bestResult
          );
        },
        MAX_WAIT
      );
    }
  );
}

/*
 * ============================================================
 * NETWORK/IP LOCATION
 * ============================================================
 *
 * This is INFORMATION ONLY.
 *
 * It is NEVER used as the exact business coordinate.
 */
async function getNetworkLocation(): Promise<{
  coordinates: Coordinates;
  city: string | null;
  region: string | null;
  country: string | null;
} | null> {
  try {
    console.log(
      "ECOS: Requesting network/IP location for information only..."
    );

    const response =
      await fetch(
        "https://ipwho.is/",
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      console.warn(
        "ECOS network location HTTP error:",
        response.status
      );

      return null;
    }

    const data =
      (await response.json()) as IpLocationResponse;

    if (
      !data.success ||
      typeof data.latitude !==
        "number" ||
      typeof data.longitude !==
        "number"
    ) {
      return null;
    }

    const result = {
      coordinates: [
        data.latitude,
        data.longitude,
      ] as Coordinates,

      city:
        data.city ??
        null,

      region:
        data.region ??
        null,

      country:
        data.country ??
        null,
    };

    console.log(
      "ECOS NETWORK LOCATION INFORMATION:",
      result
    );

    return result;
  } catch (error) {
    console.warn(
      "ECOS NETWORK LOCATION UNAVAILABLE:",
      error
    );

    return null;
  }
}

/*
 * ============================================================
 * BEST LOCATION
 * ============================================================
 *
 * Priority:
 *
 * 1. Browser/device location
 * 2. Network only as informational fallback
 *
 * IMPORTANT:
 *
 * Network/IP coordinates NEVER become the business
 * marker automatically.
 */
export async function getBestLocation(): Promise<LocationResult> {
  let browser:
    | BrowserLocationResult
    | null = null;

  try {
    browser =
      await getBrowserLocation();
  } catch (error) {
    console.warn(
      "ECOS browser/device location unavailable:",
      error
    );
  }

  if (browser) {
    const accuracy =
      browser.accuracy;

    /*
     * Accurate browser/device result.
     */
    if (
      accuracy !== null &&
      accuracy <=
        MAX_AUTO_LOCATION_ACCURACY_METERS
    ) {
      console.log(
        "ECOS FINAL LOCATION: Accurate browser/device location.",
        browser
      );

      return {
        coordinates:
          browser.coordinates,

        source:
          "device",

        accuracy,

        city:
          null,

        region:
          null,

        country:
          null,

        warning:
          null,
      };
    }

    /*
     * Browser/device location exists but is
     * too coarse to be considered the exact
     * business location.
     */
    console.warn(
      "ECOS: Browser/device location is approximate:",
      accuracy
    );

    return {
      coordinates:
        browser.coordinates,

      source:
        "browser",

      accuracy,

      city:
        null,

      region:
        null,

      country:
        null,

      warning:
        `Browser/device location is available, but accuracy is approximately ${
          accuracy !== null
            ? Math.round(
                accuracy
              )
            : "unknown"
        } meters. The map will use this only as a starting area. Please select the exact business location manually.`,
    };
  }

  /*
   * Browser/device location completely unavailable.
   *
   * Network information may be returned so the UI
   * can explain the situation, but its coordinates
   * are deliberately NOT returned as the map position.
   */
  const network =
    await getNetworkLocation();

  return {
    coordinates:
      null,

    source:
      network
        ? "network"
        : "none",

    accuracy:
      null,

    city:
      network?.city ??
      null,

    region:
      network?.region ??
      null,

    country:
      network?.country ??
      null,

    warning:
      network
        ? "Browser/device location was unavailable. Network location is approximate and will not be used as the exact business location."
        : "Browser/device location was unavailable. Please select the business location manually on the map.",
  };
}

/*
 * ============================================================
 * USER-REQUESTED PLACE SEARCH
 * ============================================================
 *
 * Search happens ONLY when the user explicitly asks.
 *
 * This is not automatic location detection.
 */
export type PlaceSearchResult = {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;

  address?: {
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

export async function searchPlace(
  query: string
): Promise<PlaceSearchResult[]> {
  const cleanQuery =
    query.trim();

  if (!cleanQuery) {
    return [];
  }

  const params =
    new URLSearchParams({
      q:
        cleanQuery,

      format:
        "jsonv2",

      addressdetails:
        "1",

      limit:
        "5",

      "accept-language":
        "en",
    });

  const url =
    `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  console.log(
    "ECOS USER REQUESTED PLACE SEARCH:",
    cleanQuery
  );

  const response =
    await fetch(
      url,
      {
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      `Location search failed with HTTP ${response.status}.`
    );
  }

  return (
    (await response.json()) as PlaceSearchResult[]
  );
}

/*
 * ============================================================
 * REVERSE GEOCODING
 * ============================================================
 *
 * Called after the user selects an exact map position.
 */
export type ReverseLocationResult = {
  display_name: string;

  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

export async function reverseGeocode(
  coordinates: Coordinates
): Promise<ReverseLocationResult | null> {
  const params =
    new URLSearchParams({
      lat:
        String(
          coordinates[0]
        ),

      lon:
        String(
          coordinates[1]
        ),

      format:
        "jsonv2",

      addressdetails:
        "1",

      zoom:
        "18",

      "accept-language":
        "en",
    });

  const url =
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

  try {
    const response =
      await fetch(
        url,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      return null;
    }

    return (
      (await response.json()) as ReverseLocationResult
    );
  } catch (error) {
    console.warn(
      "ECOS reverse geocoding failed:",
      error
    );

    return null;
  }
}
