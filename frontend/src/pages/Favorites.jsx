import { useState, useEffect } from "react";
import { api } from "../api/axios.js";
import { Link } from "react-router-dom";

const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80",
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/favorites/")
      .then(res => setFavorites(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeFavorite(restaurantId) {
    try {
      await api.delete(`/favorites/${restaurantId}`);
      setFavorites(prev => prev.filter(f => f.restaurant_id !== restaurantId));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>❤️ My Favorites</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>Restaurants you've saved</p>

      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
          <p style={{ color: "#666", fontSize: "16px", marginBottom: "16px" }}>No favorites yet. Start exploring restaurants!</p>
          <Link to="/" style={{ background: "#d32323", color: "#fff", padding: "10px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }}>
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {favorites.map(fav => {
            const r = fav.restaurant || fav;
            const image = r.photos || CUISINE_IMAGES[r.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80";
            return (
              <div key={fav.id} style={{
                display: "flex", gap: "16px", padding: "16px",
                border: "1px solid #e0e0e0", borderRadius: "8px",
                background: "#fff", alignItems: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}>
                <img src={image} alt={r.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a", marginBottom: "4px" }}>{r.name}</div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>{r.cuisine} • {r.city}</div>
                  <div style={{ fontSize: "13px", color: "#f15700" }}>
                    {"★".repeat(Math.round(r.average_rating || 0))}{"☆".repeat(5 - Math.round(r.average_rating || 0))}
                    <span style={{ color: "#666", marginLeft: "6px" }}>({r.review_count || 0} reviews)</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link to={`/restaurant/${fav.restaurant_id || r.id}`} style={{
                    padding: "8px 16px", background: "#d32323", color: "#fff",
                    borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: 600
                  }}>View</Link>
                  <button onClick={() => removeFavorite(fav.restaurant_id || r.id)} style={{
                    padding: "8px 16px", background: "#fff", color: "#666",
                    border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", cursor: "pointer"
                  }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}