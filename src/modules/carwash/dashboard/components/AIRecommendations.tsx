import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth";

import { BookingService } from "@/modules/carwash/booking/services/BookingService";
import type { Booking } from "@/modules/carwash/booking/types/Booking";

type Recommendation = {
  title: string;
  message: string;
  action: string;
  actionTarget: string;
};

export default function AIRecommendations() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!user) {
        if (!cancelled) {
          setBookings([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        const service =
          new BookingService();

        const data =
          await service.customerBookings(
            user.id
          );

        if (!cancelled) {
          setBookings(data);
        }
      } catch (error) {
        console.error(
          "Unable to load recommendation history:",
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
      loadHistory();
    }

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const recommendation =
    useMemo<Recommendation>(() => {
      if (bookings.length === 0) {
        return {
          title:
            "Ready for your first wash?",
          message:
            "Book your first washing service and start building your ECOS customer history.",
          action:
            "Book your first service",
          actionTarget: "/booking",
        };
      }

      const completed =
        bookings.filter(
          (booking) =>
            booking.status ===
            "completed"
        );

      if (completed.length === 0) {
        return {
          title:
            "Your first completed wash is waiting",
          message:
            "You already have booking activity. Complete a washing service to start building your customer activity history.",
          action:
            "View available services",
          actionTarget:
            "/cleaning-services",
        };
      }

      const serviceCounts =
        new Map<string, number>();

      for (const booking of completed) {
        const service =
          booking.serviceType ||
          "Car Wash";

        serviceCounts.set(
          service,
          (serviceCounts.get(
            service
          ) ?? 0) + 1
        );
      }

      let mostUsedService =
        "Car Wash";

      let highestCount = 0;

      for (const [
        service,
        count,
      ] of serviceCounts.entries()) {
        if (
          count >
          highestCount
        ) {
          mostUsedService =
            service;

          highestCount =
            count;
        }
      }

      if (
        mostUsedService ===
        "basic"
      ) {
        return {
          title:
            "Consider a deeper clean",
          message:
            "You have used the basic service several times. Consider trying an interior or premium service when your vehicle needs more detailed care.",
          action:
            "Explore services",
          actionTarget:
            "/cleaning-services",
        };
      }

      if (
        mostUsedService ===
        "interior"
      ) {
        return {
          title:
            "Balance your next wash",
          message:
            "Your history shows regular interior cleaning. Consider an exterior or basic wash for complete vehicle care.",
          action:
            "Explore services",
          actionTarget:
            "/cleaning-services",
        };
      }

      if (
        mostUsedService ===
        "premium"
      ) {
        return {
          title:
            "Keep your vehicle looking its best",
          message:
            "You regularly use premium cleaning. Continue scheduling professional care based on your vehicle's condition.",
          action:
            "Book another service",
          actionTarget:
            "/booking",
        };
      }

      return {
        title:
          "Keep your vehicle maintained",
        message:
          `Your recent history contains ${highestCount} completed ${mostUsedService} service${highestCount === 1 ? "" : "s"}. Schedule your next wash when your vehicle needs attention.`,
        action:
          "Book another service",
        actionTarget:
          "/booking",
      };
    }, [bookings]);

  return (
    <section
      style={{
        padding: 22,
        borderRadius: 14,
        background:
          "linear-gradient(135deg, #ecfeff, #f0fdf4)",
        border:
          "1px solid #ccfbf1",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            background: "#003b36",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          AI
        </span>

        <h2
          style={{
            margin: 0,
            color: "#172033",
            fontSize: 20,
          }}
        >
          Smart Recommendation
        </h2>
      </div>

      {authLoading ||
      loading ? (
        <p
          style={{
            marginBottom: 0,
            color: "#667085",
          }}
        >
          Analyzing your booking activity...
        </p>
      ) : (
        <>
          <h3
            style={{
              margin:
                "12px 0 7px",
              color: "#003b36",
            }}
          >
            {recommendation.title}
          </h3>

          <p
            style={{
              margin: 0,
              color: "#475467",
              lineHeight: 1.6,
            }}
          >
            {recommendation.message}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                recommendation.actionTarget
              )
            }
            style={{
              marginTop: 16,
              padding:
                "10px 14px",
              border: "none",
              borderRadius: 8,
              background:
                "#003b36",
              color: "#fff",
              cursor:
                "pointer",
              fontWeight: 700,
            }}
          >
            {recommendation.action}
          </button>
        </>
      )}
    </section>
  );
}
