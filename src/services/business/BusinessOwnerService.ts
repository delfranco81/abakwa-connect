import { supabase } from "@/core/database/supabase";

export interface OwnedBusiness {
  id: string;
  name: string | null;
  owner_id: string | null;
  place_id: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  area: string | null;
  landmark: string | null;
  logo: string | null;
  cover_image: string | null;
  website: string | null;
  whatsapp: string | null;
  opening_hours: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  verified: boolean | null;
  featured: boolean | null;
  rating: number | null;
  total_reviews: number | null;
}

const BUSINESS_FIELDS = `
  id,
  name,
  owner_id,
  place_id,
  category,
  phone,
  email,
  description,
  area,
  landmark,
  logo,
  cover_image,
  website,
  whatsapp,
  opening_hours,
  address,
  latitude,
  longitude,
  verified,
  featured,
  rating,
  total_reviews
`;

export async function getOwnedBusiness(): Promise<OwnedBusiness | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "getOwnedBusiness auth error:",
      authError
    );

    throw new Error(authError.message);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("business")
    .select(BUSINESS_FIELDS)
    .eq("owner_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "getOwnedBusiness database error:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to load your business."
    );
  }

  return data ?? null;
}

/**
 * Load one specific business belonging to the
 * currently authenticated user.
 *
 * The business ID is never trusted by itself:
 * ownership is enforced by the owner_id filter.
 */
export async function getOwnedBusinessById(
  businessId: string
): Promise<OwnedBusiness | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "getOwnedBusinessById auth error:",
      authError
    );

    throw new Error(authError.message);
  }

  if (!user) {
    return null;
  }

  const normalizedBusinessId =
    businessId.trim();

  if (!normalizedBusinessId) {
    return null;
  }

  const { data, error } = await supabase
    .from("business")
    .select(BUSINESS_FIELDS)
    .eq("id", normalizedBusinessId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "getOwnedBusinessById database error:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to load the selected business."
    );
  }

  return data ?? null;
}

