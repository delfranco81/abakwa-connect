import { supabase } from "@/lib/supabase";

export type MapItemType =
  | "business"
  | "place";

export type MapItem = {
  id: string;

  type: MapItemType;

  name: string;

  category?: string | null;

  description?: string | null;

  address?: string | null;

  area?: string | null;

  city?: string | null;

  phone?: string | null;

  website?: string | null;

  image?: string | null;

  latitude: number;

  longitude: number;

  verified?: boolean | null;

  rating?: number | null;

  url: string;
};


/*
 * =========================================================
 * VALID COORDINATES
 * =========================================================
 */

function hasValidCoordinates(
  latitude: unknown,
  longitude: unknown
): boolean {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}


/*
 * =========================================================
 * LOAD BUSINESSES
 * =========================================================
 */

async function getMapBusinesses(): Promise<MapItem[]> {
  const {
    data,
    error,
  } = await supabase
    .from("business")
    .select(`
      id,
      name,
      category,
      description,
      address,
      area,
      city,
      phone,
      website,
      logo,
      cover_image,
      latitude,
      longitude,
      verified,
      rating
    `)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) {
    console.error(
      "Map business loading error:",
      error
    );

    return [];
  }

  return (data || [])
    .filter((row) =>
      hasValidCoordinates(
        row.latitude,
        row.longitude
      )
    )
    .map((row) => ({
      id: String(row.id),

      type: "business",

      name:
        row.name ||
        "Unnamed business",

      category:
        row.category || null,

      description:
        row.description || null,

      address:
        row.address || null,

      area:
        row.area || null,

      city:
        row.city || null,

      phone:
        row.phone || null,

      website:
        row.website || null,

      image:
        row.logo ||
        row.cover_image ||
        null,

      latitude:
        Number(row.latitude),

      longitude:
        Number(row.longitude),

      verified:
        row.verified === true,

      rating:
        Number(row.rating) || 0,

      url:
        `/business/${row.id}`,
    }));
}


/*
 * =========================================================
 * LOAD PLACES
 * =========================================================
 */

async function getMapPlaces(): Promise<MapItem[]> {
  const {
    data,
    error,
  } = await supabase
    .from("places")
    .select(`
      id,
      name,
      category,
      description,
      address,
      city,
      phone,
      website,
      image,
      cover_image,
      latitude,
      longitude,
      verified,
      rating
    `)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) {
    console.error(
      "Map place loading error:",
      error
    );

    return [];
  }

  return (data || [])
    .filter((row) =>
      hasValidCoordinates(
        row.latitude,
        row.longitude
      )
    )
    .map((row) => ({
      id: String(row.id),

      type: "place",

      name:
        row.name ||
        "Unnamed place",

      category:
        row.category || null,

      description:
        row.description || null,

      address:
        row.address || null,

      city:
        row.city || null,

      phone:
        row.phone || null,

      website:
        row.website || null,

      image:
        row.image ||
        row.cover_image ||
        null,

      latitude:
        Number(row.latitude),

      longitude:
        Number(row.longitude),

      verified:
        row.verified === true,

      rating:
        Number(row.rating) || 0,

      url:
        `/search?search=${encodeURIComponent(
          String(row.name || "")
        )}`,
    }));
}


/*
 * =========================================================
 * GET ALL MAP ITEMS
 * =========================================================
 */

export async function getMapItems(): Promise<MapItem[]> {
  const [
    businesses,
    places,
  ] = await Promise.all([
    getMapBusinesses(),
    getMapPlaces(),
  ]);

  return [
    ...businesses,
    ...places,
  ];
}