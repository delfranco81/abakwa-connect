import { supabase } from "@/core/database/supabase";

export interface OwnedBusiness {
  id: string;
  name: string | null;
  owner_id: string | null;
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
    .select(`
      id,
      name,
      owner_id,
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
    `)
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
