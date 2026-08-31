import { useEffect, useState } from "react";

import { useAuth } from "@/core/auth";

import { BookingService } from "@/modules/carwash/booking/services/BookingService";
import type { Booking } from "@/modules/carwash/booking/types/Booking";

export default function WalletCard() {
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
          "Unable to load wallet activity:",
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

  const totalCompleted = bookings
    .filter(
      (booking) =>
        booking.status === "completed"
    )
    .reduce(
      (total, booking) =>
        total + Number(booking.amount || 0),
      0
    );

  return (
    <section
      style={{
        minHeight: 190,
        padding: 22,
        borderRadius: 16,
        background:
          "linear-gradient(135deg, #003b36, #00695c)",
        color: "#fff",
        boxShadow:
          "0 8px 25px rgba(0,59,54,0.16)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#9de8df",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Wallet
          </p>

          <h2
            style={{
              margin: "8px 0",
              fontSize: 25,
            }}
          >
            Wallet coming soon
          </h2>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "rgba(255,255,255,0.12)",
            fontSize: 20,
          }}
        >
          FC
        </div>
      </div>

      <p
        style={{
          margin: "15px 0 12px",
          color:
            "rgba(255,255,255,0.82)",
          lineHeight: 1.5,
          fontSize: 14,
        }}
      >
        Your ECOS wallet infrastructure
        will be connected here when wallet
        transactions are enabled.
      </p>

      <div
        style={{
          paddingTop: 12,
          borderTop:
            "1px solid rgba(255,255,255,0.15)",
          fontSize: 13,
        }}
      >
        {authLoading || loading
          ? "Loading booking activity..."
          : `Completed service spend: FCFA ${totalCompleted.toLocaleString()}`}
      </div>
    </section>
  );
}
