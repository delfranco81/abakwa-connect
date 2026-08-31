import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
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

const WORLD_CENTER: Coordinates = [
  20,
  0,
];

const BusinessMarkerIcon = L.icon({
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
});

function MapClickHandler({
  onChange,
}: {
  onChange: (
    coordinates: Coordinates
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onChange([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

function MapPositionController({
  position,
}: {
  position:
    | Coordinates
    | null;
}) {
  const map =
    useMapEvents({});

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(
      position,
      16,
      {
        duration: 0.8,
      }
    );
  }, [
    map,
    position,
  ]);

  return null;
}

function BusinessLocationPicker({
  position,
  onChange,
}: {
  position:
    | Coordinates
    | null;

  onChange: (
    coordinates: Coordinates
  ) => void;
}) {
  return (
    <div className="business-location-map-wrapper">
      <MapContainer
        center={WORLD_CENTER}
        zoom={2}
        minZoom={2}
        maxZoom={19}
        scrollWheelZoom={true}
        className="business-location-map"
      >
        <TileLayer
          attribution={
            '&copy; OpenStreetMap contributors &copy; CARTO'
          }
          url={
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />

        <MapClickHandler
          onChange={onChange}
        />

        <MapPositionController
          position={position}
        />

        {position && (
          <Marker
            position={position}
            icon={BusinessMarkerIcon}
            draggable={true}
            eventHandlers={{
              dragend(event) {
                const marker =
                  event.target;

                const coordinates =
                  marker.getLatLng();

                onChange([
                  coordinates.lat,
                  coordinates.lng,
                ]);
              },
            }}
          />
        )}
      </MapContainer>

      <div className="business-location-map-help">
        Click anywhere on the map to place the
        business marker, or drag the marker to
        adjust its exact position.
      </div>
    </div>
  );
}

export default BusinessLocationPicker;
