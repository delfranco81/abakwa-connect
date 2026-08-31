import {
  useEffect,
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
  "https://wi.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

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
