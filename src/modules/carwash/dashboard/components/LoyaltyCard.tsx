import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/core/auth";

import { BookingService } from "@/modules/carwash/booking/services/BookingService";
import type { Booking } from "@/modules/carwash/booking/types/Booking";

export default function LoyaltyCard() {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

        const service = new BookingService();

        const data =
          await service.customerBookings(user.id);

        if (!cancelled) {
          setBookings(data);
        }
      } catch (error) {
        console.error(
          "Unable to load loyalty activity:",
          error
        );

        if (!cancelled) {
          setBookings([]);
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

  const completedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "completed"
      ),
    [bookings]
  );

  const totalSpent = useMemo(
    () =>
      completedBookings.reduce(
        (total, booking) =>
          total + Number(booking.amount || 0),
        0
      ),
    [completedBookings]
  );

  const points = Math.floor(
    totalSpent / 1000
  );

  const progress = Math.min(
    points % 10,
    10
  );

  const nextReward =
    progress === 0
      ? 10
      : 10 - progress;

  return (
    <section
      style={{
        minHeight: 190,
        padding: 22,
        borderRadius: 16,
        background: "#fff",
        border: "1px solid #e5e7eb",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#92400e",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Loyalty
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginTop: 8,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#172033",
            fontSize: 28,
          }}
        >
          {authLoading || loading
            ? "..."
            : `${points} Points`}
        </h2>

        <span
          style={{
            padding: "7px 10px",
            borderRadius: 999,
            background: "#fef3c7",
            color: "#92400e",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ECOS Rewards
        </span>
      </div>

      <p
        style={{
          color: "#667085",
          lineHeight: 1.5,
          fontSize: 14,
        }}
      >
        Earn 1 point for every FCFA
        1,000 spent on completed services.
      </p>

      {!authLoading && !loading && (
        <>
          <div
            style={{
              height: 8,
              background: "#f3f4f6",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 10}%`,
                height: "100%",
                background: "#d97706",
                borderRadius: 999,
              }}
            />
          </div>

          <p
            style={{
              margin: "9px 0 0",
              color: "#667085",
              fontSize: 12,
            }}
          >
            {nextReward} more point
            {nextReward === 1 ? "" : "s"}{" "}
            to reach the next 10-point
            milestone.
          </p>
        </>
      )}
    </section>
  );
}
