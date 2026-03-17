import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm h-100">
        <img src={restaurant.photos || "/placeholder.jpg"} className="card-img-top" alt={restaurant.name} />
        <div className="card-body">
          <h5 className="card-title">{restaurant.name}</h5>
          <p className="card-text text-muted">{restaurant.cuisine} • {restaurant.city}</p>
          <p className="card-text">Rating: {restaurant.average_rating?.toFixed(1) || "N/A"} ★ ({restaurant.review_count || 0})</p>
          <Link className="btn btn-danger w-100" to={`/restaurant/${restaurant.id}`}>View Details</Link>
        </div>
      </div>
    </div>
  );
}