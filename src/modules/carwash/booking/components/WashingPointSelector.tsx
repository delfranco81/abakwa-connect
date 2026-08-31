import { useEffect, useState } from "react";

import { supabase } from "@/core/database/supabase";

interface Business {
  id: string;
  name: string | null;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  area: string | null;
  landmark: string | null;
  rating: string | null;
  total_reviews: string | null;
  cover_image: string | null;
  logo: string | null;
  verified: string | null;
  featured: string | null;
}

interface Props {
  value: string;
  onChange: (business: Business | null) => void;
}

export default function WashingPointSelector({
  value,
  onChange,
}: Props) {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setLoading(true);
        setError("");

        const { data, error } =
          await supabase
            .from("business")
            .select(`
              id,
              name,
              category,
              phone,
              whatsapp,
              address,
              area,
              landmark,
              rating,
              total_reviews,
              cover_image,
              logo,
              verified,
              featured
            `)
            .order("name", {
              ascending: true,
            });

        if (error) {
          throw new Error(error.message);
        }

        setBusinesses(data ?? []);
      } catch (err) {
        console.error(
          "Unable to load washing points:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load washing points."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const businessId = event.target.value;

    const business =
      businesses.find(
        (item) => item.id === businessId
      ) ?? null;

    onChange(business);
  }

  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Choose Washing Point
      </label>

      {loading && (
        <p>Loading washing points...</p>
      )}

      {error && (
        <div
          style={{
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            background: "#3a1717",
            color: "#ff8d8d",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <select
          value={value}
          onChange={handleChange}
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

          {businesses.map((business) => (
            <option
              key={business.id}
              value={business.id}
            >
              {business.name ??
                "Unnamed Washing Point"}
            </option>
          ))}
        </select>
      )}

      {value && (
        <div
          style={{
            marginTop: 15,
            padding: 15,
            borderRadius: 10,
            background: "#f5f7fa",
          }}
        >
          {(() => {
            const business =
              businesses.find(
                (item) => item.id === value
              );

            if (!business) {
              return null;
            }

            return (
              <>
                <strong>
                  {business.name}
                </strong>

                {business.address && (
                  <p>
                    Address:{" "}
                    {business.address}
                  </p>
                )}

                {business.area && (
                  <p>
                    Area: {business.area}
                  </p>
                )}

                {business.phone && (
                  <p>
                    Phone:{" "}
                    {business.phone}
                  </p>
                )}

                {business.whatsapp && (
                  <p>
                    WhatsApp:{" "}
                    {business.whatsapp}
                  </p>
                )}

                {business.rating && (
                  <p>
                    Rating:{" "}
                    {business.rating}
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}