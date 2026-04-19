import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/axios";

export default function WriteReview() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're in edit mode
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [rating, setRating] = useState(Number(searchParams.get("rating")) || 5);
  const [comment, setComment] = useState(decodeURIComponent(searchParams.get("comment") || ""));
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

  useEffect(() => {
    api.get(`/restaurants/${restaurantId}`)
      .then(res => setRestaurant(res.data))
      .catch(() => {});
  }, [restaurantId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        rating,
        comment: comment.trim(),
      };
      if (photoDataUrl) payload.photos = photoDataUrl;

      if (isEdit) {
        await api.put(`/reviews/async/update/${editId}`, payload);
      } else {
        await api.post(`/reviews/async/create`, { ...payload, restaurant_id: Number(restaurantId) });
      }
      navigate(`/restaurant/${restaurantId}`);
    } catch (err) {
      setError("Failed to submit review. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const LABELS = { 1: "Terrible", 2: "Bad", 3: "OK", 4: "Good", 5: "Excellent" };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Back */}
      <Link to={`/restaurant/${restaurantId}`} style={{ fontSize: "14px", color: "#0073bb", textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
        ← Back to restaurant
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>
        {isEdit ? "Edit Your Review" : "Write a Review"}
      </h1>
      {restaurant && (
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>
          for <strong>{restaurant.name}</strong>
        </p>
      )}

      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div style={{ marginBottom: "28px", padding: "24px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Your Rating
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  fontSize: "42px",
                  cursor: "pointer",
                  color: star <= (hovered || rating) ? "#f15700" : "#ddd",
                  transition: "color 0.1s, transform 0.1s",
                  transform: star <= (hovered || rating) ? "scale(1.15)" : "scale(1)",
                  display: "inline-block"
                }}
              >
                ★
              </span>
            ))}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f15700" }}>
            {LABELS[hovered || rating]}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "8px" }}>
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience — what did you like or dislike? What would you recommend?"
            required
            style={{
              width: "100%", minHeight: "140px", padding: "12px",
              border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px",
              fontFamily: "inherit", resize: "vertical", outline: "none",
              boxSizing: "border-box", lineHeight: "1.6"
            }}
          />
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            {comment.length} characters
          </div>
        </div>

        {/* Optional Photo */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "8px" }}>
            Optional Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) {
                setPhotoDataUrl(null);
                return;
              }
              // For the assignment/demo, we keep images small to avoid huge payloads.
              if (file.size > 2 * 1024 * 1024) {
                setError("Please choose an image under 2MB.");
                return;
              }
              setError("");
              const reader = new FileReader();
              reader.onloadend = () => setPhotoDataUrl(reader.result);
              reader.readAsDataURL(file);
            }}
            style={{ fontSize: "13px", color: "#666" }}
          />
          <div style={{ fontSize: "12px", color: "#999", marginTop: "6px" }}>
            JPG/PNG up to 2MB
          </div>
          {photoDataUrl && (
            <div style={{ marginTop: "12px" }}>
              <img
                src={photoDataUrl}
                alt="Selected review"
                style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e0e0e0" }}
              />
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  style={{ background: "transparent", border: "1px solid #d32323", color: "#d32323", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                >
                  Remove photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="submit" disabled={loading} style={{
            background: loading ? "#ccc" : "#d32323", color: "#fff",
            border: "none", padding: "12px 32px", borderRadius: "6px",
            fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", flex: 1
          }}>
            {loading ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
          </button>
          <Link to={`/restaurant/${restaurantId}`} style={{
            padding: "12px 24px", borderRadius: "6px", border: "1px solid #ccc",
            textDecoration: "none", color: "#333", fontSize: "15px", fontWeight: 500,
            display: "flex", alignItems: "center"
          }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}