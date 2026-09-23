import { supabase } from "@/core/database/supabase";
import type {
  CleaningBooking,
  CleaningPhotoReference,
  CleaningServiceDetails,
} from "../types/CleaningBooking";

type Provider = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  verified?: boolean | null;
};

type ProviderService = {
  id: string;
  business_id: string;
  service_name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  duration_minutes?: number | null;
  active?: boolean | null;
};

const PHOTO_BUCKET = "cleaning-booking-photos";

export class CleaningBookingRepository {
  async getCleaningProviders(): Promise<Provider[]> {
    const { data: cleaningServices, error: servicesError } = await supabase
      .from("business_services")
      .select("business_id")
      .eq("active", true)
      .not("cleaning_category", "is", null);

    if (servicesError) {
      throw new Error(servicesError.message);
    }

    const businessIds = Array.from(
      new Set(
        (cleaningServices ?? [])
          .map((service) => service.business_id)
          .filter(Boolean)
      )
    );

    if (businessIds.length === 0) {
      return [];
    }

    const { data: businesses, error: businessesError } = await supabase
      .from("business")
      .select("id,name,phone,address,verified")
      .in("id", businessIds)
      .order("name", { ascending: true });

    if (businessesError) {
      throw new Error(businessesError.message);
    }

    return (businesses ?? []).map((business) => ({
      id: business.id,
      name: business.name,
      phone: business.phone,
      address: business.address,
      verified: business.verified,
    })) as Provider[];
  }

  async getProviderServices(
    businessId: string
  ): Promise<ProviderService[]> {
    const { data, error } = await supabase
      .from("business_services")
      .select(
        "id,business_id,service_name,description,price,currency,duration_minutes,active,cleaning_category"
      )
      .eq("business_id", businessId)
      .eq("active", true)
      .not("cleaning_category", "is", null)
      .order("display_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as ProviderService[];
  }

  async create(
    data: CleaningBooking
  ): Promise<CleaningBooking> {
    const { data: row, error } = await supabase
      .from("bookings")
      .insert({
        id: data.id,
        customer_id: data.customerId,
        business_id: data.businessId,
        washing_point_id: data.washingPointId,
        washing_service_id: null,
        vehicle_type: "",
        service_type: "",
        cleaning_category: data.cleaningCategory,
        cleaning_requirements: data.cleaningRequirements,
        service_details: data.serviceDetails,
        customer_photos: data.customerPhotos,
        booking_date: data.bookingDate,
        booking_time: data.bookingTime,
        location: data.location,
        location_latitude: data.locationLatitude,
        location_longitude: data.locationLongitude,
        location_accuracy: data.locationAccuracy,
        google_maps_url: data.googleMapsUrl,
        customer_notes: data.customerNotes,
        contact_phone: data.contactPhone,
        amount: data.amount,
        status: data.status,
        created_at: data.createdAt,
        updated_at: data.updatedAt ?? data.createdAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapBooking(row);
  }

  async updateCustomerPhotos(
    bookingId: string,
    customerId: string,
    photos: CleaningPhotoReference[]
  ): Promise<CleaningBooking> {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        customer_photos: photos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("customer_id", customerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapBooking(data);
  }

  async uploadCustomerPhoto(
    customerId: string,
    bookingId: string,
    file: File
  ): Promise<CleaningPhotoReference> {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeExtension = extension.replace(/[^a-z0-9]/g, "");
    const fileName =
      `${crypto.randomUUID()}.${safeExtension || "jpg"}`;

    const path = `${customerId}/${bookingId}/${fileName}`;

    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error(error.message);
    }

    return {
      path,
    };
  }

  async deleteCustomerPhoto(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([path]);

    if (error) {
      console.error(error);
    }
  }


  async getById(id: string): Promise<CleaningBooking> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapBooking(data);
  }

  async getCustomerBookings(
    customerId: string
  ): Promise<CleaningBooking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", customerId)
      .not("cleaning_category", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapBooking(row));
  }

  async getProviders(): Promise<Provider[]> {
    return this.getCleaningProviders();
  }

  async getServices(
    businessId: string
  ): Promise<ProviderService[]> {
    return this.getProviderServices(businessId);
  }
  private mapBooking(row: any): CleaningBooking {
    return {
      id: row.id,
      customerId: row.customer_id,
      businessId: row.business_id,
      washingPointId: row.washing_point_id ?? null,
      washingServiceId: row.washing_service_id,
      cleaningCategory: row.cleaning_category,
      cleaningRequirements: row.cleaning_requirements ?? "",
      serviceDetails:
        (row.service_details as CleaningServiceDetails) ?? {},
      customerPhotos:
        (row.customer_photos as CleaningPhotoReference[]) ?? [],
      bookingDate: row.booking_date,
      bookingTime: row.booking_time,
      location: row.location,
      locationLatitude: row.location_latitude ?? null,
      locationLongitude: row.location_longitude ?? null,
      locationAccuracy: row.location_accuracy ?? null,
      googleMapsUrl: row.google_maps_url ?? null,
      customerNotes: row.customer_notes ?? "",
      contactPhone: row.contact_phone,
      amount: Number(row.amount) || 0,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined,
    };
  }
}








