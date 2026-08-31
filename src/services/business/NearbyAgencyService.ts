import { supabase } from "@/core/database/supabase";

export interface NearbyAgency {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  logo: string | null;
  rating: number;
  totalReviews: number;
  distanceKm: number;
}

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number {
  const earthRadiusKm = 6371;

  const lat1 =
    (latitude1 * Math.PI) / 180;

  const lat2 =
    (latitude2 * Math.PI) / 180;

  const deltaLatitude =
    ((latitude2 - latitude1) * Math.PI) /
    180;

  const deltaLongitude =
    ((longitude2 - longitude1) * Math.PI) /
    180;

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

export class NearbyAgencyService {
  async getNearbyAgencies(
    customerLatitude: number,
    customerLongitude: number,
    radiusKm = 20
  ): Promise<NearbyAgency[]> {
    const now = new Date().toISOString();

    /*
     * First get businesses that have an
     * active, non-expired subscription.
     */
    const {
      data: subscriptions,
      error: subscriptionError,
    } = await supabase
      .from("agency_subscriptions")
      .select(
        "business_id, expires_at"
      )
      .eq("status", "active")
      .gt("expires_at", now);

    if (subscriptionError) {
      console.error(
        "NearbyAgencyService subscriptions:",
        subscriptionError
      );

      throw new Error(
        subscriptionError.message ||
          "Unable to load active agencies."
      );
    }

    if (!subscriptions?.length) {
      return [];
    }

    const businessIds =
      subscriptions
        .map(
          (subscription) =>
            subscription.business_id
        )
        .filter(Boolean);

    if (!businessIds.length) {
      return [];
    }

    /*
     * Load the corresponding businesses.
     */
    const {
      data: businesses,
      error: businessError,
    } = await supabase
      .from("business")
      .select(`
        id,
        name,
        phone,
        email,
        whatsapp,
        address,
        latitude,
        longitude,
        logo,
        rating,
        total_reviews
      `)
      .in("id", businessIds);

    if (businessError) {
      console.error(
        "NearbyAgencyService businesses:",
        businessError
      );

      throw new Error(
        businessError.message ||
          "Unable to load nearby agencies."
      );
    }

    const nearby: NearbyAgency[] = [];

    for (const business of businesses ?? []) {
      if (
        business.latitude === null ||
        business.longitude === null
      ) {
        continue;
      }

      const latitude =
        Number(business.latitude);

      const longitude =
        Number(business.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        continue;
      }

      const distanceKm =
        calculateDistanceKm(
          customerLatitude,
          customerLongitude,
          latitude,
          longitude
        );

      if (distanceKm > radiusKm) {
        continue;
      }

      nearby.push({
        id: String(business.id),

        name: String(
          business.name ?? ""
        ),

        phone:
          business.phone ?? null,

        email:
          business.email ?? null,

        whatsapp:
          business.whatsapp ?? null,

        address:
          business.address ?? null,

        latitude,

        longitude,

        logo:
          business.logo ?? null,

        rating:
          Number(
            business.rating ?? 0
          ),

        totalReviews:
          Number(
            business.total_reviews ?? 0
          ),

        distanceKm:
          Number(
            distanceKm.toFixed(2)
          ),
      });
    }

    /*
     * Nearest agency first.
     */
    nearby.sort(
      (a, b) =>
        a.distanceKm -
        b.distanceKm
    );

    return nearby;
  }
}

export const nearbyAgencyService =
  new NearbyAgencyService();