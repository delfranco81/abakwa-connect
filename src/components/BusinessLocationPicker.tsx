import {
  useEffect,
  useState,
} from "react";

import {
  LayersControl,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  searchPlace,
  type PlaceSearchResult,
} from "../lib/locationService";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

export type Coordinates = [
  number,
  number
];

/*
 * ============================================================
 * ONLINE MAP SOURCES
 * ============================================================
 *
 * STREET MAP
 *
 * Official OpenStreetMap raster tile endpoint.
 */
const STREET_MAP_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

/*
 * SATELLITE
 *
 * Esri World Imagery public MapServer.
 *
 * This remains an optional layer.
 */
const SATELLITE_MAP_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/*
 * ============================================================
 * FALLBACK
 * ============================================================
 *
 * IMPORTANT:
 *
 * This is NOT a location.
 *
 * We do not use Bambili, Bambui, Tubah or Bamenda as a
 * fallback location.
 *
 * The parent component supplies the browser/device position.
 */
const WORLD_FALLBACK: Coordinates = [
  0,
  0,
];

/*
 * ============================================================
 * MARKER ICON
 * ============================================================
 */

const BusinessMarkerIcon =
  L.icon({
    iconUrl,

    iconRetinaUrl,

    shadowUrl,

    iconSize: [
      25,
      41,
    ],

    iconAnchor: [
      12,
      41,
    ],

    popupAnchor: [
      1,
      -34,
    ],

    shadowSize: [
      41,
      41,
    ],
  });

/*
 * ============================================================
 * MOVE MAP TO DEVICE/BROWSER LOCATION
 * ============================================================
 */

function MapPositionController({
  position,
  approximate,
}: {
  position:
    | Coordinates
    | null;

  approximate: boolean;
}) {
  const map =
    useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    const zoom =
      approximate
        ? 12
        : 17;

    console.log(
      "ECOS MAP POSITION FROM DEVICE/BROWSER:",
      position
    );

    console.log(
      "ECOS MAP AUTO ZOOM:",
      zoom
    );

    map.flyTo(
      position,
      zoom,
      {
        animate: true,
        duration: 0.8,
      }
    );
  }, [
    map,
    position,
    approximate,
  ]);

  return null;
}

/*
 * ============================================================
 * MAP CLICK HANDLER
 * ============================================================
 *
 * A normal map click selects the exact location.
 */

function MapClickHandler({
  onChange,
}: {
  onChange: (
    coordinates: Coordinates
  ) => void;
}) {
  useMapEvents({
    click(event) {
      const coordinates:
        Coordinates = [
          event.latlng.lat,
          event.latlng.lng,
        ];

      console.log(
        "ECOS MAP CLICK - EXACT LOCATION:",
        coordinates
      );

      onChange(
        coordinates
      );
    },
  });

  return null;
}

/*
 * ============================================================
 * MAP DEBUG
 * ============================================================
 */

function MapInteractionLogger() {
  useMapEvents({
    zoomend(event) {
      const map =
        event.target;

      console.log(
        "ECOS MAP ZOOM:",
        map.getZoom()
      );
    },

    moveend(event) {
      const map =
        event.target;

      const center =
        map.getCenter();

      console.log(
        "ECOS MAP CENTER:",
        [
          center.lat,
          center.lng,
        ]
      );
    },
  });

  return null;
}

/*
 * ============================================================
 * BUSINESS LOCATION PICKER
 * ============================================================
 */

function BusinessLocationPicker({
  position,
  approximate = false,
  onChange,
}: {
  position:
    | Coordinates
    | null;

  approximate?: boolean;

  onChange: (
    coordinates: Coordinates
  ) => void;
}) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<PlaceSearchResult[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  async function handleLocationSearch() {
    const query =
      searchQuery.trim();

    if (!query) {
      setSearchError(
        "Enter a town, area, street or landmark."
      );

      return;
    }

    try {
      setSearching(true);
      setSearchError("");

      const results =
        await searchPlace(query);

      console.log(
        "ECOS SEARCH RESULTS RECEIVED:",
        results
      );

      console.log(
        "ECOS SEARCH RESULT COUNT:",
        results.length
      );

      setSearchResults(results);

      if (results.length === 0) {
        setSearchError(
          "No locations found. Try a more specific place name."
        );
      }
    } catch (error) {
      console.error(
        "ECOS location search failed:",
        error
      );

      setSearchResults([]);

      setSearchError(
        "Location search is temporarily unavailable. You can still select the location directly on the map."
      );
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(
    result: PlaceSearchResult
  ) {
    const latitude =
      Number(result.lat);

    const longitude =
      Number(result.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    const coordinates: Coordinates = [
      latitude,
      longitude,
    ];

    console.log(
      "ECOS SEARCH RESULT SELECTED:",
      result.display_name,
      coordinates
    );

    setSearchQuery(
      result.display_name
    );

    setSearchResults([]);

    onChange(coordinates);
  }

  /*
   * ONLY use the supplied browser/device location.
   *
   * No town is selected automatically.
   */
  const initialCenter =
    position ??
    WORLD_FALLBACK;

  const initialZoom =
    approximate
      ? 12
      : 17;

  console.log(
    "ECOS BUSINESS MAP INITIAL CENTER:",
    initialCenter
  );

  console.log(
    "ECOS BUSINESS MAP INITIAL ZOOM:",
    initialZoom
  );

  return (
    <div
      className="business-location-map-wrapper"
      style={{
        width: "100%",
      }}
    >

      {/* ======================================================
          LOCATION SEARCH
          ====================================================== */}

      <div
        style={{
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleLocationSearch();
              }
            }}
            placeholder="Search town, area, street or landmark"
            aria-label="Search business location"
            style={{
              flex: "1 1 260px",
              minWidth: 0,
              padding: "12px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />

          <button
            type="button"
            onClick={() => {
              void handleLocationSearch();
            }}
            disabled={searching}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: searching
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            {searching
              ? "Searching..."
              : "Search location"}
          </button>
        </div>

        {searchError && (
          <div
            role="alert"
            style={{
              marginTop: "8px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#fff3cd",
              color: "#664d03",
              fontSize: "14px",
            }}
          >
            {searchError}
          </div>
        )}

        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: "8px",
              border: "1px solid #d7dde3",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            {searchResults.map(
              (result, index) => (
                <button
                  key={`${result.lat}-${result.lon}-${index}`}
                  type="button"
                  onClick={() => {
                    selectSearchResult(result);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 14px",
                    border: "none",
                    borderBottom:
                      index <
                      searchResults.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                    background: "#ffffff",
                    color: "#111827",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    lineHeight: 1.4,
                  }}
                >
                  {result.display_name}
                </button>
              )
            )}
          </div>
        )}
      </div>


      <MapContainer
        center={
          initialCenter
        }

        zoom={
          initialZoom
        }

        minZoom={
          2
        }

        maxZoom={
          19
        }

        scrollWheelZoom={
          true
        }

        zoomControl={
          true
        }

        className="business-location-map"

        style={{
          width: "100%",
          height: "480px",
          minHeight: "480px",
          background:
            "#e9eef1",
        }}
      >

        {/* ==================================================
            BASE MAP SWITCHER
            ================================================== */}

        <LayersControl
          position="topright"
        >

          {/* ==================================================
              STREET MAP — DEFAULT
              ================================================== */}

          <LayersControl.BaseLayer
            checked={
              true
            }

            name="Streets"
          >

            <TileLayer
              url={
                STREET_MAP_URL
              }

              minZoom={
                2
              }

              maxZoom={
                19
              }

              attribution={
                "&copy; OpenStreetMap contributors"
              }

              keepBuffer={
                2
              }

              updateWhenZooming={
                false
              }

              updateWhenIdle={
                true
              }
            />

          </LayersControl.BaseLayer>

          {/* ==================================================
              SATELLITE — OPTIONAL
              ================================================== */}

          <LayersControl.BaseLayer
            name="Satellite"
          >

            <TileLayer
              url={
                SATELLITE_MAP_URL
              }

              minZoom={
                2
              }

              maxZoom={
                19
              }

              maxNativeZoom={
                19
              }

              attribution={
                "&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community"
              }

              keepBuffer={
                2
              }

              updateWhenZooming={
                false
              }

              updateWhenIdle={
                true
              }
            />

          </LayersControl.BaseLayer>

        </LayersControl>

        {/* ==================================================
            MAP CLICK
            ================================================== */}

        <MapClickHandler
          onChange={
            onChange
          }
        />

        {/* ==================================================
            DEVICE POSITION
            ================================================== */}

        <MapPositionController
          position={
            position
          }

          approximate={
            approximate
          }
        />

        {/* ==================================================
            DEBUG
            ================================================== */}

        <MapInteractionLogger />

        {/* ==================================================
            BUSINESS MARKER
            ================================================== */}

        {position && (
          <Marker
            position={
              position
            }

            icon={
              BusinessMarkerIcon
            }

            draggable={
              true
            }

            eventHandlers={{
              dragend(event) {
                const marker =
                  event.target as L.Marker;

                const latLng =
                  marker.getLatLng();

                const coordinates:
                  Coordinates = [
                    latLng.lat,
                    latLng.lng,
                  ];

                console.log(
                  "ECOS MARKER DRAGGED - EXACT LOCATION:",
                  coordinates
                );

                onChange(
                  coordinates
                );
              },
            }}
          />
        )}

      </MapContainer>

      {/* ======================================================
          INSTRUCTIONS
          ====================================================== */}

      <div
        style={{
          padding:
            "12px 14px",

          background:
            "#f4f7f8",

          borderRadius:
            "0 0 10px 10px",

          fontSize:
            "13px",

          lineHeight:
            "1.6",

          textAlign:
            "center",
        }}
      >

        <strong>
          Choose the exact business location
        </strong>

        <br />

        Use the map to find the actual road,
        building or compound.

        <br />

        Click the exact location or drag the
        marker onto it.

        <br />

        Use the layer button to switch between
        Streets and Satellite.

      </div>

    </div>
  );
}

export default BusinessLocationPicker;





