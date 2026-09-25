import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOwnedBusinessById } from "../../services/business/BusinessOwnerService";

type BookingStatus =
  | "pending"
  | "accepted"
  | "washing"
  | "completed"
  | "cancelled";

type Booking = {
  id: string;
  customer_id: string;
  business_id: string;
  booking_date: string;
  booking_time: string;
  location: string;
  amount: number;
  status: string;
  customer_notes: string | null;
  contact_phone: string | null;
  google_maps_url: string | null;
  cleaning_category: string | null;
  cleaning_requirements: string | null;
  service_details: Record<string, unknown> | null;
  created_at: string | null;
};

const statuses: BookingStatus[] = [
  "pending",
  "accepted",
  "washing",
  "completed",
  "cancelled",
];

export default function Bookings() {
  const [searchParams] = useSearchParams();

  const businessId = searchParams.get("businessId") ?? "";

  const [businessName, setBusinessName] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      if (!businessId) {
        setError("Business ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const ownedBusiness = await getOwnedBusinessById(businessId);

        if (!ownedBusiness) {
          setError(
            "Business not found or you do not have permission to manage it."
          );
          setBookings([]);
          return;
        }

        setBusinessName(ownedBusiness.name ?? "Business");

        const { data, error: bookingError } = await supabase
          .from("bookings")
          .select(
            "id,customer_id,business_id,booking_date,booking_time,location,amount,status,customer_notes,contact_phone,google_maps_url,cleaning_category,cleaning_requirements,service_details,created_at"
          )
          .eq("business_id", ownedBusiness.id)
          .not("cleaning_category", "is", null)
          .order("created_at", { ascending: false });

        if (bookingError) {
          throw bookingError;
        }

        setBookings((data ?? []) as Booking[]);
      } catch (loadError) {
        console.error("Unable to load bookings:", loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load bookings."
        );

        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, [businessId]);

  async function updateStatus(
    bookingId: string,
    status: BookingStatus
  ) {
    setUpdatingId(bookingId);
    setError("");

    try {
      const { data, error: updateError } = await supabase
        .from("bookings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .eq("business_id", businessId)
        .select("id,status")
        .single();

      if (updateError) {
        throw updateError;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === data.id
            ? { ...booking, status: data.status }
            : booking
        )
      );
    } catch (updateError) {
      console.error("Unable to update booking:", updateError);

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update booking."
      );
    } finally {
      setUpdatingId("");
    }
  }

  function serviceName(booking: Booking) {
    const details = booking.service_details;

    if (
      details &&
      typeof details.serviceName === "string" &&
      details.serviceName.trim()
    ) {
      return details.serviceName;
    }

    return booking.cleaning_category?.replace(/-/g, " ") ??
      "Cleaning service";
  }

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Loading bookings...</p>
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
        <h1>Bookings</h1>
        <p>
          Manage customer bookings for{" "}
          <strong>{businessName || "your business"}</strong>.
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

      {!error && bookings.length === 0 && (
        <div
          style={{
            padding: "2rem",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
          }}
        >
          <h2>No bookings yet</h2>
          <p>
            New customer cleaning bookings will appear here.
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "1rem",
        }}
      >
        {bookings.map((booking) => (
          <article
            key={booking.id}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ marginTop: 0 }}>
                  {serviceName(booking)}
                </h2>

                <p>
                  <strong>Date:</strong>{" "}
                  {booking.booking_date} at{" "}
                  {booking.booking_time}
                </p>

                <p>
                  <strong>Customer phone:</strong>{" "}
                  {booking.contact_phone || "Not provided"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {booking.location}
                </p>

                {booking.cleaning_requirements && (
                  <p>
                    <strong>Requirements:</strong>{" "}
                    {booking.cleaning_requirements}
                  </p>
                )}

                {booking.customer_notes && (
                  <p>
                    <strong>Notes:</strong>{" "}
                    {booking.customer_notes}
                  </p>
                )}

                <p>
                  <strong>Amount:</strong>{" "}
                  {Number(booking.amount).toLocaleString()} FCFA
                </p>

                {booking.google_maps_url && (
                  <p>
                    <a
                      href={booking.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open customer location
                    </a>
                  </p>
                )}
              </div>

              <div>
                <label>
                  <strong>Status</strong>
                  <br />

                  <select
                    value={booking.status}
                    disabled={updatingId === booking.id}
                    onChange={(event) =>
                      void updateStatus(
                        booking.id,
                        event.target.value as BookingStatus
                      )
                    }
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.6rem",
                    }}
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
