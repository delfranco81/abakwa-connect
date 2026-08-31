import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/core/auth";

import { BookingService } from "@/modules/carwash/booking/services/BookingService";
import type { Booking } from "@/modules/carwash/booking/types/Booking";

export default function BookingHistory() {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadBookings() {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const service = new BookingService();

      const data =
        await service.customerBookings(user.id);

      setBookings(data);
    } catch (err) {
      console.error(
        "Unable to load booking history:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadBookings();
    }
  }, [user, authLoading]);

  async function handleDelete(
    booking: Booking
  ) {
    if (!user) {
      setError(
        "You must be logged in to delete a booking."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete this ${booking.serviceType || "booking"} from your history? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(booking.id);
      setError("");

      const service = new BookingService();

      await service.deleteBooking(
        booking.id,
        user.id
      );

      setBookings((current) =>
        current.filter(
          (item) =>
            item.id !== booking.id
        )
      );
    } catch (err) {
      console.error(
        "Unable to delete booking:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete booking."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const completedCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "completed"
      ).length,
    [bookings]
  );

  const totalSpent = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === "completed"
        )
        .reduce(
          (total, booking) =>
            total +
            Number(booking.amount || 0),
          0
        ),
    [bookings]
  );

  return (
    <section
      style={{
        background: "#fff",
        padding: 22,
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: 21,
            }}
          >
            Booking History
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#667085",
              fontSize: 14,
            }}
          >
            Your previous vehicle cleaning
            services.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              background: "#f0fdf4",
              color: "#166534",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {completedCount} completed
          </span>

          <span
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              background: "#f8fafc",
              color: "#475467",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            FCFA{" "}
            {totalSpent.toLocaleString()} spent
          </span>
        </div>
      </div>

      {authLoading && (
        <p>Checking your account...</p>
      )}

      {!authLoading && loading && (
        <p
          style={{
            color: "#667085",
          }}
        >
          Loading your bookings...
        </p>
      )}

      {!authLoading &&
        !loading &&
        error && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 10,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

      {!authLoading &&
        !loading &&
        !error &&
        bookings.length === 0 && (
          <div
            style={{
              marginTop: 20,
              padding: 30,
              textAlign: "center",
              borderRadius: 12,
              background: "#f8fafc",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px",
                color: "#172033",
              }}
            >
              No bookings yet
            </h3>

            <p
              style={{
                margin: 0,
                color: "#667085",
              }}
            >
              Your completed and previous
              bookings will appear here.
            </p>
          </div>
        )}

      {!authLoading &&
        !loading &&
        bookings.map((booking) => (
          <article
            key={booking.id}
            style={{
              marginTop: 15,
              padding: 18,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: 18,
                    color: "#172033",
                  }}
                >
                  {booking.serviceType ||
                    "Car Wash"}
                </strong>

                <div
                  style={{
                    marginTop: 4,
                    color: "#667085",
                    fontSize: 13,
                  }}
                >
                  {booking.vehicleType ||
                    "Vehicle not specified"}
                </div>
              </div>

              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: 20,
                  background:
                    booking.status ===
                    "completed"
                      ? "#dcfce7"
                      : booking.status ===
                          "washing"
                        ? "#fef3c7"
                        : booking.status ===
                            "cancelled"
                          ? "#fee2e2"
                          : "#e0f2fe",
                  color:
                    booking.status ===
                    "completed"
                      ? "#166534"
                      : booking.status ===
                          "washing"
                        ? "#92400e"
                        : booking.status ===
                            "cancelled"
                          ? "#991b1b"
                          : "#075985",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform:
                    "capitalize",
                }}
              >
                {booking.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
                marginTop: 16,
                color: "#475467",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div>
                <strong>Date</strong>
                <br />
                {booking.bookingDate}
              </div>

              <div>
                <strong>Time</strong>
                <br />
                {booking.bookingTime}
              </div>

              <div>
                <strong>Location</strong>
                <br />
                {booking.location ||
                  "Not specified"}
              </div>

              <div>
                <strong>Amount</strong>
                <br />
                FCFA{" "}
                {Number(
                  booking.amount || 0
                ).toLocaleString()}
              </div>
            </div>

            {booking.vehicleDescription && (
              <p
                style={{
                  margin:
                    "15px 0 0",
                  color: "#667085",
                  fontSize: 13,
                }}
              >
                <strong>
                  Vehicle details:
                </strong>{" "}
                {booking.vehicleDescription}
              </p>
            )}

            {booking.customerNotes && (
              <p
                style={{
                  margin:
                    "8px 0 0",
                  color: "#667085",
                  fontSize: 13,
                }}
              >
                <strong>
                  Notes:
                </strong>{" "}
                {booking.customerNotes}
              </p>
            )}

            <div
              style={{
                marginTop: 18,
                paddingTop: 15,
                borderTop:
                  "1px solid #edf0f2",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  handleDelete(booking)
                }
                disabled={
                  deletingId ===
                  booking.id
                }
                style={{
                  padding:
                    "9px 14px",
                  border: "none",
                  borderRadius: 8,
                  background:
                    "#b42318",
                  color: "#fff",
                  cursor:
                    deletingId ===
                    booking.id
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    deletingId ===
                    booking.id
                      ? 0.6
                      : 1,
                  fontWeight: 700,
                }}
              >
                {deletingId ===
                booking.id
                  ? "Deleting..."
                  : "Delete from History"}
              </button>
            </div>
          </article>
        ))}
    </section>
  );
}
