import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ReviewCard from "../components/ReviewCard.jsx";

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await api.get(`/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (err) { console.error(err); }
    }
    fetchRestaurant();
  }, [id]);

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h2>{restaurant.name}</h2>
      <p className="text-muted">{restaurant.cuisine} • {restaurant.city}</p>
      <img src={restaurant.photos || "/placeholder.jpg"} className="img-fluid mb-3" alt={restaurant.name} />
      <p>{restaurant.description}</p>
      <p>Rating: {restaurant.average_rating?.toFixed(1) || "N/A"} ★ ({restaurant.review_count || 0} reviews)</p>

      <h4>Reviews</h4>
      {restaurant.reviews?.length ? restaurant.reviews.map(r => <ReviewCard key={r.id} review={r} />) : <p>No reviews yet.</p>}
    </div>
  );
}