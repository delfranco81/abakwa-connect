import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth";

import { BookingService } from "@/modules/carwash/booking/services/BookingService";
import type { Booking } from "@/modules/carwash/booking/types/Booking";

export default function UpcomingBookings() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      if (!user) {
        if (!cancelled) {
          setBookings([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const service = new BookingService();

        const data =
          await service.customerBookings(user.id);

        if (!cancelled) {
          setBookings(data);
        }
      } catch (err) {
        console.error(
          "Unable to load upcoming bookings:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load upcoming bookings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadBookings();
    }

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const upcoming = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === "pending" ||
          booking.status === "confirmed" ||
          booking.status === "washing"
      )
      .slice(0, 3);
  }, [bookings]);

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
          alignItems: "center",
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
            Upcoming Bookings
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#667085",
              fontSize: 14,
            }}
          >
            Your active washing services.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/booking")}
          style={{
            padding: "9px 13px",
            border: "none",
            borderRadius: 8,
            background: "#003b36",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          New Booking
        </button>
      </div>

      {authLoading || loading ? (
        <p
          style={{
            marginTop: 20,
            color: "#667085",
          }}
        >
          Loading your bookings...
        </p>
      ) : error ? (
        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      ) : upcoming.length === 0 ? (
        <div
          style={{
            marginTop: 20,
            padding: 25,
            borderRadius: 12,
            background: "#f8fafc",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 7px",
              color: "#172033",
            }}
          >
            No upcoming bookings
          </h3>

          <p
            style={{
              margin: "0 0 15px",
              color: "#667085",
            }}
          >
            Book your next vehicle cleaning
            service when you are ready.
          </p>

          <button
            type="button"
            onClick={() => navigate("/booking")}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              background: "#003b36",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Book a Wash
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 20,
          }}
        >
          {upcoming.map((booking) => (
            <article
              key={booking.id}
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#fcfdfd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "#172033",
                      fontSize: 17,
                    }}
                  >
                    {booking.serviceType ||
                      "Car Wash"}
                  </h3>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#667085",
                      fontSize: 13,
                    }}
                  >
                    {booking.vehicleType ||
                      "Vehicle not specified"}
                  </p>
                </div>

                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: 999,
                    background:
                      booking.status === "washing"
                        ? "#fef3c7"
                        : booking.status ===
                            "confirmed"
                          ? "#dcfce7"
                          : "#e0f2fe",
                    color:
                      booking.status === "washing"
                        ? "#92400e"
                        : booking.status ===
                            "confirmed"
                          ? "#166534"
                          : "#075985",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "capitalize",
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
                  gap: 10,
                  marginTop: 15,
                  color: "#475467",
                  fontSize: 13,
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
                  <strong>Amount</strong>
                  <br />
                  FCFA{" "}
                  {Number(
                    booking.amount || 0
                  ).toLocaleString()}
                </div>

                <div>
                  <strong>Location</strong>
                  <br />
                  {booking.location ||
                    "Not specified"}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
