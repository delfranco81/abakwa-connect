export type BookingVehicleType =
  | ""
  | "sedan"
  | "suv"
  | "truck"
  | "motorcycle";

export type BookingServiceType =
  | ""
  | "basic"
  | "premium"
  | "interior"
  | "engine";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "washing"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;

  customerId: string;

  businessId: string;

  washingPointId: string;

  washingServiceId: string;

  vehicleType: BookingVehicleType;

  serviceType: BookingServiceType;

  bookingDate: string;

  bookingTime: string;

  location: string;

  locationLatitude: number | null;

  locationLongitude: number | null;

  googleMapsUrl: string | null;

  customerNotes: string;

  vehicleDescription: string;

  contactPhone: string;

  amount: number;

  status: BookingStatus;

  createdAt: string;

  updatedAt?: string;
}