import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";

export default function WriteReview() {
  const { id: restaurantId } = useParams(); // get restaurantId from URL
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/reviews", { restaurant_id: restaurantId, rating, comment });
      alert("Review submitted!");
      setRating(5);
      setComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    }
  }

  return (
    <div>
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          className="form-control mb-2"
          min={1}
          max={5}
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <button className="btn btn-success">Submit Review</button>
      </form>
    </div>
  );
}