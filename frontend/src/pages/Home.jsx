import { useEffect, useState } from "react";
import { api } from "../api/axios";
import RestaurantCard from "../components/RestaurantCard.jsx";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        setRestaurants(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Search for restaurants, cuisine, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="row">
        {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
      </div>
    </div>
  );
}