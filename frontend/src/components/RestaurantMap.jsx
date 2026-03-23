import { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, MarkerF, useJsApiLoader } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 37.3382, lng: -121.8863 }; // San Jose
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const MAP_ID = "yelp-prototype-map";

function buildAddress(restaurant) {
  return [restaurant?.address, restaurant?.city].filter(Boolean).join(", ");
}

export default function RestaurantMap({ restaurants, hideNumbering = false }) {
  const [coordsById, setCoordsById] = useState({});
  const [activeId, setActiveId] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: MAP_ID,
    googleMapsApiKey: apiKey || ""
  });

  const normalizedRestaurants = useMemo(() => (restaurants || []).filter(Boolean), [restaurants]);

  useEffect(() => {
    if (!isLoaded || !window.google || normalizedRestaurants.length === 0) return;
    const geocoder = new window.google.maps.Geocoder();
    let cancelled = false;

    async function ensureCoordinates() {
      const next = {};
      const geocodePromises = [];

      normalizedRestaurants.forEach((r) => {
        const lat = Number(r.latitude);
        const lng = Number(r.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
          next[r.id] = { lat, lng };
          return;
        }
        const address = buildAddress(r);
        if (!address) return;
        geocodePromises.push(
          new Promise((resolve) => {
            geocoder.geocode({ address }, (results, status) => {
              if (status === "OK" && results?.[0]?.geometry?.location) {
                const location = results[0].geometry.location;
                resolve({ id: r.id, point: { lat: location.lat(), lng: location.lng() } });
              } else {
                resolve(null);
              }
            });
          })
        );
      });

      const geocoded = await Promise.all(geocodePromises);
      geocoded.forEach((item) => {
        if (item) next[item.id] = item.point;
      });

      if (!cancelled) setCoordsById(next);
    }

    ensureCoordinates();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, normalizedRestaurants]);

  const markers = useMemo(
    () =>
      normalizedRestaurants
        .map((r, index) => ({ restaurant: r, index, point: coordsById[r.id] }))
        .filter((entry) => !!entry.point),
    [normalizedRestaurants, coordsById]
  );

  const mapCenter = useMemo(() => {
    if (markers.length === 0) return DEFAULT_CENTER;
    const lat = markers.reduce((sum, m) => sum + m.point.lat, 0) / markers.length;
    const lng = markers.reduce((sum, m) => sum + m.point.lng, 0) / markers.length;
    return { lat, lng };
  }, [markers]);

  const zoom = markers.length <= 1 ? 14 : 12;

  if (!apiKey) {
    return (
      <div style={{ padding: "12px", color: "#666", fontSize: "13px" }}>
        Add `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env` to enable Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={{ padding: "12px", color: "#666", fontSize: "13px" }}>Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={mapCenter}
      zoom={zoom}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      }}
    >
      {markers.map(({ restaurant, index, point }) => (
        <MarkerF
          key={restaurant.id}
          position={point}
          label={
            hideNumbering
              ? undefined
              : {
                  text: String(index + 1),
                  color: "white",
                  fontWeight: "700"
                }
          }
          onClick={() => setActiveId(restaurant.id)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: hideNumbering ? 10 : 14,
            fillColor: "#d32323",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
          }}
        />
      ))}

      {markers.map(({ restaurant, index, point }) =>
        activeId === restaurant.id ? (
          <InfoWindow key={`info-${restaurant.id}`} position={point} onCloseClick={() => setActiveId(null)}>
            <div style={{ minWidth: "180px", fontFamily: "Arial, sans-serif" }}>
              <img
                src={restaurant.photos || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"}
                alt={restaurant.name}
                style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px" }}
              />
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>
                {hideNumbering ? "" : `${index + 1}. `}
                {restaurant.name}
              </div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>
                {restaurant.cuisine || "Cuisine"} • {restaurant.pricing_tier || "$$"}
              </div>
              <div style={{ fontSize: "12px", marginBottom: "8px" }}>
                <span style={{ color: "#d32323", fontWeight: 700 }}>
                  ★ {restaurant.average_rating?.toFixed(1) || "New"}
                </span>
                <span style={{ color: "#999", marginLeft: "4px" }}>({restaurant.review_count || 0} reviews)</span>
              </div>
              <a
                href={`/restaurant/${restaurant.id}`}
                style={{
                  display: "inline-block",
                  background: "#d32323",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600
                }}
              >
                View Details
              </a>
            </div>
          </InfoWindow>
        ) : null
      )}
    </GoogleMap>
  );
}
