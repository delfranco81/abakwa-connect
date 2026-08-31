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

import {
  getMapItems,
  type MapItem,
} from "@/core/location/MapData";

import {
  calculateDistanceKm,
  formatDistance,
} from "@/core/location/Distance";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

import { Link } from "react-router-dom";

import "./HomeMap.css";


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


type Coordinates = [
  number,
  number
];


const BAMENDA: Coordinates = [
  5.9631,
  10.1591,
];


const HOME_ZOOM = 13;


function MapCenter({
  center,
}: {
  center: Coordinates;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      center,
      HOME_ZOOM
    );
  }, [center, map]);

  return null;
}


function HomeMap() {
  const [
    items,
    setItems,
  ] = useState<MapItem[]>([]);

  const [
    userLocation,
    setUserLocation,
  ] = useState<Coordinates | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    locating,
    setLocating,
  ] = useState(false);


  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);

      const data =
        await getMapItems();

      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);


  function useMyLocation() {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (location) => {
        setUserLocation([
          location.coords.latitude,
          location.coords.longitude,
        ]);

        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }


  const center =
    userLocation ||
    BAMENDA;


  function distanceFromUser(
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


  return (
    <section className="home-map-section">

      <div className="home-map-heading">

        <div>

          <div className="section-eyebrow">
            EXPLORE AROUND YOU
          </div>

          <h2>
            Discover what is{" "}
            <span>nearby</span>
          </h2>

          <p>
            Find businesses, offices,
            schools, services and places
            on the map.
          </p>

        </div>


        <Link
          to="/map"
          className="home-map-view-all"
        >
          Open Full Map →
        </Link>

      </div>


      <div className="home-map-controls">

        <button
          type="button"
          onClick={
            useMyLocation
          }
          disabled={locating}
        >
          {locating
            ? "Finding you..."
            : "📍 Use My Location"}
        </button>

        <span>
          {loading
            ? "Loading mapped locations..."
            : `${items.length} mapped locations`}
        </span>

      </div>


      <div className="home-map-container">

        <MapContainer
          center={center}
          zoom={HOME_ZOOM}
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


          <MapCenter
            center={center}
          />


          {userLocation && (
            <Marker
              position={userLocation}
            >
              <Popup>
                <strong>
                  📍 You are here
                </strong>
              </Popup>
            </Marker>
          )}


          {items.map(
            (item) => (
              <Marker
                key={`${item.type}-${item.id}`}
                position={[
                  item.latitude,
                  item.longitude,
                ]}
              >

                <Popup>

                  <div className="home-map-popup">

                    <span className="home-map-popup-type">
                      {item.type}
                    </span>

                    <strong>
                      {item.name}
                    </strong>

                    {item.category && (
                      <span>
                        {item.category}
                      </span>
                    )}

                    {item.address && (
                      <span>
                        📍 {item.address}
                      </span>
                    )}

                    {userLocation && (
                      <strong>
                        {distanceFromUser(
                          item
                        )}
                      </strong>
                    )}

                    {item.verified && (
                      <span className="home-map-verified">
                        ✓ Verified
                      </span>
                    )}

                    <Link
                      to={item.url}
                      className="home-map-popup-link"
                    >
                      View Details →
                    </Link>

                  </div>

                </Popup>

              </Marker>
            )
          )}

        </MapContainer>

      </div>


      <div className="home-map-footer">

        <span>
          📍 Locations are based on
          registered Everyday Connect
          businesses and places.
        </span>

        <Link to="/map">
          Explore the full map →
        </Link>

      </div>

    </section>
  );
}

export default HomeMap;
