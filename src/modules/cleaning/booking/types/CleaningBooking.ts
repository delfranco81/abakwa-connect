export type CleaningCategory =
  | "car-wash"
  | "vehicle-detailing"
  | "home-cleaning"
  | "hotel-cleaning"
  | "office-cleaning"
  | "laundry"
  | "carpet-cleaning"
  | "general-cleaning"
  | "other-cleaning";

export type CleaningBookingStatus =
  | "pending"
  | "accepted"
  | "washing"
  | "completed"
  | "cancelled";

export interface CleaningServiceDetails {
  propertyType?: string;
  rooms?: number;
  areaSize?: string;
  itemCount?: number;
  weight?: string;
  pickupRequired?: boolean;
  deliveryRequired?: boolean;
  serviceMode?: string;
  vehicleType?: string;
  condition?: string;
  additionalDetails?: string;
  [key: string]: unknown;
}

export interface CleaningPhotoReference {
  path: string;
  url?: string;
  caption?: string;
}

export interface CleaningBooking {
  id: string;
  customerId: string;
  businessId: string;
  washingPointId: string | null;
  washingServiceId: string;
  cleaningCategory: CleaningCategory;
  cleaningRequirements: string;
  serviceDetails: CleaningServiceDetails;
  customerPhotos: CleaningPhotoReference[];
  bookingDate: string;
  bookingTime: string;
  location: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  locationAccuracy: number | null;
  googleMapsUrl: string | null;
  customerNotes: string;
  contactPhone: string;
  amount: number;
  status: CleaningBookingStatus;
  createdAt: string;
  updatedAt?: string;
}

