import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// -----------------------------------------------------
// Leaflet default marker fix
// -----------------------------------------------------

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// -----------------------------------------------------
// Types
// -----------------------------------------------------

type Coordinates = [number, number];

type MapCenterProps = {
  center: Coordinates;
};

// -----------------------------------------------------
// Constants
// -----------------------------------------------------

// Bamenda Central fallback position
const FALLBACK_COORDINATES: Coordinates = [5.9631, 10.1591];

const DEFAULT_ZOOM = 14;
const USER_ZOOM = 16;

// -----------------------------------------------------
// Automatically move map when location changes
// -----------------------------------------------------

function MapCenter({ center }: MapCenterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, USER_ZOOM, {
      duration: 1.2,
    });
  }, [center, map]);

  return null;
}

// -----------------------------------------------------
// Main Map component
// -----------------------------------------------------

function Map() {
  const [position, setPosition] = useState<Coordinates>(
    FALLBACK_COORDINATES
  );

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // ---------------------------------------------------
  // Request user's current GPS position
  // ---------------------------------------------------

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const { latitude, longitude } = location.coords;

        setPosition([latitude, longitude]);
        setLocationEnabled(true);
        setLocationLoading(false);

        toast.success("Your location has been found.");
      },
      (error) => {
        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission was denied. You can still use the map normally."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error(
              "Your current location could not be determined."
            );
            break;

          case error.TIMEOUT:
            toast.error(
              "Location request timed out. Please try again."
            );
            break;

          default:
            toast.error(
              "Unable to determine your location."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        paddingBottom: 40,
      }}
    >
      {/* ----------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------- */}

      <div
        style={{
          padding: "25px 20px 15px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Explore Bamenda
        </h1>

        <p
          style={{
            marginTop: 8,
            color: "#9ca3af",
          }}
        >
          Find businesses and places around you.
        </p>
      </div>

      {/* ----------------------------------------------- */}
      {/* Location controls */}
      {/* ----------------------------------------------- */}

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 15px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={locationLoading}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "12px 18px",
            background: locationLoading
              ? "#4b5563"
              : "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: locationLoading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {locationLoading
            ? "📍 Finding you..."
            : "📍 Use My Current Location"}
        </button>

        {locationEnabled && (
          <span
            style={{
              color: "#86efac",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ● Location enabled
          </span>
        )}

        {!locationEnabled && (
          <span
            style={{
              color: "#9ca3af",
              fontSize: 13,
            }}
          >
            GPS permission is optional.
          </span>
        )}
      </div>

      {/* ----------------------------------------------- */}
      {/* Map */}
      {/* ----------------------------------------------- */}

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "65vh",
            minHeight: 450,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #374151",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <MapContainer
            center={position}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenter center={position} />

            <Marker position={position}>
              <Popup>
                {locationEnabled ? (
                  <>
                    <strong>📍 Your Location</strong>
                    <br />
                    You are here.
                  </>
                ) : (
                  <>
                    <strong>📍 Bamenda</strong>
                    <br />
                    Default map location.
                    <br />
                    <br />
                    Click{" "}
                    <strong>
                      "Use My Current Location"
                    </strong>{" "}
                    to find yourself.
                  </>
                )}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Map;