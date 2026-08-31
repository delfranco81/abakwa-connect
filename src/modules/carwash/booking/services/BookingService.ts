import {
  BookingRepository,
} from "../repositories/BookingRepository";

import type {
  Booking,
} from "../types/Booking";

import type {
  WashingBusiness,
  WashingPoint,
  WashingService,
} from "../repositories/BookingRepository";

import {
  Events,
} from "@/core/events/events/Events";

import {
  NotificationCenter,
} from "@/core/events/notifications/NotificationCenter";

export class BookingService {
  private repository =
    new BookingRepository();

  async createBooking(
    data: Booking
  ): Promise<Booking> {
    this.validateBooking(data);

    const booking =
      await this.repository.create(
        data
      );

    NotificationCenter.notify(
      Events.BOOKING_CREATED
    );

    return booking;
  }

  async getBooking(
    id: string
  ): Promise<
    Booking | undefined
  > {
    if (!id.trim()) {
      throw new Error(
        "Booking ID is required."
      );
    }

    return this.repository.getById(
      id
    );
  }

  async customerBookings(
    customerId: string
  ): Promise<Booking[]> {
    if (!customerId.trim()) {
      throw new Error(
        "Customer ID is required."
      );
    }

    return this.repository.getCustomerBookings(
      customerId
    );
  }

  async updateBookingStatus(
    id: string,
    status: Booking["status"]
  ): Promise<
    Booking | undefined
  > {
    if (!id.trim()) {
      throw new Error(
        "Booking ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "Booking status is required."
      );
    }

    const booking =
      await this.repository.updateStatus(
        id,
        status
      );

    NotificationCenter.notify(
      Events.BOOKING_UPDATED
    );

    return booking;
  }

  async deleteBooking(
    bookingId: string,
    customerId: string
  ): Promise<void> {
    if (!bookingId.trim()) {
      throw new Error(
        "Booking ID is required."
      );
    }

    if (!customerId.trim()) {
      throw new Error(
        "Customer ID is required."
      );
    }

    await this.repository.delete(
      bookingId,
      customerId
    );
  }

  async getWashingBusinesses(): Promise<
    WashingBusiness[]
  > {
    return this.repository.getWashingBusinesses();
  }

  async getWashingPoints(
    businessId?: string
  ): Promise<WashingPoint[]> {
    return this.repository.getWashingPoints(
      businessId
    );
  }

  async getWashingServices(
    businessId?: string
  ): Promise<WashingService[]> {
    return this.repository.getWashingServices(
      businessId
    );
  }

  private validateBooking(
    data: Booking
  ): void {
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
        "Please select a washing agency."
      );
    }

    if (!data.washingPointId.trim()) {
      throw new Error(
        "Please select a washing point."
      );
    }

    if (!data.washingServiceId.trim()) {
      throw new Error(
        "Please select a washing service."
      );
    }

    if (!data.vehicleType) {
      throw new Error(
        "Please select your vehicle type."
      );
    }

    if (!data.serviceType) {
      throw new Error(
        "Please select a washing service."
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
      data.amount <= 0
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
