import { useEffect, useState } from "react";
import { api } from "../api/axios";
import RestaurantCard from "../components/RestaurantCard.jsx";

const FILTERS = ["All", "Price", "Open Now", "Reservations", "Offers Delivery", "Offers Takeout"];
const CUISINE_FILTERS = ["All", "Italian", "Chinese", "Indian", "Japanese", "Mexican", "American"];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (q = "", loc = "") => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.search = q;
      if (loc) params.city = loc;
      const res = await api.get("/restaurants/", { params });
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants(search, location);
  };

  const filtered = restaurants.filter(r => {
    const matchesCuisine = activeCuisine === "All" || r.cuisine === activeCuisine;
    return matchesCuisine;
  });

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* Search + Filters bar */}
      <div style={{ background: "#fff", padding: "16px 24px 0", borderBottom: "1px solid #e0e0e0" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", maxWidth: "800px", marginBottom: "14px", border: "1px solid #ccc", borderRadius: "4px", overflow: "hidden" }}>
          {/* What */}
          <div style={{ display: "flex", alignItems: "center", flex: 2, padding: "0 12px", background: "#fff", borderRight: "1px solid #ccc" }}>
            <span style={{ color: "#d32323", marginRight: "8px", fontSize: "16px" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Restaurants, cuisine, or keywords"
              style={{ border: "none", outline: "none", width: "100%", fontSize: "15px", padding: "10px 0" }}
            />
          </div>
          {/* Where */}
          <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "0 12px", background: "#fff" }}>
            <span style={{ color: "#666", marginRight: "8px" }}>📍</span>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or zip code"
              style={{ border: "none", outline: "none", width: "100%", fontSize: "15px", padding: "10px 0" }}
            />
          </div>
          <button type="submit" style={{
            background: "#d32323", color: "#fff", border: "none",
            padding: "0 20px", cursor: "pointer", fontSize: "18px"
          }}>🔍</button>
        </form>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "8px", paddingBottom: "8px", flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
              border: activeFilter === f ? "2px solid #333" : "1px solid #ccc",
              background: activeFilter === f ? "#333" : "#fff",
              color: activeFilter === f ? "#fff" : "#333",
              fontWeight: activeFilter === f ? 600 : 400,
            }}>
              {f}{(f === "Price" || f === "All") ? " ▾" : ""}
            </button>
          ))}
        </div>

        {/* Cuisine filter pills */}
        <div style={{ display: "flex", gap: "8px", paddingBottom: "12px", flexWrap: "wrap" }}>
          {CUISINE_FILTERS.map(c => (
            <button key={c} onClick={() => setActiveCuisine(c)} style={{
              padding: "5px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
              border: activeCuisine === c ? "2px solid #d32323" : "1px solid #e0e0e0",
              background: activeCuisine === c ? "#d32323" : "#f9f9f9",
              color: activeCuisine === c ? "#fff" : "#555",
              fontWeight: activeCuisine === c ? 600 : 400,
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "0 24px", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ padding: "16px 0 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Best Restaurants {location ? `near ${location}` : "near San Jose, CA"}
            </h2>
            <div style={{ fontSize: "13px", color: "#666" }}>
              Sort: <span style={{ fontWeight: 600, color: "#333" }}>Recommended ▾</span>
              <span style={{ marginLeft: "6px", color: "#999", fontSize: "16px" }}>ⓘ</span>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#666", paddingBottom: "4px" }}>{filtered.length} results</div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>No restaurants found.</div>
          ) : (
            filtered.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)
          )}
      </div>
    </div>
  );
}