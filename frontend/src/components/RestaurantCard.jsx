import { Link } from "react-router-dom";

// Fallback images when restaurant has no photo
const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80",
  French: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  Thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80",
};

const PRICE_MAP = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

function formatPricingTier(tier) {
  if (!tier && tier !== 0) return null;
  if (typeof tier === "string") {
    const trimmed = tier.trim();
    if (trimmed.startsWith("$")) return trimmed;
    const maybeNumber = Number(trimmed);
    if (Number.isFinite(maybeNumber)) return PRICE_MAP[maybeNumber] || null;
  }
  if (typeof tier === "number") return PRICE_MAP[tier] || null;
  return null;
}

const StarRating = ({ rating }) => (
  <span style={{ display: "inline-flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{
        width: "18px", height: "18px", borderRadius: "3px",
        background: i <= Math.round(rating) ? "#f15700" : "#e8e8e8",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "12px", fontWeight: 700
      }}>★</span>
    ))}
  </span>
);

export default function RestaurantCard({ restaurant, index }) {
  const image = restaurant.photos || CUISINE_IMAGES[restaurant.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80";
  const price = restaurant.pricing_tier ? formatPricingTier(restaurant.pricing_tier) : null;

  return (
    <div style={{
      display: "flex", gap: "16px", padding: "24px 0",
      borderBottom: "1px solid #e8e8e8", alignItems: "flex-start"
    }}>
      {/* Index number */}
      <div style={{ fontSize: "16px", fontWeight: 700, color: "#333", minWidth: "20px", paddingTop: "2px" }}>
        {index + 1}
      </div>

      {/* Photo */}
      <Link to={`/restaurant/${restaurant.id}`} style={{
        width: "190px", height: "145px", flexShrink: 0,
        borderRadius: "4px", overflow: "hidden", display: "block"
      }}>
        <img
          src={image}
          alt={restaurant.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.2s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />
      </Link>

      {/* Details */}
      <div style={{ flex: 1 }}>
        {/* Name */}
        <Link to={`/restaurant/${restaurant.id}`} style={{
          fontSize: "20px", fontWeight: 700, color: "#0073bb",
          textDecoration: "none", display: "block", marginBottom: "6px"
        }}
          onMouseEnter={e => e.target.style.textDecoration = "underline"}
          onMouseLeave={e => e.target.style.textDecoration = "none"}
        >
          {restaurant.name}
        </Link>

        {/* Stars + review count */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <StarRating rating={restaurant.average_rating || 0} />
          <span style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>
            {restaurant.average_rating?.toFixed(1) || "0.0"}
          </span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            ({restaurant.review_count || 0} reviews)
          </span>
        </div>

        {/* Location • Price • Hours */}
        <div style={{ fontSize: "14px", color: "#333", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span>📍</span>
          <span>{restaurant.address ? `${restaurant.address}, ` : ""}{restaurant.city}</span>
          {price && <><span style={{ color: "#999" }}>•</span><span style={{ fontWeight: 600 }}>{price}</span></>}
          {restaurant.hours && <><span style={{ color: "#999" }}>•</span><span style={{ color: "#007a3d", fontWeight: 600 }}>{restaurant.hours}</span></>}
        </div>

        {/* Amenities - only if real data exists */}
        {restaurant.amenities && (
          <div style={{ fontSize: "13px", color: "#555", marginBottom: "10px" }}>
            🏠 {restaurant.amenities}
          </div>
        )}

        {/* Description snippet */}
        {restaurant.description && (
          <div style={{ fontSize: "14px", color: "#444", marginBottom: "14px" }}>
            💬 "{restaurant.description.slice(0, 120)}{restaurant.description.length > 120 ? "..." : ""}"
            {" "}
            <Link to={`/restaurant/${restaurant.id}`} style={{ color: "#0073bb", textDecoration: "none", fontWeight: 600 }}>
              more
            </Link>
          </div>
        )}

        {/* Bottom: cuisine tag + Order button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {restaurant.cuisine && (
              <span style={{
                fontSize: "13px", padding: "5px 12px",
                border: "1px solid #ccc", borderRadius: "20px",
                color: "#333", background: "#fff"
              }}>{restaurant.cuisine}</span>
            )}
          </div>
          {/* Order button - styling only, not required by assignment */}
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#d32323", color: "#fff", border: "none",
            padding: "9px 18px", borderRadius: "4px", cursor: "pointer",
            fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap"
          }}>
            ↗ Order
          </button>
        </div>
      </div>
    </div>
  );
}