import type { Booking } from "../types/Booking";

interface Props {
  booking: Booking;
}

function formatVehicleType(
  vehicleType: Booking["vehicleType"]
): string {
  if (!vehicleType) {
    return "Not selected";
  }

  return vehicleType
    .charAt(0)
    .toUpperCase() +
    vehicleType.slice(1);
}

function formatServiceType(
  serviceType: Booking["serviceType"]
): string {
  if (!serviceType) {
    return "Not selected";
  }

  switch (serviceType) {
    case "basic":
      return "Basic Wash";

    case "premium":
      return "Premium Detail";

    case "interior":
      return "Interior Cleaning";

    case "engine":
      return "Engine Cleaning";

    default:
      return serviceType;
  }
}

function formatAmount(
  amount: number
): string {
  return Number(
    amount || 0
  ).toLocaleString();
}

export default function BookingSummary({
  booking,
}: Props) {
  return (
    <section
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 18,
          color: "#172033",
        }}
      >
        Booking Summary
      </h2>

      <div
        style={{
          display: "grid",
          gap: 10,
          lineHeight: 1.6,
        }}
      >
        <div>
          <strong>Vehicle:</strong>{" "}
          {formatVehicleType(
            booking.vehicleType
          )}
        </div>

        <div>
          <strong>Service:</strong>{" "}
          {formatServiceType(
            booking.serviceType
          )}
        </div>

        <div>
          <strong>Date:</strong>{" "}
          {booking.bookingDate ||
            "Not selected"}
        </div>

        <div>
          <strong>Time:</strong>{" "}
          {booking.bookingTime ||
            "Not selected"}
        </div>

        <div>
          <strong>Location:</strong>{" "}
          {booking.location ||
            "Not provided"}
        </div>

        {booking.vehicleDescription && (
          <div>
            <strong>Vehicle details:</strong>{" "}
            {booking.vehicleDescription}
          </div>
        )}

        {booking.contactPhone && (
          <div>
            <strong>Contact:</strong>{" "}
            {booking.contactPhone}
          </div>
        )}

        {booking.customerNotes && (
          <div>
            <strong>Notes:</strong>{" "}
            {booking.customerNotes}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 18,
          borderTop:
            "1px solid #dbe2ea",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <strong
          style={{
            fontSize: 18,
            color: "#172033",
          }}
        >
          Total
        </strong>

        <strong
          style={{
            fontSize: 22,
            color: "#003b36",
          }}
        >
          FCFA{" "}
          {formatAmount(
            booking.amount
          )}
        </strong>
      </div>
    </section>
  );
}
