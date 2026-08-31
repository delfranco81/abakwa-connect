import { useEffect, useState } from "react";

import {
  nearbyAgencyService,
  type NearbyAgency,
} from "@/services/business/NearbyAgencyService";

interface Props {
  latitude: number | null;
  longitude: number | null;
  value: string;
  onChange: (
    agency: NearbyAgency | null
  ) => void;
}

export default function NearbyAgencySelector({
  latitude,
  longitude,
  value,
  onChange,
}: Props) {
  const [agencies, setAgencies] =
    useState<NearbyAgency[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAgencies() {
      if (
        latitude === null ||
        longitude === null
      ) {
        setAgencies([]);
        onChange(null);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const results =
          await nearbyAgencyService
            .getNearbyAgencies(
              latitude,
              longitude,
              20
            );

        if (cancelled) {
          return;
        }

        setAgencies(results);

        /*
         * Clear the previous selection if
         * that agency is no longer nearby.
         */
        if (
          value &&
          !results.some(
            (agency) =>
              agency.id === value
          )
        ) {
          onChange(null);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load nearby agencies:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load nearby agencies."
        );

        setAgencies([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAgencies();

    return () => {
      cancelled = true;
    };
  }, [
    latitude,
    longitude,
    value,
    onChange,
  ]);

  function handleSelect(
    agency: NearbyAgency
  ) {
    onChange(agency);
  }

  if (
    latitude === null ||
    longitude === null
  ) {
    return (
      <div
        style={{
          padding: 15,
          borderRadius: 10,
          background: "#f5f7fa",
          color: "#666",
        }}
      >
        📍 Pin your location first to find
        nearby washing agencies.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 15,
          borderRadius: 10,
          background: "#f5f7fa",
        }}
      >
        Finding nearby washing agencies...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 15,
          borderRadius: 10,
          background: "#fff1f1",
          color: "#a33",
        }}
      >
        {error}
      </div>
    );
  }

  if (!agencies.length) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 10,
          background: "#fff8e8",
          color: "#765b20",
        }}
      >
        <strong>
          No nearby washing agencies found.
        </strong>

        <p style={{ marginBottom: 0 }}>
          Try increasing your search area or
          check again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3>
        Nearby Washing Agencies
      </h3>

      <p
        style={{
          color: "#666",
        }}
      >
        Agencies are shown from nearest to
        farthest.
      </p>

      <div
        style={{
          display: "grid",
          gap: 15,
        }}
      >
        {agencies.map((agency) => {
          const selected =
            agency.id === value;

          return (
            <button
              key={agency.id}
              type="button"
              onClick={() =>
                handleSelect(agency)
              }
              style={{
                width: "100%",
                textAlign: "left",
                padding: 18,
                borderRadius: 12,
                border: selected
                  ? "2px solid #0B8F4D"
                  : "1px solid #ddd",
                background: selected
                  ? "#eef8f2"
                  : "#fff",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 15,
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: 17,
                    }}
                  >
                    {agency.name}
                  </strong>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#555",
                    }}
                  >
                    📍{" "}
                    {agency.distanceKm} km
                    away
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                    }}
                  >
                    ⭐{" "}
                    {agency.rating.toFixed(
                      1
                    )}
                  </div>

                  {agency.address && (
                    <div
                      style={{
                        marginTop: 7,
                        color: "#666",
                      }}
                    >
                      {agency.address}
                    </div>
                  )}
                </div>

                {selected && (
                  <div
                    style={{
                      color: "#0B8F4D",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Selected
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 15,
                  flexWrap: "wrap",
                }}
              >
                {agency.phone && (
                  <span
                    style={{
                      padding: "7px 10px",
                      borderRadius: 7,
                      background:
                        "#f5f5f5",
                    }}
                  >
                    📞{" "}
                    {agency.phone}
                  </span>
                )}

                {agency.whatsapp && (
                  <span
                    style={{
                      padding: "7px 10px",
                      borderRadius: 7,
                      background:
                        "#e9f8ef",
                      color: "#176b3d",
                    }}
                  >
                    💬 WhatsApp
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}