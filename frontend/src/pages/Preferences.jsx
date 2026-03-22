import { useState, useEffect } from "react";
import { api } from "../api/axios.js";

const CUISINE_OPTIONS = ["Italian", "Chinese", "Mexican", "Indian", "Japanese", "American", "French", "Thai", "Greek", "Korean"];
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Halal", "Gluten-free", "Kosher", "Dairy-free", "Nut-free"];
const AMBIANCE_OPTIONS = ["Casual", "Fine dining", "Family-friendly", "Romantic", "Outdoor", "Sports bar", "Trendy", "Cozy"];
const SORT_OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "distance", label: "Distance" },
  { value: "popularity", label: "Popularity" },
  { value: "price", label: "Price" },
];
const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$"];

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    cuisines: [],
    price_range: "$",
    location: "",
    dietary_needs: [],
    ambiance: [],
    sort_by: "rating"
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/preferences/").then(res => {
      if (res.data) {
        setPrefs({
          cuisines: res.data.cuisines ? res.data.cuisines.split(",") : [],
          price_range: res.data.price_range || "$",
          location: res.data.location || "",
          dietary_needs: res.data.dietary_needs ? res.data.dietary_needs.split(",") : [],
          ambiance: res.data.ambiance ? res.data.ambiance.split(",") : [],
          sort_by: res.data.sort_by || "rating"
        });
      }
    }).catch(() => {});
  }, []);

  function toggleItem(field, item) {
    setPrefs(prev => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await api.put("/preferences/", {
        cuisines: prefs.cuisines.join(","),
        price_range: prefs.price_range,
        location: prefs.location,
        dietary_needs: prefs.dietary_needs.join(","),
        ambiance: prefs.ambiance.join(","),
        sort_by: prefs.sort_by
      });
      setSuccess("Preferences saved successfully!");
    } catch {
      setError("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>My Preferences</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>These preferences help the AI assistant recommend restaurants for you</p>

      {success && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}
      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* Cuisine Preferences */}
        <div style={sectionStyle}>
          <label style={labelStyle}>🍽️ Cuisine Preferences</label>
          <p style={hintStyle}>Select all that apply</p>
          <div style={pillContainerStyle}>
            {CUISINE_OPTIONS.map(c => (
              <button type="button" key={c} onClick={() => toggleItem("cuisines", c)}
                style={pillStyle(prefs.cuisines?.includes(c))}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div style={sectionStyle}>
          <label style={labelStyle}>💰 Price Range Preference</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {PRICE_OPTIONS.map(p => (
              <button type="button" key={p} onClick={() => setPrefs(prev => ({ ...prev, price_range: p }))}
                style={pillStyle(prefs.price_range === p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div style={sectionStyle}>
          <label style={labelStyle}>📍 Preferred Location / Search Radius</label>
          <input
            style={inputStyle}
            value={prefs.location}
            onChange={e => setPrefs(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. San Jose, CA or 95125"
          />
        </div>

        {/* Dietary Needs */}
        <div style={sectionStyle}>
          <label style={labelStyle}>🥗 Dietary Needs / Restrictions</label>
          <p style={hintStyle}>Select all that apply</p>
          <div style={pillContainerStyle}>
            {DIETARY_OPTIONS.map(d => (
              <button type="button" key={d} onClick={() => toggleItem("dietary_needs", d)}
                style={pillStyle(prefs.dietary_needs?.includes(d))}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ambiance */}
        <div style={sectionStyle}>
          <label style={labelStyle}>✨ Ambiance Preferences</label>
          <p style={hintStyle}>Select all that apply</p>
          <div style={pillContainerStyle}>
            {AMBIANCE_OPTIONS.map(a => (
              <button type="button" key={a} onClick={() => toggleItem("ambiance", a)}
                style={pillStyle(prefs.ambiance?.includes(a))}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Preference */}
        <div style={sectionStyle}>
          <label style={labelStyle}>🔃 Sort Preference</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {SORT_OPTIONS.map(s => (
              <button type="button" key={s.value} onClick={() => setPrefs(prev => ({ ...prev, sort_by: s.value }))}
                style={pillStyle(prefs.sort_by === s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} style={{
          background: saving ? "#ccc" : "#d32323", color: "#fff",
          border: "none", padding: "12px 32px", borderRadius: "6px",
          fontSize: "15px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", width: "100%"
        }}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}

const sectionStyle = { marginBottom: "24px", padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" };
const labelStyle = { display: "block", fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" };
const hintStyle = { fontSize: "12px", color: "#999", margin: "0 0 10px" };
const pillContainerStyle = { display: "flex", flexWrap: "wrap", gap: "8px" };
const pillStyle = (active) => ({
  padding: "7px 16px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
  border: active ? "2px solid #d32323" : "1px solid #ccc",
  background: active ? "#d32323" : "#fff",
  color: active ? "#fff" : "#333", fontWeight: active ? 600 : 400,
  transition: "all 0.15s"
});
const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #ddd",
  borderRadius: "6px", fontSize: "14px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box"
};