import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
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

import {
  getMapItems,
  type MapItem,
} from "@/core/location/MapData";

import {
  calculateDistanceKm,
  formatDistance,
} from "@/core/location/Distance";


// -----------------------------------------------------
// Leaflet default marker
// -----------------------------------------------------

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon =
  DefaultIcon;


// -----------------------------------------------------
// Types
// -----------------------------------------------------

type Coordinates = [
  number,
  number
];

type MapCenterProps = {
  center: Coordinates;
};


// -----------------------------------------------------
// Constants
// -----------------------------------------------------

const FALLBACK_COORDINATES: Coordinates = [
  5.9631,
  10.1591,
];

const DEFAULT_ZOOM = 14;
const USER_ZOOM = 16;


// -----------------------------------------------------
// Map center
// -----------------------------------------------------

function MapCenter({
  center,
}: MapCenterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(
      center,
      USER_ZOOM,
      {
        duration: 1.2,
      }
    );
  }, [center, map]);

  return null;
}


// -----------------------------------------------------
// Main Map
// -----------------------------------------------------

function Map() {
  const { t } = useLanguage();
const [
    position,
    setPosition,
  ] = useState<Coordinates>(
    FALLBACK_COORDINATES
  );

  const [
    mapItems,
    setMapItems,
  ] = useState<MapItem[]>([]);

  const [
    loadingItems,
    setLoadingItems,
  ] = useState(true);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationEnabled,
    setLocationEnabled,
  ] = useState(false);


  // ---------------------------------------------------
  // Load businesses + places
  // ---------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadMapItems() {
      setLoadingItems(true);

      const items =
        await getMapItems();

      if (!cancelled) {
        setMapItems(items);
        setLoadingItems(false);
      }
    }

    loadMapItems();

    return () => {
      cancelled = true;
    };
  }, []);


  // ---------------------------------------------------
  // Current location
  // ---------------------------------------------------

  const getCurrentLocation =
    () => {
      if (!navigator.geolocation) {
        toast.error(
          t.geolocationNotSupported
        );

        return;
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        (location) => {
          const {
            latitude,
            longitude,
          } = location.coords;

          setPosition([
            latitude,
            longitude,
          ]);

          setLocationEnabled(
            true
          );

          setLocationLoading(
            false
          );

          toast.success(
            t.locationFound
          );
        },

        (error) => {
          setLocationLoading(
            false
          );

          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error(
                t.locationPermissionDenied
              );
              break;

            case error.POSITION_UNAVAILABLE:
              toast.error(
                t.currentLocationUnavailable
              );
              break;

            case error.TIMEOUT:
              toast.error(
                t.locationRequestTimedOut
              );
              break;

            default:
              toast.error(
                t.unableToDetermineLocation
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


  // ---------------------------------------------------
  // Distance helper
  // ---------------------------------------------------

  function getItemDistance(
    item: MapItem
  ): string {
    const distance =
      calculateDistanceKm(
        {
          latitude:
            position[0],

          longitude:
            position[1],
        },

        {
          latitude:
            item.latitude,

          longitude:
            item.longitude,
        }
      );

    return formatDistance(
      distance
    );
  }


  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        paddingBottom: 40,
      }}
    >

      {/* --------------------------------------------- */}
      {/* Header */}
      {/* --------------------------------------------- */}

      <div
        style={{
          padding:
            "25px 20px 15px",
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
          {t.mapExplore}
        </h1>

        <p
          style={{
            marginTop: 8,
            color: "#9ca3af",
          }}
        >
{t.mapDescription}
        </p>

      </div>


      {/* --------------------------------------------- */}
      {/* Location controls */}
      {/* --------------------------------------------- */}

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
          onClick={
            getCurrentLocation
          }
          disabled={
            locationLoading
          }
          style={{
            border: "none",
            borderRadius: 10,
            padding:
              "12px 18px",
            background:
              locationLoading
                ? "#4b5563"
                : "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor:
              locationLoading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {locationLoading
            ? t.findingYou
            : t.useMyCurrentLocation}
        </button>


        {locationEnabled && (
          <span
            style={{
              color: "#86efac",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {t.locationEnabled}
          </span>
        )}


        {!locationEnabled && (
          <span
            style={{
              color: "#9ca3af",
              fontSize: 13,
            }}
          >
            {t.gpsPermissionOptional}
          </span>
        )}

      </div>


      {/* --------------------------------------------- */}
      {/* Map statistics */}
      {/* --------------------------------------------- */}

      <div
        style={{
          maxWidth: 1200,
          margin:
            "0 auto 12px",
          padding: "0 20px",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        {loadingItems
          ? t.mappedLocationsLoading
          : `${mapItems.length} ${t.mappedLocations}`}
      </div>


      {/* --------------------------------------------- */}
      {/* Map */}
      {/* --------------------------------------------- */}

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
            border:
              "1px solid #374151",
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
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />

            <MapCenter
              center={position}
            />


            {/* --------------------------------------- */}
            {/* User location */}
            {/* --------------------------------------- */}

            <Marker
              position={position}
            >
              <Popup>

                {locationEnabled ? (
                  <>
                    <strong>
                      {t.yourLocation}
                    </strong>

                    <br />

                    {t.youAreHere}
                  </>
                ) : (
                  <>
                    <strong>
                      {t.defaultMapLocation}
                    </strong>

                    <br />
                    <br />

                    <strong>
                      {t.useMyCurrentLocation}
                    </strong>{" "}
                    {t.useLocationToFindYourself}
                  </>
                )}

              </Popup>
            </Marker>


            {/* --------------------------------------- */}
            {/* Businesses and places */}
            {/* --------------------------------------- */}

            {mapItems.map(
              (item) => (
                <Marker
                  key={`${item.type}-${item.id}`}
                  position={[
                    item.latitude,
                    item.longitude,
                  ]}
                >

                  <Popup>

                    <div
                      style={{
                        minWidth: 210,
                      }}
                    >

                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          textTransform:
                            "uppercase",
                          marginBottom: 5,
                        }}
                      >
                        {item.type}
                      </div>


                      <strong
                        style={{
                          fontSize: 16,
                        }}
                      >
                        {item.name}
                      </strong>


                      {item.category && (
                        <div
                          style={{
                            marginTop: 5,
                          }}
                        >
                          {item.category}
                        </div>
                      )}


                      {item.address && (
                        <div
                          style={{
                            marginTop: 6,
                            color: "#4b5563",
                          }}
                        >
                          {item.address}
                        </div>
                      )}


                      {locationEnabled && (
                        <div
                          style={{
                            marginTop: 7,
                            fontWeight: 600,
                          }}
                        >
                          {getItemDistance(
                            item
                          )}
                        </div>
                      )}


                      {item.verified && (
                        <div
                          style={{
                            marginTop: 6,
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          {t.verified}
                        </div>
                      )}

                    </div>

                  </Popup>

                </Marker>
              )
            )}

          </MapContainer>

        </div>

      </div>

    </div>
  );
}

export default Map;













