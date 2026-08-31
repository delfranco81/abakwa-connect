import { supabase } from "@/core/database/supabase";

export interface Business {
  id: string;
  createdAt: string;
  name: string | null;
  owner: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  area: string | null;
  landmark: string | null;
  verified: boolean;
  featured: boolean;
  rating: number;
  totalReviews: number;
  coverImage: string | null;
  logo: string | null;
  website: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  openingHours: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string | null;
  coverColor: string | null;
  slogan: string | null;
  about: string | null;
  views: number;
  telegram: string | null;
  x: string | null;
  linkedin: string | null;
  keywords: string[] | null;
  amenities: string[] | null;
  priceRange: string | null;
  delivery: boolean;
  parking: boolean;
  wheelchairAccess: boolean;
  open24Hours: boolean;
  twitter: string | null;
  youtube: string | null;
  paymentMethods: string[] | null;
  galleryCount: number;
}

export class BusinessRepository {
  async findAll(): Promise<Business[]> {
    const { data, error } = await supabase
      .from("business")
      .select("*")
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "BusinessRepository.findAll:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load businesses."
      );
    }

    return (data ?? []).map((item) =>
      this.mapBusiness(item)
    );
  }

  async findById(
    id: string
  ): Promise<Business | undefined> {
    const { data, error } = await supabase
      .from("business")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "BusinessRepository.findById:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load business."
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapBusiness(data);
  }

  async create(
    data: Partial<Business>
  ): Promise<Business> {
    const payload = {
      name: data.name ?? null,
      owner: data.owner ?? null,
      category: data.category ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      description:
        data.description ?? null,
      area: data.area ?? null,
      landmark:
        data.landmark ?? null,
      verified:
        data.verified ?? false,
      featured:
        data.featured ?? false,
      rating: data.rating ?? 0,
      total_reviews:
        data.totalReviews ?? 0,
      cover_image:
        data.coverImage ?? null,
      logo: data.logo ?? null,
      website:
        data.website ?? null,
      whatsapp:
        data.whatsapp ?? null,
      facebook:
        data.facebook ?? null,
      instagram:
        data.instagram ?? null,
      tiktok:
        data.tiktok ?? null,
      opening_hours:
        data.openingHours ?? null,
      address:
        data.address ?? null,
      latitude:
        data.latitude ?? null,
      longitude:
        data.longitude ?? null,
      services:
        data.services ?? null,
      cover_color:
        data.coverColor ?? "#0B8F4D",
      slogan:
        data.slogan ?? null,
      about:
        data.about ?? null,
      views:
        data.views ?? 0,
      telegram:
        data.telegram ?? null,
      x: data.x ?? null,
      linkedin:
        data.linkedin ?? null,
      keywords:
        data.keywords ?? null,
      amenities:
        data.amenities ?? null,
      price_range:
        data.priceRange ?? null,
      delivery:
        data.delivery ?? false,
      parking:
        data.parking ?? false,
      wheelchair_access:
        data.wheelchairAccess ?? false,
      open_24_hours:
        data.open24Hours ?? false,
      twitter:
        data.twitter ?? null,
      youtube:
        data.youtube ?? null,
      payment_methods:
        data.paymentMethods ?? null,
      gallery_count:
        data.galleryCount ?? 0,
    };

    const { data: business, error } =
      await supabase
        .from("business")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
      console.error(
        "BusinessRepository.create:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to create business."
      );
    }

    return this.mapBusiness(business);
  }

  private mapBusiness(
    item: Record<string, unknown>
  ): Business {
    return {
      id: String(item.id),

      createdAt: String(
        item.created_at ?? ""
      ),

      name:
        item.name !== null &&
        item.name !== undefined
          ? String(item.name)
          : null,

      owner:
        item.owner !== null &&
        item.owner !== undefined
          ? String(item.owner)
          : null,

      category:
        item.category !== null &&
        item.category !== undefined
          ? String(item.category)
          : null,

      phone:
        item.phone !== null &&
        item.phone !== undefined
          ? String(item.phone)
          : null,

      email:
        item.email !== null &&
        item.email !== undefined
          ? String(item.email)
          : null,

      description:
        item.description !== null &&
        item.description !== undefined
          ? String(item.description)
          : null,

      area:
        item.area !== null &&
        item.area !== undefined
          ? String(item.area)
          : null,

      landmark:
        item.landmark !== null &&
        item.landmark !== undefined
          ? String(item.landmark)
          : null,

      verified:
        item.verified === true ||
        item.verified === "true",

      featured:
        item.featured === true ||
        item.featured === "true",

      rating: Number(
        item.rating ?? 0
      ),

      totalReviews: Number(
        item.total_reviews ?? 0
      ),

      coverImage:
        item.cover_image !== null &&
        item.cover_image !== undefined
          ? String(item.cover_image)
          : null,

      logo:
        item.logo !== null &&
        item.logo !== undefined
          ? String(item.logo)
          : null,

      website:
        item.website !== null &&
        item.website !== undefined
          ? String(item.website)
          : null,

      whatsapp:
        item.whatsapp !== null &&
        item.whatsapp !== undefined
          ? String(item.whatsapp)
          : null,

      facebook:
        item.facebook !== null &&
        item.facebook !== undefined
          ? String(item.facebook)
          : null,

      instagram:
        item.instagram !== null &&
        item.instagram !== undefined
          ? String(item.instagram)
          : null,

      tiktok:
        item.tiktok !== null &&
        item.tiktok !== undefined
          ? String(item.tiktok)
          : null,

      openingHours:
        item.opening_hours !== null &&
        item.opening_hours !== undefined
          ? String(item.opening_hours)
          : null,

      address:
        item.address !== null &&
        item.address !== undefined
          ? String(item.address)
          : null,

      latitude:
        item.latitude !== null &&
        item.latitude !== undefined
          ? Number(item.latitude)
          : null,

      longitude:
        item.longitude !== null &&
        item.longitude !== undefined
          ? Number(item.longitude)
          : null,

      services:
        item.services !== null &&
        item.services !== undefined
          ? String(item.services)
          : null,

      coverColor:
        item.cover_color !== null &&
        item.cover_color !== undefined
          ? String(item.cover_color)
          : null,

      slogan:
        item.slogan !== null &&
        item.slogan !== undefined
          ? String(item.slogan)
          : null,

      about:
        item.about !== null &&
        item.about !== undefined
          ? String(item.about)
          : null,

      views: Number(
        item.views ?? 0
      ),

      telegram:
        item.telegram !== null &&
        item.telegram !== undefined
          ? String(item.telegram)
          : null,

      x:
        item.x !== null &&
        item.x !== undefined
          ? String(item.x)
          : null,

      linkedin:
        item.linkedin !== null &&
        item.linkedin !== undefined
          ? String(item.linkedin)
          : null,

      keywords:
        Array.isArray(item.keywords)
          ? item.keywords.map(String)
          : null,

      amenities:
        Array.isArray(item.amenities)
          ? item.amenities.map(String)
          : null,

      priceRange:
        item.price_range !== null &&
        item.price_range !== undefined
          ? String(item.price_range)
          : null,

      delivery:
        item.delivery === true,

      parking:
        item.parking === true,

      wheelchairAccess:
        item.wheelchair_access === true,

      open24Hours:
        item.open_24_hours === true,

      twitter:
        item.twitter !== null &&
        item.twitter !== undefined
          ? String(item.twitter)
          : null,

      youtube:
        item.youtube !== null &&
        item.youtube !== undefined
          ? String(item.youtube)
          : null,

      paymentMethods:
        Array.isArray(
          item.payment_methods
        )
          ? item.payment_methods.map(String)
          : null,

      galleryCount: Number(
        item.gallery_count ?? 0
      ),
    };
  }
}