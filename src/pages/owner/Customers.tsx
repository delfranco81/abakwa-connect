import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOwnedBusinessById } from "../../services/business/BusinessOwnerService";

type CustomerBooking = {
  customer_id: string;
  contact_phone: string | null;
  booking_date: string;
  amount: number;
  status: string;
  created_at: string | null;
};

type CustomerSummary = {
  customerId: string;
  phone: string | null;
  bookingCount: number;
  completedBookings: number;
  completedValue: number;
  lastBookingDate: string;
};

export default function Customers() {
  const [searchParams] = useSearchParams();

  const businessId =
    searchParams.get("businessId")?.trim() ?? "";

  const [businessName, setBusinessName] = useState("");
  const [customers, setCustomers] =
    useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      if (!businessId) {
        setError("Business ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const ownedBusiness =
          await getOwnedBusinessById(businessId);

        if (!ownedBusiness) {
          setError(
            "Business not found or you do not have permission to manage it."
          );
          setCustomers([]);
          return;
        }

        setBusinessName(
          ownedBusiness.name ?? "Business"
        );

        const { data, error: bookingError } =
          await supabase
            .from("bookings")
            .select(
              "customer_id,contact_phone,booking_date,amount,status,created_at"
            )
            .eq("business_id", ownedBusiness.id)
            .order("created_at", {
              ascending: false,
            });

        if (bookingError) {
          throw bookingError;
        }

        const summaries =
          new Map<string, CustomerSummary>();

        for (const booking of
          (data ?? []) as CustomerBooking[]) {
          if (!booking.customer_id) {
            continue;
          }

          const existing =
            summaries.get(booking.customer_id);

          const isCompleted =
            booking.status === "completed";

          if (!existing) {
            summaries.set(booking.customer_id, {
              customerId: booking.customer_id,
              phone: booking.contact_phone,
              bookingCount: 1,
              completedBookings:
                isCompleted ? 1 : 0,
              completedValue:
                isCompleted
                  ? Number(booking.amount ?? 0)
                  : 0,
              lastBookingDate:
                booking.booking_date,
            });

            continue;
          }

          existing.bookingCount += 1;

          if (!existing.phone && booking.contact_phone) {
            existing.phone = booking.contact_phone;
          }

          if (isCompleted) {
            existing.completedBookings += 1;
            existing.completedValue +=
              Number(booking.amount ?? 0);
          }
        }

        setCustomers(
          Array.from(summaries.values())
        );
      } catch (loadError) {
        console.error(
          "Unable to load customers:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load customers."
        );

        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    void loadCustomers();
  }, [businessId]);

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Loading customers...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2rem 1rem 4rem",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1>Customers</h1>

        <p>
          Customers who have booked{" "}
          <strong>
            {businessName || "your business"}
          </strong>
          .
        </p>
      </header>

      {error && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            border: "1px solid #dc2626",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {!error && customers.length === 0 && (
        <div
          style={{
            padding: "2rem",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
          }}
        >
          <h2>No customers yet</h2>

          <p>
            Customers will appear here after they
            make a booking.
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "1rem",
        }}
      >
        {customers.map((customer) => (
          <article
            key={customer.customerId}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              padding: "1.25rem",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {customer.phone ||
                "Customer"}
            </h2>

            <p>
              <strong>Total bookings:</strong>{" "}
              {customer.bookingCount}
            </p>

            <p>
              <strong>Completed bookings:</strong>{" "}
              {customer.completedBookings}
            </p>

            <p>
              <strong>Completed value:</strong>{" "}
              {customer.completedValue.toLocaleString()}{" "}
              FCFA
            </p>

            <p>
              <strong>Most recent booking:</strong>{" "}
              {customer.lastBookingDate ||
                "Not available"}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
