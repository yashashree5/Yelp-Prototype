import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavourites, removeFavourite, selectFavourites, selectFavouritesLoading } from "../store/slices/favouritesSlice";

const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80",
};

export default function Favorites() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavourites);
  const loading = useSelector(selectFavouritesLoading);

  useEffect(() => {
    dispatch(fetchFavourites());
  }, [dispatch]);

  async function handleRemove(restaurantId) {
    dispatch(removeFavourite(restaurantId));
  }

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>Loading favorites...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>❤️ Your Favorites</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>{favorites.length} saved restaurant{favorites.length !== 1 ? "s" : ""}</p>

      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
          <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>No favorites yet</p>
          <p style={{ fontSize: "14px", marginBottom: "20px" }}>Browse restaurants and click the heart to save them here.</p>
          <Link to="/" style={{ background: "#d32323", color: "#fff", padding: "10px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }}>
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {favorites.map(fav => (
            <div key={fav.restaurant_id} style={{
              display: "flex", alignItems: "center", gap: "16px",
              border: "1px solid #e0e0e0", borderRadius: "10px", padding: "16px",
              background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <img
                src={CUISINE_IMAGES[fav.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80"}
                alt={fav.name}
                style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <Link to={`/restaurant/${fav.restaurant_id}`}
                  style={{ fontSize: "17px", fontWeight: 700, color: "#d32323", textDecoration: "none" }}>
                  {fav.name || `Restaurant #${fav.restaurant_id}`}
                </Link>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                  {fav.cuisine && <span>{fav.cuisine} · </span>}
                  {fav.city && <span>📍 {fav.city}</span>}
                </div>
              </div>
              <button onClick={() => handleRemove(fav.restaurant_id)} style={{
                background: "transparent", border: "1px solid #d32323", color: "#d32323",
                padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px"
              }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
