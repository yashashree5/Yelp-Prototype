import { useState, useEffect } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80",
};

export default function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const resHistory = await api.get("/users/history");
        const myRestaurants = resHistory.data?.restaurants_added || [];
        setRestaurants(myRestaurants);

        // Fetch reviews for all owned restaurants
        const allReviews = [];
        for (const r of myRestaurants) {
          const res = await api.get(`/reviews/restaurant/${r.id}`);
          res.data.forEach(review => allReviews.push({ ...review, restaurant_name: r.name, restaurant_id: r.id }));
        }
        setReviews(allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>Loading dashboard...</div>;

  const totalReviews = reviews.length;
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "N/A";
  const totalRestaurants = restaurants.length;

  // Rating distribution
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { ratingDist[Math.round(r.rating)] = (ratingDist[Math.round(r.rating)] || 0) + 1; });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Owner Dashboard</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>Manage your restaurants and view analytics</p>

      {/* Analytics cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Restaurants", value: totalRestaurants, icon: "🏪", color: "#0073bb" },
          { label: "Total Reviews", value: totalReviews, icon: "💬", color: "#d32323" },
          { label: "Average Rating", value: avgRating, icon: "⭐", color: "#f15700" },
        ].map(card => (
          <div key={card.label} style={{ padding: "24px", background: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{card.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: card.color, marginBottom: "4px" }}>{card.value}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Rating Distribution */}
      {totalReviews > 0 && (
        <div style={{ padding: "24px", background: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Rating Distribution</h2>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#333", minWidth: "30px" }}>{star}★</span>
              <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "12px", overflow: "hidden" }}>
                <div style={{
                  width: totalReviews ? `${(ratingDist[star] / totalReviews) * 100}%` : "0%",
                  background: "#f15700", height: "100%", borderRadius: "4px", transition: "width 0.3s"
                }} />
              </div>
              <span style={{ fontSize: "13px", color: "#666", minWidth: "30px" }}>{ratingDist[star]}</span>
            </div>
          ))}
        </div>
      )}

      {/* My Restaurants */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>My Restaurants</h2>
          <Link to="/add-restaurant" style={{ background: "#d32323", color: "#fff", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            + Add Restaurant
          </Link>
        </div>
        {restaurants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
            No restaurants yet. <Link to="/add-restaurant" style={{ color: "#d32323" }}>Add one!</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {restaurants.map(r => (
              <div key={r.id} style={{ padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#fff", display: "flex", gap: "12px" }}>
                <img src={r.photos || CUISINE_IMAGES[r.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80"}
                  alt={r.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{r.name}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>{r.cuisine} • {r.city}</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link to={`/restaurant/${r.id}`} style={{ fontSize: "12px", color: "#0073bb", textDecoration: "none" }}>View</Link>
                    <span style={{ color: "#ccc" }}>|</span>
                    <Link to={`/owner/restaurant/${r.id}`} style={{ fontSize: "12px", color: "#d32323", textDecoration: "none" }}>Manage</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Recent Reviews</h2>
        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
            No reviews yet.
          </div>
        ) : (
          reviews.slice(0, 10).map(r => (
            <div key={r.id} style={{ padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", marginBottom: "10px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#0073bb", fontWeight: 600, marginBottom: "4px" }}>{r.restaurant_name}</div>
                  <div style={{ color: "#f15700", fontSize: "14px", marginBottom: "4px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#333" }}>{r.comment}</p>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                  </div>
                </div>
                <Link to={`/restaurant/${r.restaurant_id}`} style={{ fontSize: "12px", color: "#0073bb", textDecoration: "none", flexShrink: 0 }}>View →</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}