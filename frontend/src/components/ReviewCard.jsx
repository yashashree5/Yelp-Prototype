const StarRating = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{
        color: i <= Math.round(rating) ? "#f15700" : "#e8e8e8",
        fontSize: "16px"
      }}>★</span>
    ))}
  </span>
);

export default function ReviewCard({ review }) {
  return (
    <div style={{
      padding: "16px", border: "1px solid #e8e8e8",
      borderRadius: "8px", marginBottom: "10px", background: "#fff"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <StarRating rating={review.rating} />
        <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>{review.rating}/5</span>
      </div>
      <p style={{ margin: "0 0 8px", color: "#333", fontSize: "14px", lineHeight: "1.6" }}>
        {review.comment}
      </p>
      <small style={{ color: "#999", fontSize: "12px" }}>
        {review.created_at
          ? new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : ""}
      </small>
    </div>
  );
}