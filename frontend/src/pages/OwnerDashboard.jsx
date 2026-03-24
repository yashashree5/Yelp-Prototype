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

function getSentiment(reviews) {
  if (!reviews.length) return { positive: 0, neutral: 0, negative: 0, label: "N/A", color: "#999" };
  let positive = 0, neutral = 0, negative = 0;
  reviews.forEach(r => {
    if (r.rating >= 4) positive++;
    else if (r.rating >= 3) neutral++;
    else negative++;
  });
  const total = reviews.length;
  const pPct = Math.round((positive / total) * 100);
  const neuPct = Math.round((neutral / total) * 100);
  const nPct = Math.round((negative / total) * 100);

  let label, color;
  if (pPct >= 60) { label = "Mostly Positive"; color = "#2e7d32"; }
  else if (nPct >= 60) { label = "Mostly Negative"; color = "#c62828"; }
  else if (pPct > nPct) { label = "Leaning Positive"; color = "#558b2f"; }
  else if (nPct > pPct) { label = "Leaning Negative"; color = "#e65100"; }
  else { label = "Mixed"; color = "#f57f17"; }

  return { positive, neutral, negative, pPct, neuPct, nPct, label, color };
}

export default function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [unclaimed, setUnclaimed] = useState([]);
  const [claimingId, setClaimingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [resHistory, resUnclaimed] = await Promise.all([
        api.get("/users/owner/dashboard"),
        api.get("/restaurants/unclaimed")
      ]);
      const myRestaurants = resHistory.data?.restaurants || [];
      setRestaurants(myRestaurants);
      setUnclaimed(resUnclaimed.data || []);
      const nameById = Object.fromEntries(myRestaurants.map(r => [r.id, r.name]));
      const allReviews = (resHistory.data?.reviews || []).map(review => ({
        ...review,
        restaurant_name: nameById[review.restaurant_id] || "Restaurant"
      }));
      setReviews(allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleClaim(restaurantId) {
    if (!window.confirm("Claim this restaurant as your listing?")) return;
    setClaimingId(restaurantId);
    try {
      await api.post(`/restaurants/${restaurantId}/claim`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to claim restaurant.");
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>Loading dashboard...</div>;

  const totalReviews = reviews.length;
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "N/A";
  const totalRestaurants = restaurants.length;
  const sentiment = getSentiment(reviews);

  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { ratingDist[Math.round(r.rating)] = (ratingDist[Math.round(r.rating)] || 0) + 1; });

  const perRestaurantStats = restaurants.map(rest => {
    const restReviews = reviews.filter(rv => rv.restaurant_id === rest.id);
    const avg = restReviews.length ? (restReviews.reduce((s, rv) => s + rv.rating, 0) / restReviews.length).toFixed(1) : "N/A";
    return { ...rest, reviewCount: restReviews.length, avgRating: avg };
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Owner Dashboard</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>Manage your restaurants and view analytics</p>

      {/* Analytics cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Restaurants", value: totalRestaurants, icon: "🏪", color: "#0073bb" },
          { label: "Total Reviews", value: totalReviews, icon: "💬", color: "#d32323" },
          { label: "Average Rating", value: avgRating, icon: "⭐", color: "#f15700" },
          { label: "Public Sentiment", value: sentiment.label, icon: "📊", color: sentiment.color },
        ].map(card => (
          <div key={card.label} style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{card.icon}</div>
            <div style={{ fontSize: card.label === "Public Sentiment" ? "16px" : "28px", fontWeight: 800, color: card.color, marginBottom: "4px" }}>{card.value}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Rating Distribution + Sentiment Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* Rating Distribution */}
        <div style={{ padding: "24px", background: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", marginTop: 0 }}>Ratings Distribution</h2>
          {totalReviews > 0 ? (
            [5, 4, 3, 2, 1].map(star => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#333", minWidth: "30px" }}>{star}★</span>
                <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "14px", overflow: "hidden" }}>
                  <div style={{
                    width: totalReviews ? `${(ratingDist[star] / totalReviews) * 100}%` : "0%",
                    background: star >= 4 ? "#2e7d32" : star === 3 ? "#f9a825" : "#c62828",
                    height: "100%", borderRadius: "4px", transition: "width 0.3s"
                  }} />
                </div>
                <span style={{ fontSize: "13px", color: "#666", minWidth: "30px" }}>{ratingDist[star]}</span>
              </div>
            ))
          ) : (
            <p style={{ color: "#999", fontSize: "13px" }}>No reviews yet to display distribution.</p>
          )}
        </div>

        {/* Sentiment Breakdown */}
        <div style={{ padding: "24px", background: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", marginTop: 0 }}>Sentiment Analysis</h2>
          {totalReviews > 0 ? (
            <>
              <div style={{ display: "flex", height: "24px", borderRadius: "6px", overflow: "hidden", marginBottom: "16px" }}>
                {sentiment.pPct > 0 && <div style={{ width: `${sentiment.pPct}%`, background: "#2e7d32", transition: "width 0.3s" }} />}
                {sentiment.neuPct > 0 && <div style={{ width: `${sentiment.neuPct}%`, background: "#f9a825", transition: "width 0.3s" }} />}
                {sentiment.nPct > 0 && <div style={{ width: `${sentiment.nPct}%`, background: "#c62828", transition: "width 0.3s" }} />}
              </div>
              {[
                { label: "Positive (4-5★)", count: sentiment.positive, pct: sentiment.pPct, color: "#2e7d32" },
                { label: "Neutral (3★)", count: sentiment.neutral, pct: sentiment.neuPct, color: "#f9a825" },
                { label: "Negative (1-2★)", count: sentiment.negative, pct: sentiment.nPct, color: "#c62828" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#333", flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>{s.count} ({s.pct}%)</span>
                </div>
              ))}
              <div style={{ marginTop: "12px", padding: "10px", background: "#f9f9f9", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: sentiment.color }}>Overall: {sentiment.label}</span>
              </div>
            </>
          ) : (
            <p style={{ color: "#999", fontSize: "13px" }}>No reviews yet for sentiment analysis.</p>
          )}
        </div>
      </div>

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
            {perRestaurantStats.map(r => (
              <div key={r.id} style={{ padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#fff", display: "flex", gap: "12px" }}>
                <img src={r.photos || CUISINE_IMAGES[r.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80"}
                  alt={r.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>{r.name}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>{r.cuisine} • {r.city}</div>
                  <div style={{ fontSize: "12px", color: "#f15700", marginBottom: "6px" }}>
                    {r.avgRating !== "N/A" ? `★ ${r.avgRating}` : "No ratings"} • {r.reviewCount} review{r.reviewCount !== 1 ? "s" : ""}
                  </div>
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

      {/* Claim Restaurants */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Claim a Restaurant</h2>
        <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px", marginTop: 0 }}>
          Restaurants added by reviewers that have no owner yet. Claim one to manage its profile.
        </p>
        {unclaimed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", background: "#f9f9f9", borderRadius: "8px", color: "#666", fontSize: "14px" }}>
            No unclaimed restaurants available right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {unclaimed.map(r => (
              <div key={r.id} style={{ padding: "14px", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#fff", display: "flex", gap: "12px", alignItems: "center" }}>
                <img
                  src={r.photos || CUISINE_IMAGES[r.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80"}
                  alt={r.name}
                  style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{r.cuisine} {r.city ? `• ${r.city}` : ""}</div>
                </div>
                <button
                  onClick={() => handleClaim(r.id)}
                  disabled={claimingId === r.id}
                  style={{
                    padding: "6px 14px", background: claimingId === r.id ? "#ccc" : "#0073bb",
                    color: "#fff", border: "none", borderRadius: "6px", cursor: claimingId === r.id ? "not-allowed" : "pointer",
                    fontSize: "12px", fontWeight: 600, flexShrink: 0
                  }}
                >
                  {claimingId === r.id ? "Claiming..." : "Claim"}
                </button>
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
                  <div style={{ color: "#f15700", fontSize: "14px", marginBottom: "4px" }}>
                    {"★".repeat(Math.round(r.rating || 0))}{"☆".repeat(5 - Math.round(r.rating || 0))}
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#333" }}>{r.comment}</p>
                  {r.photos && (
                    <div style={{ marginBottom: "8px" }}>
                      <img src={r.photos} alt="Review photo" style={{ width: "100%", maxWidth: "320px", maxHeight: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
                    </div>
                  )}
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
