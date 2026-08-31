import { useState } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  googleMapsUrl: string;
}

interface Props {
  value: LocationData | null;
  onChange: (
    location: LocationData | null
  ) => void;
}

export default function CustomerLocationPicker({
  value,
  onChange,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function getLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Your browser does not support location services."
      );

      return;
    }

    try {
      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const googleMapsUrl =
            `https://www.google.com/maps?q=${latitude},${longitude}`;

          let address =
            `${latitude.toFixed(
              6
            )}, ${longitude.toFixed(6)}`;

          try {
            const response =
              await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );

            if (response.ok) {
              const data =
                await response.json();

              if (data.display_name) {
                address =
                  data.display_name;
              }
            }
          } catch {
            // Coordinates remain usable
          }

          const location: LocationData = {
            latitude,
            longitude,
            address,
            googleMapsUrl,
          };

          onChange(location);
          setLoading(false);
        },
        (positionError) => {
          setLoading(false);

          if (
            positionError.code ===
            positionError.PERMISSION_DENIED
          ) {
            setError(
              "Location permission was denied. Please allow location access in your browser."
            );
          } else if (
            positionError.code ===
            positionError.POSITION_UNAVAILABLE
          ) {
            setError(
              "Your current location could not be determined."
            );
          } else {
            setError(
              "Unable to determine your location. Please try again."
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      setLoading(false);

      console.error(
        "Location error:",
        err
      );

      setError(
        "Unable to access your location."
      );
    }
  }

  function clearLocation() {
    onChange(null);
    setError("");
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
        Your Pickup / Washing Location
      </label>

      <p
        style={{
          color: "#666",
          fontSize: 14,
        }}
      >
        Allow location access so the
        washing agency can know exactly
        where your vehicle or object is.
      </p>

      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        style={{
          width: "100%",
          padding: 14,
          border: "none",
          borderRadius: 8,
          background: "#198754",
          color: "#fff",
          fontSize: 15,
          cursor: loading
            ? "not-allowed"
            : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading
          ? "Finding your location..."
          : "📍 Use My Current Location"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: "#3a1717",
            color: "#ff8d8d",
          }}
        >
          {error}
        </div>
      )}

      {value && (
        <div
          style={{
            marginTop: 15,
            padding: 15,
            borderRadius: 10,
            border:
              "1px solid #b7e4c7",
            background: "#f0fff4",
          }}
        >
          <strong>
            📍 Location captured
          </strong>

          <p>
            {value.address}
          </p>

          <p
            style={{
              fontSize: 13,
              color: "#666",
            }}
          >
            Latitude:{" "}
            {value.latitude.toFixed(6)}
            <br />
            Longitude:{" "}
            {value.longitude.toFixed(6)}
          </p>

          <a
            href={value.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open location in Google Maps
          </a>

          <br />

          <button
            type="button"
            onClick={clearLocation}
            style={{
              marginTop: 12,
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Change Location
          </button>
        </div>
      )}
    </div>
  );
}