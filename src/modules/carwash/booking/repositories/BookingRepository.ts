import { supabase } from "@/core/database/supabase";

import type { Booking } from "../types/Booking";

export interface WashingBusiness {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  logo: string | null;
  coverImage: string | null;
  verified: boolean;
  rating: number;
  totalReviews: number;
}

export interface WashingPoint {
  id: string;
  businessId: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  active: boolean;
}

export interface WashingService {
  id: string;
  businessId: string;
  serviceName: string;
  description: string | null;
  price: number;
  currency: string;
  durationMinutes: number | null;
  isFeatured: boolean;
  displayOrder: number;
  active: boolean;
}

export class BookingRepository {
  async create(
    data: Booking
  ): Promise<Booking> {
    const { data: booking, error } =
      await supabase
        .from("bookings")
        .insert({
          id: data.id,
          customer_id: data.customerId,
          business_id:
            data.businessId || null,
          washing_point_id:
            data.washingPointId || null,
          washing_service_id:
            data.washingServiceId || null,
          vehicle_type:
            data.vehicleType,
          service_type:
            data.serviceType,
          booking_date:
            data.bookingDate,
          booking_time:
            data.bookingTime,
          location:
            data.location,
          location_latitude:
            data.locationLatitude,
          location_longitude:
            data.locationLongitude,
          google_maps_url:
            data.googleMapsUrl,
          customer_notes:
            data.customerNotes,
          vehicle_description:
            data.vehicleDescription,
          contact_phone:
            data.contactPhone,
          amount:
            data.amount,
          status:
            data.status,
          created_at:
            data.createdAt,
          updated_at:
            new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
      console.error(
        "BookingRepository.create:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to create booking."
      );
    }

    return this.mapBooking(booking);
  }

  async getById(
    id: string
  ): Promise<Booking | undefined> {
    const { data, error } =
      await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
      console.error(
        "BookingRepository.getById:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load booking."
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapBooking(data);
  }

  async getCustomerBookings(
    customerId: string
  ): Promise<Booking[]> {
    const { data, error } =
      await supabase
        .from("bookings")
        .select("*")
        .eq(
          "customer_id",
          customerId
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "BookingRepository.getCustomerBookings:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load your bookings."
      );
    }

    return (data ?? []).map(
      (booking) =>
        this.mapBooking(booking)
    );
  }

  async updateStatus(
    id: string,
    status: Booking["status"]
  ): Promise<Booking | undefined> {
    const { data, error } =
      await supabase
        .from("bookings")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
      console.error(
        "BookingRepository.updateStatus:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update booking status."
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapBooking(data);
  }

  async delete(
    bookingId: string,
    customerId: string
  ): Promise<void> {
    const { error } =
      await supabase
        .from("bookings")
        .delete()
        .eq(
          "id",
          bookingId
        )
        .eq(
          "customer_id",
          customerId
        );

    if (error) {
      console.error(
        "BookingRepository.delete:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to delete booking."
      );
    }
  }

  /**
   * Load washing businesses from
   * public.business.
   *
   * These are the columns confirmed
   * to exist in the database.
   */
  async getWashingBusinesses(): Promise<
    WashingBusiness[]
  > {
    const { data, error } =
      await supabase
        .from("business")
        .select(`
          id,
          name,
          phone,
          email,
          address,
          verified,
          rating,
          total_reviews
        `)
        .order(
          "name",
          {
            ascending: true,
          }
        );

    if (error) {
      console.error(
        "BookingRepository.getWashingBusinesses:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load washing businesses."
      );
    }

    return (data ?? []).map(
      (item) => ({
        id:
          String(
            item.id
          ),

        name:
          String(
            item.name ?? ""
          ),

        phone:
          item.phone ?? null,

        email:
          item.email ?? null,

        address:
          item.address ?? null,

        latitude:
          null,

        longitude:
          null,

        logo:
          null,

        coverImage:
          null,

        verified:
          item.verified === true ||
          String(
            item.verified ?? ""
          ).toLowerCase() ===
            "true",

        rating:
          Number(
            item.rating ?? 0
          ),

        totalReviews:
          Number(
            item.total_reviews ?? 0
          ),
      })
    );
  }

  /**
   * Load washing points from
   * public.branches.
   *
   * IMPORTANT:
   * branches does NOT have an
   * "active" column.
   *
   * It has:
   * status
   *
   * Therefore we use status here.
   */
  async getWashingPoints(
    businessId?: string
  ): Promise<WashingPoint[]> {
    let query =
      supabase
        .from("branches")
        .select(`
          id,
          business_id,
          name,
          address,
          latitude,
          longitude,
          phone,
          status
        `);

    if (businessId) {
      query =
        query.eq(
          "business_id",
          businessId
        );
    }

    const { data, error } =
      await query.order(
        "name",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(
        "BookingRepository.getWashingPoints:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load washing points."
      );
    }

    return (data ?? [])
      .filter((item) => {
        const status =
          String(
            item.status ?? ""
          )
            .trim()
            .toLowerCase();

        /*
         * If status is empty,
         * we keep the branch.
         *
         * If status exists,
         * only "active" branches
         * are shown.
         */
        return (
          status === "" ||
          status === "active"
        );
      })
      .map(
        (item) => ({
          id:
            String(
              item.id
            ),

          businessId:
            String(
              item.business_id
            ),

          name:
            String(
              item.name ?? ""
            ),

          address:
            item.address ??
            null,

          latitude:
            item.latitude !==
              null &&
            item.latitude !==
              undefined
              ? Number(
                  item.latitude
                )
              : null,

          longitude:
            item.longitude !==
              null &&
            item.longitude !==
              undefined
              ? Number(
                  item.longitude
                )
              : null,

          phone:
            item.phone ??
            null,

          active:
            String(
              item.status ?? ""
            )
              .trim()
              .toLowerCase() !==
              "inactive",
        })
      );
  }

  /**
   * Load services from
   * public.business_services.
   */
  async getWashingServices(
    businessId?: string
  ): Promise<WashingService[]> {
    let query =
      supabase
        .from(
          "business_services"
        )
        .select(`
          id,
          business_id,
          service_name,
          description,
          price,
          currency,
          duration_minutes,
          active,
          display_order,
          is_featured
        `)
        .eq(
          "active",
          true
        );

    if (businessId) {
      query =
        query.eq(
          "business_id",
          businessId
        );
    }

    const { data, error } =
      await query.order(
        "display_order",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(
        "BookingRepository.getWashingServices:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load washing services."
      );
    }

    return (data ?? []).map(
      (item) => ({
        id:
          String(
            item.id
          ),

        businessId:
          String(
            item.business_id
          ),

        serviceName:
          String(
            item.service_name ??
              ""
          ),

        description:
          item.description ??
          null,

        price:
          Number(
            item.price ?? 0
          ),

        currency:
          String(
            item.currency ??
              "FCFA"
          ),

        durationMinutes:
          item.duration_minutes !==
            null &&
          item.duration_minutes !==
            undefined
            ? Number(
                item.duration_minutes
              )
            : null,

        isFeatured:
          item.is_featured ===
          true,

        displayOrder:
          Number(
            item.display_order ??
              0
          ),

        active:
          item.active !==
          false,
      })
    );
  }

  private mapBooking(
    data: Record<
      string,
      unknown
    >
  ): Booking {
    return {
      id:
        String(
          data.id
        ),

      customerId:
        String(
          data.customer_id
        ),

      businessId:
        String(
          data.business_id ??
            ""
        ),

      washingPointId:
        String(
          data.washing_point_id ??
            ""
        ),

      washingServiceId:
        String(
          data.washing_service_id ??
            ""
        ),

      vehicleType:
        data.vehicle_type as
          Booking["vehicleType"],

      serviceType:
        data.service_type as
          Booking["serviceType"],

      bookingDate:
        String(
          data.booking_date ??
            ""
        ),

      bookingTime:
        String(
          data.booking_time ??
            ""
        ),

      location:
        String(
          data.location ??
            ""
        ),

      locationLatitude:
        data.location_latitude !==
            null &&
        data.location_latitude !==
            undefined
          ? Number(
              data.location_latitude
            )
          : null,

      locationLongitude:
        data.location_longitude !==
            null &&
        data.location_longitude !==
            undefined
          ? Number(
              data.location_longitude
            )
          : null,

      googleMapsUrl:
        data.google_maps_url
          ? String(
              data.google_maps_url
            )
          : null,

      customerNotes:
        String(
          data.customer_notes ??
            ""
        ),

      vehicleDescription:
        String(
          data.vehicle_description ??
            ""
        ),

      contactPhone:
        String(
          data.contact_phone ??
            ""
        ),

      amount:
        Number(
          data.amount ?? 0
        ),

      status:
        data.status as
          Booking["status"],

      createdAt:
        String(
          data.created_at ??
            ""
        ),

      updatedAt:
        data.updated_at
          ? String(
              data.updated_at
            )
          : undefined,
    };
  }
}