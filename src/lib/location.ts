export type LocationCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type IpLocation = {
  ip?: string;
  city?: string;
  region?: string;
  country_code?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  org?: string;
};

export type LocationResult = {
  coordinates: LocationCoordinates;
  address: string | null;
  ipLocation: IpLocation | null;
  countryConflict: boolean;
};

async function getIpLocation(): Promise<IpLocation | null> {
  try {
    const response = await fetch(
      "https://ipapi.co/json/"
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(
      "IP location unavailable:",
      error
    );

    return null;
  }
}

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{
  displayName: string | null;
  countryCode: string | null;
}> {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      zoom: "18",
      addressdetails: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        displayName: null,
        countryCode: null,
      };
    }

    const data = await response.json();

    return {
      displayName:
        data.display_name ?? null,

      countryCode:
        data.address?.country_code
          ? String(
              data.address.country_code
            ).toUpperCase()
          : null,
    };
  } catch (error) {
    console.warn(
      "Reverse geocoding unavailable:",
      error
    );

    return {
      displayName: null,
      countryCode: null,
    };
  }
}

function countriesConflict(
  deviceCountry: string | null,
  ipLocation: IpLocation | null
): boolean {
  if (
    !deviceCountry ||
    !ipLocation?.country_code
  ) {
    return false;
  }

  return (
    deviceCountry.toUpperCase() !==
    ipLocation.country_code.toUpperCase()
  );
}

export async function detectCurrentLocation(): Promise<LocationResult> {
  if (!navigator.geolocation) {
    throw new Error(
      "This browser does not support geolocation."
    );
  }

  const ipLocation =
    await getIpLocation();

  return new Promise(
    (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates: LocationCoordinates = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,
          };

          const reverse =
            await reverseGeocode(
              coordinates.latitude,
              coordinates.longitude
            );

          const countryConflict =
            countriesConflict(
              reverse.countryCode,
              ipLocation
            );

          resolve({
            coordinates,
            address:
              reverse.displayName,
            ipLocation,
            countryConflict,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    }
  );
}
