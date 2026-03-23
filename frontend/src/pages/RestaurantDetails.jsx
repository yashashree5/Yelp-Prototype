import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";

const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
  French: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  Thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
};

const PRICE_MAP = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

const StarRating = ({ rating }) => (
  <span style={{ display: "inline-flex", gap: "2px" }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{
        width: "20px", height: "20px", borderRadius: "3px",
        background: i <= Math.round(rating) ? "#f15700" : "#e8e8e8",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "13px", fontWeight: 700
      }}>★</span>
    ))}
  </span>
);

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resR, resRev] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/reviews/restaurant/${id}`)
        ]);
        setRestaurant(resR.data);
        setReviews(resRev.data || []);

        // Get current user
        try {
          const resUser = await api.get("/users/me");
          setCurrentUserId(resUser.data.id);
        } catch {}

        // Check if favorited
        try {
          const resFav = await api.get("/favorites/");
          const favIds = resFav.data.map(f => f.restaurant_id || f.id);
          setIsFavorite(favIds.includes(parseInt(id)));
        } catch {}

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [id]);

  async function toggleFavorite() {
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteReview(reviewId) {
    if (!window.confirm("Delete this review?")) return;
    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading...</div>
  );

  if (!restaurant) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Restaurant not found.</div>
  );

  const image = restaurant.photos || CUISINE_IMAGES[restaurant.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";
  const price = PRICE_MAP[restaurant.pricing_tier] || "$$";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Back button */}
      <Link to="/" style={{ fontSize: "14px", color: "#0073bb", textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
        ← Back to results
      </Link>

      {/* Hero image */}
      <div style={{ width: "100%", height: "320px", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
        <img src={image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>{restaurant.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <StarRating rating={restaurant.average_rating || 0} />
            <span style={{ fontSize: "15px", color: "#333", fontWeight: 600 }}>{restaurant.average_rating?.toFixed(1) || "0.0"}</span>
            <span style={{ fontSize: "14px", color: "#666" }}>({restaurant.review_count || 0} reviews)</span>
            <span style={{ fontSize: "14px", color: "#666", fontWeight: 600 }}>{price}</span>
          </div>
          <div style={{ fontSize: "14px", color: "#555" }}>
            <span style={{ background: "#f5f5f5", padding: "4px 10px", borderRadius: "20px", border: "1px solid #e0e0e0", marginRight: "8px" }}>{restaurant.cuisine}</span>
          </div>
        </div>

        {/* Favorite button */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleFavorite} style={{
          background: isFavorite ? "#d32323" : "#fff",
          color: isFavorite ? "#fff" : "#d32323",
          border: "2px solid #d32323", borderRadius: "6px",
          padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: 600
        }}>
          {isFavorite ? "❤️ Saved" : "🤍 Save"}
        </button>

          {/* Claim button for owners if restaurant not claimed */}
          {userRole === 'owner' && !restaurant.owner_id && (
            <button onClick={async () => {
              if (!window.confirm('Claim this restaurant as your listing?')) return;
              try {
                await api.post(`/restaurants/${id}/claim`);
                // refresh restaurant
                const res = await api.get(`/restaurants/${id}`);
                setRestaurant(res.data);
                alert('Restaurant claimed successfully.');
              } catch (err) {
                alert(err.response?.data?.detail || 'Failed to claim restaurant.');
              }
            }} style={{ padding: '10px 20px', background: '#0073bb', color: '#fff', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Claim
            </button>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>📍 Address</div>
          <div style={infoValueStyle}>{restaurant.address || "N/A"}, {restaurant.city}</div>
        </div>
        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>🕐 Hours</div>
          <div style={infoValueStyle}>{restaurant.hours || "Contact for hours"}</div>
        </div>
        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>📞 Contact</div>
          <div style={infoValueStyle}>{restaurant.contact || "Not provided"}</div>
        </div>
        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>💰 Price Range</div>
          <div style={infoValueStyle}>{price}</div>
        </div>
      </div>

      {/* Description */}
      {restaurant.description && (
        <div style={{ marginBottom: "24px", padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <div style={infoLabelStyle}>About</div>
          <p style={{ margin: 0, fontSize: "15px", color: "#444", lineHeight: "1.6" }}>{restaurant.description}</p>
        </div>
      )}

      {/* Reviews section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Reviews ({reviews.length})</h2>
        <Link to={`/write-review/${id}`} style={{
          background: "#d32323", color: "#fff", padding: "10px 20px",
          borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 600
        }}>
          ✏️ Write a Review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
          No reviews yet. Be the first to review!
        </div>
      ) : (
        reviews.map(r => (
          <div key={r.id} style={{ padding: "20px", border: "1px solid #e8e8e8", borderRadius: "8px", marginBottom: "12px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <StarRating rating={r.rating} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>{r.rating}/5</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "15px", color: "#333" }}>{r.comment}</p>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                </div>
              </div>

              {/* Edit/Delete for own reviews */}
              {currentUserId && r.user_id === currentUserId && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link to={`/write-review/${id}?edit=${r.id}&rating=${r.rating}&comment=${encodeURIComponent(r.comment)}`}
                    style={{ fontSize: "12px", color: "#0073bb", textDecoration: "none", padding: "4px 10px", border: "1px solid #0073bb", borderRadius: "4px" }}>
                    Edit
                  </Link>
                  <button onClick={() => deleteReview(r.id)} disabled={deletingId === r.id}
                    style={{ fontSize: "12px", color: "#d32323", background: "none", border: "1px solid #d32323", borderRadius: "4px", padding: "4px 10px", cursor: "pointer" }}>
                    {deletingId === r.id ? "..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const infoCardStyle = { padding: "16px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" };
const infoLabelStyle = { fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", marginBottom: "6px" };
const infoValueStyle = { fontSize: "14px", color: "#333", fontWeight: 500 };