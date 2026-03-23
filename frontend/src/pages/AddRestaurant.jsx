import { useState } from "react";
import { api } from "../api/axios.js";
import { useNavigate } from "react-router-dom";

const CUISINE_OPTIONS = ["Italian", "Chinese", "Mexican", "Indian", "Japanese",
  "American", "French", "Thai", "Greek", "Korean", "Mediterranean", "Other"];

export default function AddRestaurant() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", cuisine: "", address: "", city: "",
    description: "", contact: "", hours: "", pricing_tier: 2,
    ambiance: []
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
      try {
        const amenities = (form.ambiance || []).join(",");
        await api.post(
          `/restaurants/?name=${encodeURIComponent(form.name)}&cuisine=${encodeURIComponent(form.cuisine)}&address=${encodeURIComponent(form.address)}&city=${encodeURIComponent(form.city)}&description=${encodeURIComponent(form.description)}&amenities=${encodeURIComponent(amenities)}`
        );
      setSuccess("Restaurant added successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError("Failed to add restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PRICE_OPTIONS = [
    { value: 1, label: "$ — Inexpensive" },
    { value: 2, label: "$$ — Moderate" },
    { value: 3, label: "$$$ — Expensive" },
    { value: 4, label: "$$$$ — Very Expensive" },
  ];

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Add a Restaurant</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>Share a great restaurant with the community</p>

      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
      {success && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Restaurant Name *</label>
          <input style={inputStyle} required value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Bella Italia" />
        </div>

        {/* Cuisine */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Cuisine Type *</label>
          <select style={inputStyle} required value={form.cuisine}
            onChange={e => setForm({ ...form, cuisine: e.target.value })}>
            <option value="">Select cuisine type</option>
            {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Address + City */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Address *</label>
            <input style={inputStyle} required value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main Street" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>City *</label>
            <input style={inputStyle} required value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder="San Jose" />
          </div>
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Tell people what makes this restaurant special..." />
        </div>

        {/* Contact + Hours */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Contact Info</label>
            <input style={inputStyle} value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })}
              placeholder="(555) 000-0000" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Hours</label>
            <input style={inputStyle} value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
              placeholder="Mon-Sun 9am-10pm" />
          </div>
        </div>

        {/* Price Tier */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Price Range</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {PRICE_OPTIONS.map(p => (
              <button type="button" key={p.value}
                onClick={() => setForm({ ...form, pricing_tier: p.value })}
                style={{
                  flex: 1, padding: "10px", borderRadius: "6px", cursor: "pointer",
                  border: form.pricing_tier === p.value ? "2px solid #d32323" : "1px solid #ddd",
                  background: form.pricing_tier === p.value ? "#d32323" : "#fff",
                  color: form.pricing_tier === p.value ? "#fff" : "#333",
                  fontWeight: 600, fontSize: "14px"
                }}>
                {p.label.split(" — ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Ambiance / Amenities */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Ambiance</label>
          <p style={{ fontSize: "12px", color: "#999", margin: "0 0 10px" }}>Select any that apply</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              "Casual", "Fine dining", "Family-friendly", "Romantic", "Outdoor", "Sports bar", "Trendy", "Cozy"
            ].map(a => (
              <button type="button" key={a} onClick={() => {
                setForm(prev => {
                  const arr = prev.ambiance || [];
                  return { ...prev, ambiance: arr.includes(a) ? arr.filter(i => i !== a) : [...arr, a] };
                });
              }}
              style={{
                padding: "8px 12px", borderRadius: "6px", border: (form.ambiance || []).includes(a) ? "2px solid #d32323" : "1px solid #ddd",
                background: (form.ambiance || []).includes(a) ? "#d32323" : "#fff", color: (form.ambiance || []).includes(a) ? "#fff" : "#333", cursor: "pointer", fontWeight: 600
              }}>{a}</button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "14px", background: loading ? "#ccc" : "#d32323",
          color: "#fff", border: "none", borderRadius: "6px",
          fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          marginTop: "8px"
        }}>
          {loading ? "Adding..." : "Add Restaurant"}
        </button>
      </form>
    </div>
  );
}

const fieldStyle = { marginBottom: "20px" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "6px" };
const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #ddd",
  borderRadius: "6px", fontSize: "14px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box", background: "#fff"
};