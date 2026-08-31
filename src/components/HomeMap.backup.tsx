import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  getBestLocation,
} from "@/lib/locationService";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

type Coordinates = [number, number];

type MapItem = {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  type: "business" | "place";
  image?: string | null;
};

const DEFAULT_MAP_CENTER: Coordinates = [20, 0];

function MapMover({
  center,
}: {
  center: Coordinates;
}) {
  const map = useMap();

  useEffect(() => {
    console.log(
      "ECOS MAP MOVING TO:",
      center
    );

    map.setView(
      center,
      14,
      {
        animate: true,
        duration: 1,
      }
    );
  }, [center, map]);

  return null;
}

function distanceKm(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371;

  const lat1 =
    (from[0] * Math.PI) / 180;
  const lat2 =
    (to[0] * Math.PI) / 180;

  const dLat =
    ((to[0] - from[0]) * Math.PI) / 180;

  const dLon =
    ((to[1] - from[1]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function HomeMap() {
  const [items, setItems] =
    useState<MapItem[]>([]);

  const [userLocation, setUserLocation] =
    useState<Coordinates | null>(null);


  const [loading, setLoading] =
    useState(true);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function detectInitialLocation() {
      const result = await getBestLocation();

      if (cancelled) {
        return;
      }

      console.log(
        "ECOS FINAL LOCATION RESULT:",
        result
      );

      if (result.coordinates) {
        setUserLocation(result.coordinates);
      }

      if (result.city) {
        console.log(
          "ECOS LOCATION CITY:",
          result.city
        );
      }

      if (result.region) {
        console.log(
          "ECOS LOCATION REGION:",
          result.region
        );
      }

      if (result.country) {
        console.log(
          "ECOS LOCATION COUNTRY:",
          result.country
        );
      }

      if (result.warning) {
        console.warn(
          "ECOS LOCATION WARNING:",
          result.warning
        );
      }

    }

    detectInitialLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function loadMapItems() {
      setLoading(true);
      setError("");

      try {
        const [
          businessResponse,
          placeResponse,
        ] = await Promise.all([
          supabase
            .from("business")
            .select(`
              id,
              name,
              category,
              address,
              latitude,
              longitude,
              logo,
              cover_image
            `),

          supabase
            .from("places")
            .select(`
              id,
              name,
              category,
              address,
              latitude,
              longitude,
              image
            `),
        ]);

        console.log(
          "ECOS MAP - business records:",
          businessResponse.data?.length ?? 0
        );

        console.log("ECOS MAP - BUSINESS LOCATION DATA JSON:", JSON.stringify(businessResponse.data, null, 2));

        console.log(
          "ECOS MAP - place records:",
          placeResponse.data?.length ?? 0
        );

        console.log(
          "ECOS MAP - business query error:",
          businessResponse.error
        );

        console.log(
          "ECOS MAP - place query error:",
          placeResponse.error
        );

        if (businessResponse.error) {
          throw businessResponse.error;
        }

        if (placeResponse.error) {
          throw placeResponse.error;
        }

        const businesses: MapItem[] =
          (businessResponse.data || [])
            .filter((item) => {
              const latitude = Number(item.latitude);
              const longitude = Number(item.longitude);

              return (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180 &&
                latitude !== 0 &&
                longitude !== 0
              );
            })
            .map((item) => ({
              id: item.id,
              name:
                item.name ||
                "Unnamed business",
              category:
                item.category || null,
              address:
                item.address || null,
              city: null,
              latitude:
                Number(item.latitude),
              longitude:
                Number(item.longitude),
              type: "business",
              image:
                item.logo ||
                item.cover_image ||
                null,
            }));

        const places: MapItem[] =
          (placeResponse.data || [])
            .filter((item) => {
              const latitude = Number(item.latitude);
              const longitude = Number(item.longitude);

              return (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180 &&
                latitude !== 0 &&
                longitude !== 0
              );
            })
            .map((item) => ({
              id: item.id,
              name:
                item.name ||
                "Unnamed place",
              category:
                item.category || null,
              address:
                item.address || null,
              city: null,
              latitude:
                Number(item.latitude),
              longitude:
                Number(item.longitude),
              type: "place",
              image:
                item.image || null,
            }));

        setItems([
          ...businesses,
          ...places,
        ]);
      } catch (loadError) {
        console.error(
          "Home map loading error:",
          loadError
        );

        setError(
          "We couldn't load map locations right now."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMapItems();
  }, []);

  const mapCenter =
    userLocation || DEFAULT_MAP_CENTER;

  const sortedItems = useMemo(() => {
    if (!userLocation) {
      return items;
    }

    return [...items].sort(
      (a, b) =>
        distanceKm(
          userLocation,
          [
            a.latitude,
            a.longitude,
          ]
        ) -
        distanceKm(
          userLocation,
          [
            b.latitude,
            b.longitude,
          ]
        )
    );
  }, [items, userLocation]);

  async function findMe() {
    setLocationLoading(true);
    setError("");

    try {
      const result =
        await getBestLocation();

      console.log(
        "ECOS FIND ME RESULT:",
        result
      );

      if (!result.coordinates) {
        setError(
          "We couldn't determine your location. Please choose your location manually on the map."
        );
        return;
      }

      setUserLocation(
        result.coordinates
      );

      if (result.warning) {
        console.warn(
          "ECOS FIND ME WARNING:",
          result.warning
        );
      }
    }
    catch (error) {
      console.error(
        "ECOS Find Me error:",
        error
      );

      setError(
        "We couldn't determine your location. Please try again."
      );
    }
    finally {
      setLocationLoading(false);
    }
  }

  return (
    <section className="home-map-section">
      <div className="home-map-heading">
        <div>
          <div className="section-eyebrow">
            MAP
          </div>

          <h2>
            Businesses & Places{" "}
            <span>Near You</span>
          </h2>

          <p>
            See exactly where businesses,
            offices, schools, services and
            other places are located.
          </p>
        </div>

        <div className="home-map-actions">
          <button
            type="button"
            onClick={findMe}
            disabled={locationLoading}
            className="home-map-location-button"
          >
            {locationLoading
              ? "Finding you..."
              : "📍 Use My Location"}
          </button>

          <Link
            to="/map"
            className="home-map-full-button"
          >
            Open Full Map →
          </Link>
        </div>
      </div>

      {error && (
        <div className="home-map-error">
          {error}
        </div>
      )}

      <div className="home-map-container">
        {loading ? (
          <div className="home-map-loading">
            Loading businesses and places...
          </div>
        ) : (
          <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}`}
            center={mapCenter}
            zoom={14}
            scrollWheelZoom
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />

            <MapMover center={mapCenter} />

            {userLocation && (
              <Marker
                position={userLocation}
              >
                <Popup>
                  <strong>
                    📍 Your Location
                  </strong>
                  <br />
                  You are here.
                </Popup>
              </Marker>
            )}

            {sortedItems.map((item) => {
              const distance =
                userLocation
                  ? distanceKm(
                      userLocation,
                      [
                        item.latitude,
                        item.longitude,
                      ]
                    )
                  : null;

              return (
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
                        minWidth: 190,
                      }}
                    >
                      <strong>
                        {item.name}
                      </strong>

                      <br />

                      <span>
                        {item.type ===
                        "business"
                          ? "Business"
                          : "Place"}
                      </span>

                      {item.category && (
                        <>
                          <br />
                          {item.category}
                        </>
                      )}

                      {item.address && (
                        <>
                          <br />
                          📍 {item.address}
                        </>
                      )}

                      {distance !== null && (
                        <>
                          <br />
                          📏{" "}
                          {distance <
                          1
                            ? `${Math.round(
                                distance *
                                  1000
                              )} m away`
                            : `${distance.toFixed(
                                1
                              )} km away`}
                        </>
                      )}

                      <br />
                      <br />

                      <Link
                        to={
                          item.type ===
                          "business"
                            ? `/business/${item.id}`
                            : `/place/${item.id}`
                        }
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {!loading &&
          items.length === 0 && (
            <div className="home-map-empty">
              No businesses or places with map
              coordinates are available yet.
            </div>
          )}
      </div>

      <div className="home-map-footer">
        <span>
          📍 {items.length} mapped businesses
          and places
        </span>

        {userLocation && (
          <span>
            ✓ Distances calculated from your
            current location
          </span>
        )}
      </div>
    </section>
  );
}

export default HomeMap;


















