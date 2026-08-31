import { useEffect, useMemo, useState } from "react";

import BookingSummary from "./BookingSummary";
import DatePicker from "./DatePicker";
import LocationPicker from "./LocationPicker";
import ServiceSelector from "./ServiceSelector";
import TimePicker from "./TimePicker";
import VehicleSelector from "./VehicleSelector";

import { BookingService } from "../services/BookingService";

import type {
  Booking,
  BookingVehicleType,
  BookingServiceType,
} from "../types/Booking";

import type {
  WashingBusiness,
  WashingPoint,
  WashingService,
} from "../repositories/BookingRepository";

import { useAuth } from "@/core/auth";

interface LocationValue {
  address: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export default function BookingForm() {
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<WashingBusiness[]>([]);
  const [washingPoints, setWashingPoints] = useState<WashingPoint[]>([]);

  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");

  const [selectedService, setSelectedService] =
    useState<WashingService | null>(null);

  const [vehicleType, setVehicleType] =
    useState<BookingVehicleType>("");

  const [serviceType, setServiceType] =
    useState<BookingServiceType>("");

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [location, setLocation] = useState<LocationValue>({
    address: "",
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const [customerNotes, setCustomerNotes] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [businessLoading, setBusinessLoading] = useState(true);
  const [pointLoading, setPointLoading] = useState(false);

  /*
   * Load washing agencies.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadBusinesses() {
      try {
        setBusinessLoading(true);
        setError("");

        const service = new BookingService();

        const data = await service.getWashingBusinesses();

        if (!cancelled) {
          setBusinesses(data);
        }
      } catch (err) {
        console.error(
          "Unable to load washing businesses:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load washing agencies."
          );

          setBusinesses([]);
        }
      } finally {
        if (!cancelled) {
          setBusinessLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load washing points whenever
   * the customer chooses an agency.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPoints() {
      if (!selectedBusinessId) {
        setWashingPoints([]);
        setSelectedPointId("");
        setSelectedService(null);
        return;
      }

      try {
        setPointLoading(true);
        setError("");

        const service = new BookingService();

        const data = await service.getWashingPoints(
          selectedBusinessId
        );

        if (!cancelled) {
          setWashingPoints(data);
        }
      } catch (err) {
        console.error(
          "Unable to load washing points:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load washing points."
          );

          setWashingPoints([]);
        }
      } finally {
        if (!cancelled) {
          setPointLoading(false);
        }
      }
    }

    loadPoints();

    return () => {
      cancelled = true;
    };
  }, [selectedBusinessId]);

  /*
   * Selected agency.
   */
  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id === selectedBusinessId
      ) ?? null,
    [businesses, selectedBusinessId]
  );

  /*
   * Selected washing point.
   */
  const selectedPoint = useMemo(
    () =>
      washingPoints.find(
        (point) =>
          point.id === selectedPointId
      ) ?? null,
    [washingPoints, selectedPointId]
  );

  /*
   * Selected service price.
   */
  const amount = selectedService?.price ?? 0;

  /*
   * Keep the existing serviceType field
   * compatible with the Booking model.
   */
  useEffect(() => {
    if (!selectedService) {
      setServiceType("");
      return;
    }

    const serviceName =
      selectedService.serviceName.toLowerCase();

    if (serviceName.includes("premium")) {
      setServiceType("premium");
    } else if (serviceName.includes("interior")) {
      setServiceType("interior");
    } else if (serviceName.includes("engine")) {
      setServiceType("engine");
    } else {
      setServiceType("basic");
    }
  }, [selectedService]);

  /*
   * Generate Google Maps URL from
   * customer's selected coordinates.
   */
  const googleMapsUrl =
    location.latitude !== null &&
    location.longitude !== null
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null;

  /*
   * Current booking object.
   *
   * This is intentionally created from
   * the current form state so BookingSummary
   * always displays the latest information.
   */
  const booking: Booking = {
    id: crypto.randomUUID(),

    customerId: user?.id ?? "",

    businessId: selectedBusinessId,

    washingPointId: selectedPointId,

    washingServiceId: selectedService?.id ?? "",

    vehicleType,

    serviceType,

    bookingDate,

    bookingTime,

    location: location.address,

    locationLatitude: location.latitude,

    locationLongitude: location.longitude,

    googleMapsUrl,

    customerNotes,

    vehicleDescription,

    contactPhone,

    amount,

    status: "pending",

    createdAt: new Date().toISOString(),
  };

  function handleBusinessChange(
    businessId: string
  ) {
    setSelectedBusinessId(businessId);

    setSelectedPointId("");

    setWashingPoints([]);

    setSelectedService(null);

    setError("");
  }

  function handlePointChange(
    pointId: string
  ) {
    setSelectedPointId(pointId);

    setSelectedService(null);

    setError("");
  }

  function handleLocationChange(
    value: LocationValue
  ) {
    setLocation(value);
  }

  async function handleBooking() {
    setError("");

    if (!user) {
      setError(
        "You must be logged in to create a booking."
      );
      return;
    }

    if (!selectedBusinessId) {
      setError(
        "Please choose a washing agency."
      );
      return;
    }

    if (!selectedPointId) {
      setError(
        "Please choose a washing point."
      );
      return;
    }

    if (!selectedService) {
      setError(
        "Please choose a washing service."
      );
      return;
    }

    if (!vehicleType) {
      setError(
        "Please select your vehicle type."
      );
      return;
    }

    if (!bookingDate) {
      setError(
        "Please select your booking date."
      );
      return;
    }

    if (!bookingTime) {
      setError(
        "Please select your booking time."
      );
      return;
    }

    if (!location.address.trim()) {
      setError(
        "Please describe where your vehicle is located."
      );
      return;
    }

    if (
      location.latitude === null ||
      location.longitude === null
    ) {
      setError(
        "Please use the location button to capture your exact location."
      );
      return;
    }

    if (!contactPhone.trim()) {
      setError(
        "Please enter your contact phone number."
      );
      return;
    }

    if (!vehicleDescription.trim()) {
      setError(
        "Please describe the condition of your vehicle."
      );
      return;
    }

    try {
      setLoading(true);

      const bookingService =
        new BookingService();

      await bookingService.createBooking(
        booking
      );

      alert(
        "Booking created successfully."
      );

      /*
       * Reset form.
       */
      setSelectedBusinessId("");
      setSelectedPointId("");
      setWashingPoints([]);
      setSelectedService(null);

      setVehicleType("");
      setServiceType("");

      setBookingDate("");
      setBookingTime("");

      setLocation({
        address: "",
        latitude: null,
        longitude: null,
        accuracy: null,
      });

      setCustomerNotes("");
      setVehicleDescription("");
      setContactPhone("");
    } catch (err) {
      console.error(
        "Unable to create booking:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create booking."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>
        Book a Car Wash
      </h1>

      <p
        style={{
          color: "#666",
        }}
      >
        Choose a washing agency, select
        their available service and tell
        them exactly where your vehicle is.
      </p>

      {/* Washing Agency */}

      <div
        style={{
          marginTop: 25,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Washing Agency
        </label>

        {businessLoading ? (
          <p>
            Loading washing agencies...
          </p>
        ) : businesses.length === 0 ? (
          <div
            style={{
              padding: 15,
              borderRadius: 10,
              background: "#fff7e6",
              border: "1px solid #f0d28a",
              color: "#765b19",
            }}
          >
            <strong>
              No washing agencies registered yet.
            </strong>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              Once washing agencies register
              and are approved, they will
              appear here.
            </p>
          </div>
        ) : (
          <select
            value={selectedBusinessId}
            onChange={(event) =>
              handleBusinessChange(
                event.target.value
              )
            }
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 8,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <option value="">
              Select a washing agency
            </option>

            {businesses.map(
              (business) => (
                <option
                  key={business.id}
                  value={business.id}
                >
                  {business.name}
                  {business.verified
                    ? " ✓"
                    : ""}
                </option>
              )
            )}
          </select>
        )}
      </div>

      {/* Agency Contact */}

      {selectedBusiness && (
        <div
          style={{
            marginTop: 15,
            padding: 15,
            borderRadius: 10,
            background: "#eef8f2",
          }}
        >
          <strong>
            {selectedBusiness.name}
          </strong>

          {selectedBusiness.phone && (
            <p>
              Phone:{" "}
              <a
                href={`tel:${selectedBusiness.phone}`}
              >
                {selectedBusiness.phone}
              </a>
            </p>
          )}

          {selectedBusiness.email && (
            <p>
              Email:{" "}
              <a
                href={`mailto:${selectedBusiness.email}`}
              >
                {selectedBusiness.email}
              </a>
            </p>
          )}

          {selectedBusiness.address && (
            <p>
              Address:{" "}
              {selectedBusiness.address}
            </p>
          )}

          {selectedBusiness.rating > 0 && (
            <p>
              Rating:{" "}
              {selectedBusiness.rating}
            </p>
          )}
        </div>
      )}

      <br />

      {/* Washing Point */}

      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Washing Point
        </label>

        {!selectedBusinessId ? (
          <p
            style={{
              color: "#777",
            }}
          >
            Select a washing agency first.
          </p>
        ) : pointLoading ? (
          <p>
            Loading washing points...
          </p>
        ) : washingPoints.length === 0 ? (
          <p
            style={{
              color: "#777",
            }}
          >
            This washing agency does not
            currently have an available
            washing point.
          </p>
        ) : (
          <select
            value={selectedPointId}
            onChange={(event) =>
              handlePointChange(
                event.target.value
              )
            }
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 8,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <option value="">
              Select a washing point
            </option>

            {washingPoints.map(
              (point) => (
                <option
                  key={point.id}
                  value={point.id}
                >
                  {point.name}
                </option>
              )
            )}
          </select>
        )}
      </div>

      {/* Washing Point Details */}

      {selectedPoint && (
        <div
          style={{
            marginTop: 15,
            padding: 15,
            borderRadius: 10,
            background: "#f5f7fa",
          }}
        >
          <strong>
            {selectedPoint.name}
          </strong>

          {selectedPoint.address && (
            <p>
              Address:{" "}
              {selectedPoint.address}
            </p>
          )}

          {selectedPoint.phone && (
            <p>
              Phone:{" "}
              <a
                href={`tel:${selectedPoint.phone}`}
              >
                {selectedPoint.phone}
              </a>
            </p>
          )}
        </div>
      )}

      <br />

      {/* Service */}

      {selectedBusinessId && (
        <ServiceSelector
          businessId={selectedBusinessId}
          value={
            selectedService?.id ?? ""
          }
          onChange={
            setSelectedService
          }
        />
      )}

      <br />

      {/* Vehicle */}

      <VehicleSelector
        value={vehicleType}
        onChange={setVehicleType}
      />

      <br />

      {/* Date */}

      <DatePicker
        value={bookingDate}
        onChange={setBookingDate}
      />

      <br />

      {/* Time */}

      <TimePicker
        value={bookingTime}
        onChange={setBookingTime}
      />

      <br />

      {/* Customer Location */}

      <LocationPicker
        value={location}
        onChange={
          handleLocationChange
        }
      />

      <br />

      {/* Vehicle Description */}

      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Vehicle Description / Condition
        </label>

        <textarea
          value={vehicleDescription}
          onChange={(event) =>
            setVehicleDescription(
              event.target.value
            )
          }
          placeholder="Example: Toyota sedan, white, heavily muddy on the exterior and seats need deep cleaning."
          rows={4}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      </div>

      <br />

      {/* Contact Phone */}

      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Contact Phone
        </label>

        <input
          type="tel"
          value={contactPhone}
          onChange={(event) =>
            setContactPhone(
              event.target.value
            )
          }
          placeholder="Example: 6XXXXXXXX"
          autoComplete="tel"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
      </div>

      <br />

      {/* Customer Notes */}

      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Additional Notes
        </label>

        <textarea
          value={customerNotes}
          onChange={(event) =>
            setCustomerNotes(
              event.target.value
            )
          }
          placeholder="Any additional instructions for the washing agency..."
          rows={4}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      </div>

      <hr
        style={{
          margin: "30px 0",
        }}
      />

      {/* Summary */}

      <BookingSummary
        booking={booking}
      />

      {/* Error */}

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 8,
            background: "#3a1717",
            color: "#ff8d8d",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}

      <button
        type="button"
        onClick={handleBooking}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "15px 30px",
          border: "none",
          borderRadius: 8,
          cursor: loading
            ? "not-allowed"
            : "pointer",
          background: "#2d7ff9",
          color: "#fff",
          fontSize: 16,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading
          ? "Creating Booking..."
          : "Confirm Booking"}
      </button>
    </div>
  );
}