import { useState } from "react";

interface LocationValue {
  address: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

interface Props {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

export default function LocationPicker({
  value,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function useCurrentLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        onChange({
          ...value,
          latitude,
          longitude,
          accuracy,
        });

        setLoading(false);
      },
      (locationError) => {
        console.error(
          "Unable to get customer location:",
          locationError
        );

        let message =
          "Unable to get your location.";

        if (locationError.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        } else if (locationError.code === 2) {
          message =
            "Your location could not be determined. Please try again.";
        } else if (locationError.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  function handleAddressChange(
    address: string
  ) {
    onChange({
      ...value,
      address,
    });
  }

  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        Your Location
      </h3>

      <p
        style={{
          color: "#666",
          marginTop: 0,
        }}
      >
        Tell the washing agency where your vehicle
        is located.
      </p>

      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Location description
      </label>

      <textarea
        value={value.address}
        onChange={(event) =>
          handleAddressChange(
            event.target.value
          )
        }
        placeholder="Example: Bambili, near the university gate"
        rows={3}
        style={{
          width: "100%",
          padding: 12,
          boxSizing: "border-box",
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "vertical",
        }}
      />

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 15,
          padding: 14,
          border: "none",
          borderRadius: 8,
          background: "#0B8F4D",
          color: "#fff",
          cursor: loading
            ? "not-allowed"
            : "pointer",
          opacity: loading ? 0.6 : 1,
          fontSize: 15,
        }}
      >
        {loading
          ? "Getting your location..."
          : "📍 Use My Current Location"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 15,
            padding: 12,
            borderRadius: 8,
            background: "#3a1717",
            color: "#ff8d8d",
          }}
        >
          {error}
        </div>
      )}

      {value.latitude !== null &&
        value.longitude !== null && (
          <div
            style={{
              marginTop: 15,
              padding: 14,
              borderRadius: 8,
              background: "#eef8f2",
              color: "#176b3d",
            }}
          >
            <strong>
              ✓ Location captured
            </strong>

            <div style={{ marginTop: 8 }}>
              Latitude:{" "}
              {value.latitude.toFixed(6)}
            </div>

            <div>
              Longitude:{" "}
              {value.longitude.toFixed(6)}
            </div>

            {value.accuracy !== null && (
              <div>
                Accuracy: approximately{" "}
                {Math.round(value.accuracy)}m
              </div>
            )}
          </div>
        )}
    </div>
  );
}