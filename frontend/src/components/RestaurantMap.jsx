import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to recenter map when restaurants change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const createCustomIcon = (index, hideNumbering = false) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: #d32323;
      color: white;
      border-radius: 50%;
      border: 2px solid white;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${hideNumbering ? "📍" : index + 1}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function RestaurantMap({ restaurants, hideNumbering = false }) {
  // Default to San Jose
  let center = [37.3382, -121.8863];
  let zoom = 12;

  if (restaurants && restaurants.length > 0) {
    const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
    if (validRestaurants.length > 0) {
        // Average coordinates for center
        const latSum = validRestaurants.reduce((sum, r) => sum + r.latitude, 0);
        const lngSum = validRestaurants.reduce((sum, r) => sum + r.longitude, 0);
        center = [latSum / validRestaurants.length, lngSum / validRestaurants.length];
        
        if (validRestaurants.length === 1) {
            zoom = 14;
        }
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', zIndex: 0 }}>
      {/* zIndex ensures map does not cover sticky headers/navbars */}
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        
        {restaurants && restaurants.map((r, index) => (
          r.latitude && r.longitude ? (
            <Marker key={r.id} position={[r.latitude, r.longitude]} icon={createCustomIcon(index, hideNumbering)}>
              <Popup>
                <div style={{ textAlign: 'left', minWidth: '180px' }}>
                  <img src={r.photos || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"} alt={r.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{index + 1}. {r.name}</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#666' }}>{r.cuisine} • {r.pricing_tier}</p>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#d32323', fontWeight: 'bold' }}>★ {r.average_rating?.toFixed(1) || "New"}</span>
                    <span style={{ color: '#999', fontSize: '12px', marginLeft: '4px' }}>({r.review_count || 0} reviews)</span>
                  </div>
                  <Link to={`/restaurant/${r.id}`} style={{ 
                    display: 'block', 
                    background: '#d32323', 
                    color: '#fff', 
                    textDecoration: 'none', 
                    padding: '8px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
