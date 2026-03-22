import { useState, useEffect } from "react";
import { api } from "../api/axios.js";
import { Link } from "react-router-dom";

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    api.get("/users/history")
      .then(res => {
        setReviews(res.data?.reviews || []);
        setRestaurants(res.data?.restaurants_added || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>📋 My History</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>Your reviews and restaurants added</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "2px solid #e0e0e0" }}>
        {[{ key: "reviews", label: `Reviews (${reviews.length})` }, { key: "restaurants", label: `Restaurants Added (${restaurants.length})` }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: "10px 20px", border: "none", background: "none",
            fontSize: "14px", fontWeight: activeTab === tab.key ? 700 : 400,
            color: activeTab === tab.key ? "#d32323" : "#666",
            borderBottom: activeTab === tab.key ? "2px solid #d32323" : "2px solid transparent",
            cursor: "pointer", marginBottom: "-2px"
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
            No reviews yet. <Link to="/" style={{ color: "#d32323" }}>Find a restaurant to review!</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: "20px", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ color: "#f15700", fontSize: "16px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span style={{ fontWeight: 600, color: "#333" }}>{r.rating}/5</span>
                    </div>
                    <p style={{ margin: "0 0 8px", color: "#333", fontSize: "14px" }}>{r.comment}</p>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                    </div>
                  </div>
                  <Link to={`/restaurant/${r.restaurant_id}`} style={{
                    padding: "6px 14px", background: "#d32323", color: "#fff",
                    borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: 600, flexShrink: 0
                  }}>View</Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Restaurants Tab */}
      {activeTab === "restaurants" && (
        restaurants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
            No restaurants added yet. <Link to="/add-restaurant" style={{ color: "#d32323" }}>Add one!</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {restaurants.map(r => (
              <div key={r.id} style={{ padding: "20px", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a", marginBottom: "4px" }}>{r.name}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{r.cuisine} • {r.city}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                    Added: {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                  </div>
                </div>
                <Link to={`/restaurant/${r.id}`} style={{
                  padding: "8px 16px", background: "#d32323", color: "#fff",
                  borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: 600
                }}>View</Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}