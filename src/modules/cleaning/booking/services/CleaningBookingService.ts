import {
  Events,
} from "@/core/events/events/Events";

import {
  NotificationCenter,
} from "@/core/events/notifications/NotificationCenter";

import {
  CleaningBookingRepository,
} from "../repositories/CleaningBookingRepository";

import type {
  CleaningBooking,
  CleaningCategory,
} from "../types/CleaningBooking";

export class CleaningBookingService {
  private repository =
    new CleaningBookingRepository();

  async createBooking(
    data: CleaningBooking
  ): Promise<CleaningBooking> {
    this.validateBooking(data);

    const booking =
      await this.repository.create(data);

    NotificationCenter.notify(
      Events.BOOKING_CREATED
    );

    return booking;
  }

  async getBooking(
    id: string
  ): Promise<CleaningBooking | undefined> {
    if (!id.trim()) {
      throw new Error(
        "Booking ID is required."
      );
    }

    return this.repository.getById(id);
  }

  async customerBookings(
    customerId: string
  ): Promise<CleaningBooking[]> {
    if (!customerId.trim()) {
      throw new Error(
        "Customer ID is required."
      );
    }

    return this.repository.getCustomerBookings(
      customerId
    );
  }

  async getProviders() {
    return this.repository.getProviders();
  }

  async getServices(
    businessId: string
  ) {
    if (!businessId.trim()) {
      return [];
    }

    return this.repository.getServices(
      businessId
    );
  }


  async getCleaningProviders() {
    return this.repository.getCleaningProviders();
  }

  async getProviderServices(businessId: string) {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    return this.repository.getProviderServices(businessId);
  }

  async uploadCustomerPhotos(
    customerId: string,
    bookingId: string,
    files: File[]
  ) {
    if (!customerId || !bookingId) {
      throw new Error("Customer and booking are required.");
    }

    const uploaded = [];

    try {
      for (const file of files) {
        const reference =
          await this.repository.uploadCustomerPhoto(
            customerId,
            bookingId,
            file
          );

        uploaded.push(reference);
      }

      await this.repository.updateCustomerPhotos(
        bookingId,
        customerId,
        uploaded
      );

      return uploaded;
    } catch (error) {
      for (const photo of uploaded) {
        await this.repository.deleteCustomerPhoto(photo.path);
      }

      throw error;
    }
  }
  private validateBooking(
    data: CleaningBooking
  ): void {
    const categories: CleaningCategory[] = [
      "car-wash",
      "vehicle-detailing",
      "home-cleaning",
      "hotel-cleaning",
      "office-cleaning",
      "laundry",
      "carpet-cleaning",
      "general-cleaning",
      "other-cleaning",
    ];

    if (!data.id.trim()) {
      throw new Error(
        "Booking ID is required."
      );
    }

    if (!data.customerId.trim()) {
      throw new Error(
        "Customer account is required."
      );
    }

    if (!data.businessId.trim()) {
      throw new Error(
        "Please select a cleaning provider."
      );
    }


    if (
      !categories.includes(
        data.cleaningCategory
      )
    ) {
      throw new Error(
        "Please select a valid cleaning category."
      );
    }

    if (
      !data.cleaningRequirements.trim()
    ) {
      throw new Error(
        "Please describe what needs to be cleaned."
      );
    }

    if (!data.bookingDate.trim()) {
      throw new Error(
        "Please select a booking date."
      );
    }

    if (!data.bookingTime.trim()) {
      throw new Error(
        "Please select a booking time."
      );
    }

    if (!data.location.trim()) {
      throw new Error(
        "Please provide your location."
      );
    }

    if (!data.contactPhone.trim()) {
      throw new Error(
        "Please provide a contact phone number."
      );
    }

    if (
      !/^[0-9+\s()-]{7,20}$/.test(
        data.contactPhone.trim()
      )
    ) {
      throw new Error(
        "Please enter a valid contact phone number."
      );
    }

    if (
      !Number.isFinite(data.amount) ||
      data.amount < 0
    ) {
      throw new Error(
        "The selected service has an invalid price."
      );
    }

    if (!data.status) {
      throw new Error(
        "Booking status is required."
      );
    }
  }
}

export const cleaningBookingService =
  new CleaningBookingService();



