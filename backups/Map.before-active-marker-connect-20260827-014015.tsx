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

import {
  getBestLocation,
  reverseGeocode,
  getBestLocalArea,
  type LocationResult,
} from "@/lib/locationService";


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

L.Marker.prototype.options.icon = DefaultIcon;


// -----------------------------------------------------
// Types
// -----------------------------------------------------

type Coordinates = [
  number,
  number
];

type MapCenterProps = {
  center: Coordinates;
  zoom?: number;
  selectedMapItemId?: string | null;
};


// -----------------------------------------------------
// Selected marker popup controller
// -----------------------------------------------------

type SelectedMarkerPopupProps = {
  selectedMapItemId: string | null;
  activeMarkerId: string | null;
};

function SelectedMarkerPopup({
  selectedMapItemId,
  activeMarkerId,
}: SelectedMarkerPopupProps) {
  const map = useMap();

  const targetMarkerId =
    activeMarkerId ??
    selectedMapItemId;

  useEffect(() => {
    if (!targetMarkerId) {
      return;
    }

    /*
     * Open the popup belonging to either:
     *
     * 1. a search-selected result, or
     * 2. a directly clicked marker.
     *
     * This does not change location detection,
     * coordinates, or map positioning.
     */
    const timer = window.setTimeout(() => {
      map.eachLayer((layer) => {
        if (
          layer instanceof L.Marker &&
          layer.getPopup()
        ) {
          const popup = layer.getPopup();

          if (
            popup &&
            String(
              layer.options
                .title ?? ""
            ) === targetMarkerId
          ) {
            layer.openPopup();
          }
        }
      });
    }, 1100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    targetMarkerId,
    map,
  ]);

  return null;
}


// -----------------------------------------------------
// Initial world view
// -----------------------------------------------------
//
// IMPORTANT:
// This is intentionally NOT a city or country location.
// Everyday Connect must not assume the user is in Bamenda,
// Cameroon, or any other specific location.
//
// The map starts at a neutral world view until:
// 1. the user searches for something, or
// 2. the user enables their current location.
// -----------------------------------------------------

const INITIAL_MAP_ZOOM = 13;





// -----------------------------------------------------
// Map center controller
// -----------------------------------------------------

function MapCenter({
  center,
  zoom,
  selectedMapItemId,
}: MapCenterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(
      center,
      selectedMapItemId
        ? 16
        : zoom ?? map.getZoom(),
      {
        duration: 1.0,
      }
    );
  }, [
    center,
    zoom,
    selectedMapItemId,
    map,
  ]);

  return null;
}


// -----------------------------------------------------
// Main Map
// -----------------------------------------------------

function Map() {
  const { t } = useLanguage();

  // ---------------------------------------------------
  // Map center
  // ---------------------------------------------------
  //
  // This controls where the map is looking.
  //
  // It is NOT the user's location.
  // ---------------------------------------------------

  const [
    mapCenter,
    setMapCenter,
  ] = useState<Coordinates | null>(
    null
  );


  // ---------------------------------------------------
  // User's actual GPS location
  // ---------------------------------------------------
  //
  // This remains null until the user explicitly requests
  // their current location.
  // ---------------------------------------------------

  const [
    userLocation,
    setUserLocation,
  ] = useState<Coordinates | null>(
    null
  );


  // ---------------------------------------------------
  // Map items
  // ---------------------------------------------------

  const [
    mapItems,
    setMapItems,
  ] = useState<MapItem[]>([]);

  const [
    loadingItems,
    setLoadingItems,
  ] = useState(true);

  // ---------------------------------------------------
  // Map search
  // ---------------------------------------------------

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState<MapItem[]>([]);

  const [
    selectedMapItemId,
    setSelectedMapItemId,
  ] = useState<string | null>(
    null
  );

  const [
    activeMarkerId,
    setActiveMarkerId,
  ] = useState<string | null>(
    null
  );

  // ---------------------------------------------------
  // Map filters
  // ---------------------------------------------------

  const [
    mapFilter,
    setMapFilter,
  ] = useState<"all" | "business" | "place" | "category">(
    "all"
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string | null>(
    null
  );


  const mapCategories =
    Array.from(
      new Set(
        mapItems
          .map(
            (item) =>
              item.category?.trim() ||
              null
          )
          .filter(
            (
              category
            ): category is string =>
              Boolean(category)
          )
      )
    ).sort(
      (a, b) =>
        a.localeCompare(b)
    );


  // ---------------------------------------------------
  // Location state
  // ---------------------------------------------------

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    initialLocationResolved,
    setInitialLocationResolved,
  ] = useState(false);

  const [
    locationEnabled,
    setLocationEnabled,
  ] = useState(false);

  const [
    mapArea,
    setMapArea,
  ] = useState<string | null>(
    null
  );

  // ---------------------------------------------------
  // Map layer
  // ---------------------------------------------------

  const [
    mapLayer,
    setMapLayer,
  ] = useState<"street" | "satellite">(
    "street"
  );


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

    void loadMapItems();

    return () => {
      cancelled = true;
    };
  }, []);



  // ---------------------------------------------------
  // Automatic location on map open
  // ---------------------------------------------------
  //
  // Use the existing location architecture.
  //
  // The map does NOT assume Bamenda, Bambili, Cameroon,
  // or any other location.
  //
  // Browser/device location is preferred.
  // Network location remains informational only.
  // ---------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function detectInitialLocation() {
      try {
        console.log(
          "ECOS MAP: Detecting location automatically..."
        );

        const result:
          LocationResult =
          await getBestLocation();

        if (cancelled) {
          return;
        }

        console.log(
          "ECOS MAP: Initial location result:",
          result
        );

        if (result.coordinates) {
          /*
           * Use the area returned by reverse geocoding.
           *
           * This is completely dynamic:
           * no town, city, country or coordinates
           * are hard-coded here.
           */
          setMapArea(
            result.city
          );

          setMapCenter(
            result.coordinates
          );

          setUserLocation(
            result.coordinates
          );

          setInitialLocationResolved(
            true
          );

          /*
           * Only mark location as enabled when
           * we actually received coordinates from
           * the browser/device.
           */
          if (
            result.source === "device" ||
            result.source === "browser"
          ) {
            setLocationEnabled(
              true
            );
          }

          console.log(
            "ECOS MAP: Centered on detected location:",
            {
              coordinates:
                result.coordinates,

              city:
                result.city,

              region:
                result.region,

              country:
                result.country,

              source:
                result.source,

              accuracy:
                result.accuracy,
            }
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "ECOS MAP: Automatic location detection failed:",
            error
          );

          setInitialLocationResolved(
            true
          );
        }
      }
    }

    void detectInitialLocation();

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
        async (location) => {
          const {
            latitude,
            longitude,
          } = location.coords;

          const coordinates:
            Coordinates = [
              latitude,
              longitude,
            ];

          // Store the user's real location.
          setUserLocation(
            coordinates
          );

          // Move the map to the user.
          setMapCenter(
            coordinates
          );

          /*
           * Reverse-geocode the actual GPS coordinates
           * so the displayed nearest area follows the
           * user's current position.
           *
           * No town, city, country, or coordinate is
           * hard-coded.
           */
          try {
            const reverse =
              await reverseGeocode(
                coordinates
              );

            const localArea =
              getBestLocalArea(
                reverse
              );

            setMapArea(
              localArea
            );

            console.log(
              "ECOS MAP: Manual location nearest area:",
              localArea
            );
          } catch (error) {
            console.warn(
              "ECOS MAP: Manual location reverse geocoding failed:",
              error
            );
          }

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
  // Map search
  // ---------------------------------------------------
  //
  // Search businesses and places already loaded from
  // Supabase. Search is intentionally global and does
  // not assume Bamenda or any particular country.
  // ---------------------------------------------------

  function handleSearchChange(
    value: string
  ) {
    setSearchQuery(value);

    const query =
      value.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      return;
    }

    const results =
      mapItems
        .filter((item) => {
          const searchableText = [
            item.name,
            item.category,
            item.description,
            item.address,
            item.area,
            item.city,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        })
        .slice(0, 8);

    setSearchResults(results);
  }


  /*
   * ---------------------------------------------------------
   * Nearby map ordering
   * ---------------------------------------------------------
   *
   * Keep the original mapItems state untouched.
   *
   * When the user's actual location is known, businesses
   * and places are displayed nearest-first.
   *
   * When location is unavailable, the original database
   * order is preserved.
   *
   * No location is invented and no fixed radius is used.
   */
  const filteredMapItems =
    mapItems.filter(
      (item) => {
        if (
          mapFilter === "business"
        ) {
          return (
            item.type ===
            "business"
          );
        }

        if (
          mapFilter === "place"
        ) {
          return (
            item.type ===
            "place"
          );
        }

        if (
          mapFilter === "category"
        ) {
          return (
            Boolean(
              selectedCategory
            ) &&
            item.category?.trim() ===
              selectedCategory
          );
        }

        return true;
      }
    );


  const displayedMapItems =
    userLocation
      ? [...filteredMapItems].sort(
          (a, b) => {
            const distanceA =
              calculateDistanceKm(
                {
                  latitude:
                    userLocation[0],
                  longitude:
                    userLocation[1],
                },
                {
                  latitude:
                    a.latitude,
                  longitude:
                    a.longitude,
                }
              );

            const distanceB =
              calculateDistanceKm(
                {
                  latitude:
                    userLocation[0],
                  longitude:
                    userLocation[1],
                },
                {
                  latitude:
                    b.latitude,
                  longitude:
                    b.longitude,
                }
              );

            return (
              distanceA -
              distanceB
            );
          }
        )
      : filteredMapItems;


  function selectSearchResult(
    item: MapItem
  ) {
    const coordinates:
      Coordinates = [
        item.latitude,
        item.longitude,
      ];

    /*
     * Remember which map item was selected.
     *
     * This allows the map to focus the selected
     * result without changing the user's location.
     */
    setSelectedMapItemId(
      item.id
    );

    setActiveMarkerId(
      item.id
    );

    setMapCenter(
      coordinates
    );

    setSearchQuery(
      item.name
    );

    setSearchResults([]);
  }


  // ---------------------------------------------------
  // Distance helper
  // ---------------------------------------------------
  //
  // Distance is calculated ONLY when we actually know
  // the user's location.
  // ---------------------------------------------------

  function getItemDistance(
    item: MapItem
  ): string {
    if (!userLocation) {
      return "";
    }

    const distance =
      calculateDistanceKm(
        {
          latitude:
            userLocation[0],

          longitude:
            userLocation[1],
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

  // ---------------------------------------------------
  // Wait for the dynamic initial location
  // ---------------------------------------------------
  //
  // We intentionally do not render Leaflet until the
  // location service has resolved.
  //
  // This prevents:
  //
  // - a world map
  // - a hard-coded town
  // - a fake user position
  // - Leaflet receiving a null center
  //
  // The location service decides where the map starts.
  // ---------------------------------------------------

  if (
    !initialLocationResolved ||
    !mapCenter
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#111827",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {t.findingYourLocation}
          </div>

          <div
            style={{
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            {t.gettingYourLocation}
          </div>
        </div>
      </div>
    );
  }

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
      {/* Map filters */}
      {/* --------------------------------------------- */}

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 12px",
          padding: "0 20px",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >

        <button
          type="button"
          onClick={() => {
            setMapFilter("all");
            setSelectedCategory(null);
          }}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "9px 14px",
            background:
              mapFilter === "all"
                ? "#2563eb"
                : "#374151",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => {
            setMapFilter("business");
            setSelectedCategory(null);
          }}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "9px 14px",
            background:
              mapFilter === "business"
                ? "#2563eb"
                : "#374151",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.business}
        </button>

        <button
          type="button"
          onClick={() => {
            setMapFilter("place");
            setSelectedCategory(null);
          }}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "9px 14px",
            background:
              mapFilter === "place"
                ? "#2563eb"
                : "#374151",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.place}
        </button>

        {mapCategories.map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setMapFilter(
                  "category"
                );
                setSelectedCategory(
                  category
                );
              }}
              style={{
                border: "none",
                borderRadius: 8,
                padding: "9px 14px",
                background:
                  mapFilter === "category" &&
                  selectedCategory ===
                    category
                    ? "#2563eb"
                    : "#374151",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {category}
            </button>
          )
        )}

      </div>


      {/* --------------------------------------------- */}
      {/* Map search */}
      {/* --------------------------------------------- */}

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 15px",
          padding: "0 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "stretch",
          }}
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              handleSearchChange(
                event.target.value
              )
            }
            placeholder={
              t.searchPlaceholder
            }
            aria-label={
              t.searchPlaceholder
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: "13px 15px",
              borderRadius: 10,
              border: "1px solid #4b5563",
              background: "#1f2937",
              color: "#fff",
              outline: "none",
              fontSize: 15,
            }}
          />

          <button
            type="button"
            onClick={() =>
              handleSearchChange(
                searchQuery
              )
            }
            style={{
              border: "none",
              borderRadius: 10,
              padding: "0 20px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.searchButton}
          </button>
        </div>

        {searchQuery.trim() && (
          <div
            style={{
              marginTop: 6,
              background: "#fff",
              color: "#111827",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.25)",
              border:
                "1px solid #d1d5db",
              position: "relative",
              zIndex: 1000,
            }}
          >
            {searchResults.length > 0 ? (
              <>
                <div
                  style={{
                    padding: "10px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
                    textTransform:
                      "uppercase",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  {t.searchResults}
                </div>

                {searchResults.map(
                  (item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() =>
                        selectSearchResult(
                          item
                        )
                      }
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        borderBottom:
                          "1px solid #f3f4f6",
                        background: "#fff",
                        padding:
                          "12px 14px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#111827",
                        }}
                      >
                        {item.name}
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {item.type ===
                        "business"
                          ? t.searchBusinesses
                          : t.searchPlaces}

                        {item.city
                          ? ` • ${item.city}`
                          : ""}

                        {item.address
                          ? ` • ${item.address}`
                          : ""}
                      </div>
                    </button>
                  )
                )}
              </>
            ) : (
              <div
                style={{
                  padding: "14px",
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                {loadingItems
                  ? t.loadingSearch
                  : t.noSearchResults}
              </div>
            )}
          </div>
        )}
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
      {/* Dynamic map area */}
      {/* --------------------------------------------- */}

      {mapArea && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto 10px",
            padding: "0 20px",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {t.mapNearYou}: {mapArea}
        </div>
      )}

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

          {mapCenter ? (
            <>
              {/* --------------------------------------- */}
              {/* Map layer selector */}
              {/* --------------------------------------- */}

              <div
                style={{
                  position: "relative",
                  zIndex: 1000,
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 8,
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setMapLayer("street")
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #374151",
                    cursor: "pointer",
                    fontWeight: 600,
                    background:
                      mapLayer === "street"
                        ? "#111827"
                        : "#ffffff",
                    color:
                      mapLayer === "street"
                        ? "#ffffff"
                        : "#111827",
                  }}
                >
                  {t.mapStreet}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMapLayer("satellite")
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #374151",
                    cursor: "pointer",
                    fontWeight: 600,
                    background:
                      mapLayer === "satellite"
                        ? "#111827"
                        : "#ffffff",
                    color:
                      mapLayer === "satellite"
                        ? "#ffffff"
                        : "#111827",
                  }}
                >
                  {t.mapSatellite}
                </button>
              </div>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "65vh",
                  minHeight: 450,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <MapContainer
              center={
                mapCenter
              }
              zoom={
                INITIAL_MAP_ZOOM
              }
              scrollWheelZoom
              style={{
                width: "100%",
                height: "100%",
              }}
            >

            <TileLayer
              attribution={
                mapLayer === "satellite"
                  ? "&copy; Esri"
                  : "&copy; OpenStreetMap contributors"
              }
              url={
                mapLayer === "satellite"
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              }
            />

            <MapCenter
              center={
                mapCenter
              }
              zoom={
                INITIAL_MAP_ZOOM
              }
              selectedMapItemId={
                selectedMapItemId
              }
            />

            <SelectedMarkerPopup
              selectedMapItemId={
                selectedMapItemId
              }
            />


            {/* --------------------------------------- */}
            {/* User location */}
            {/* --------------------------------------- */}

            {userLocation && (
              <Marker
                position={
                  userLocation
                }
              >
                <Popup>

                  <strong>
                    {t.yourLocation}
                  </strong>

                  <br />

                  {t.youAreHere}

                </Popup>
              </Marker>
            )}


            {/* --------------------------------------- */}
            {/* Businesses and places */}
            {/* --------------------------------------- */}

            {displayedMapItems.map(
              (item) => (
                <Marker
                  key={`${item.type}-${item.id}`}
                  title={item.id}
                  position={[
                    item.latitude,
                    item.longitude,
                  ]}
                  eventHandlers={{
                    click: () => {
                      setActiveMarkerId(
                        item.id
                      );
                    },
                  }}
                >

                  <Popup>

                    <div
                      style={{
                        minWidth: 240,
                        maxWidth: 300,
                      }}
                    >

                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                            marginBottom: 10,
                          }}
                        />
                      )}


                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          textTransform:
                            "uppercase",
                          marginBottom: 5,
                        }}
                      >
                        {item.type === "business"
                          ? t.business
                          : t.place}
                      </div>


                      <strong
                        style={{
                          display: "block",
                          fontSize: 17,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </strong>


                      {item.category && (
                        <div
                          style={{
                            marginTop: 6,
                            color: "#374151",
                            fontWeight: 500,
                          }}
                        >
                          {item.category}
                        </div>
                      )}


                      {item.rating !== null &&
                        item.rating !== undefined &&
                        item.rating > 0 && (
                          <div
                            style={{
                              marginTop: 7,
                              fontWeight: 600,
                            }}
                          >
                            ⭐ {item.rating.toFixed(1)}
                          </div>
                        )}


                      {item.address && (
                        <div
                          style={{
                            marginTop: 7,
                            color: "#4b5563",
                          }}
                        >
                          📍 {item.address}
                        </div>
                      )}


                      {item.city && (
                        <div
                          style={{
                            marginTop: 4,
                            color: "#6b7280",
                          }}
                        >
                          {item.city}
                        </div>
                      )}


                      {item.phone && (
                        <div
                          style={{
                            marginTop: 7,
                          }}
                        >
                          📞{" "}
                          <a
                            href={`tel:${item.phone}`}
                            style={{
                              color: "#2563eb",
                              textDecoration:
                                "none",
                              fontWeight: 600,
                            }}
                          >
                            {item.phone}
                          </a>
                        </div>
                      )}


                      {userLocation && (
                        <div
                          style={{
                            marginTop: 8,
                            fontWeight: 600,
                          }}
                        >
                          📏 {getItemDistance(
                            item
                          )}
                        </div>
                      )}


                      {item.verified && (
                        <div
                          style={{
                            marginTop: 7,
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          ✓ {t.verified}
                        </div>
                      )}


                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 12,
                          flexWrap: "wrap",
                        }}
                      >

                        <a
                          href={item.url}
                          style={{
                            display: "inline-block",
                            padding: "8px 12px",
                            borderRadius: 7,
                            background: "#2563eb",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {t.viewDetails}
                        </a>


                        {item.website && (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display:
                                "inline-block",
                              padding: "8px 12px",
                              borderRadius: 7,
                              border:
                                "1px solid #d1d5db",
                              color: "#111827",
                              textDecoration:
                                "none",
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            Website
                          </a>
                        )}

                      </div>

                    </div>

                  </Popup>

                </Marker>
              )
            )}

                </MapContainer>
              </div>
            </>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: 450,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {locationLoading
                ? t.gettingYourLocation
                : t.findingYourLocation}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Map;









































