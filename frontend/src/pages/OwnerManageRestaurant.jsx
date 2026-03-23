import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";

const CUISINE_OPTIONS = ["Italian", "Chinese", "Mexican", "Indian", "Japanese", "American", "French", "Thai", "Korean", "Mediterranean", "Vietnamese", "Other"];
const PRICE_OPTIONS = [{ value: "$", label: "$" }, { value: "$$", label: "$$" }, { value: "$$$", label: "$$$" }, { value: "$$$$", label: "$$$$" }];

export default function OwnerManageRestaurant() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "", cuisine: "", address: "", city: "",
    description: "", hours: "", contact: "", amenities: "", pricing_tier: "$$"
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    async function fetchData() {
      try {
        const [resR, resRev] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/reviews/restaurant/${id}`)
        ]);
        const r = resR.data;
        setForm({
          name: r.name || "",
          cuisine: r.cuisine || "",
          address: r.address || "",
          city: r.city || "",
          description: r.description || "",
          hours: r.hours || "",
          contact: r.contact || "",
          amenities: r.amenities || "",
          pricing_tier: r.pricing_tier || "$$"
        });
        setReviews(resRev.data || []);
      } catch {
        setError("Failed to load restaurant data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await api.put(`/restaurants/${id}`, {
        name: form.name,
        cuisine: form.cuisine,
        address: form.address,
        city: form.city,
        description: form.description,
        hours: form.hours,
        contact: form.contact,
        amenities: form.amenities,
        pricing_tier: form.pricing_tier
      });
      setSuccess("Restaurant profile updated successfully!");
    } catch {
      setError("Failed to update restaurant.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <Link to="/owner/dashboard" style={{ fontSize: "14px", color: "#0073bb", textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Manage Restaurant</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>Update your restaurant profile and view reviews</p>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e0e0e0", marginBottom: "24px" }}>
        {[{ key: "profile", label: "📝 Profile" }, { key: "reviews", label: `💬 Reviews (${reviews.length})` }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: "10px 20px", border: "none", background: "none",
            fontSize: "14px", fontWeight: activeTab === tab.key ? 700 : 400,
            color: activeTab === tab.key ? "#d32323" : "#666",
            borderBottom: activeTab === tab.key ? "2px solid #d32323" : "2px solid transparent",
            cursor: "pointer", marginBottom: "-2px"
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSave}>
          {success && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}
          {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Restaurant Name *</label>
              <input style={inputStyle} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Cuisine Type</label>
              <select style={inputStyle} value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })}>
                {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Hours</label>
              <input style={inputStyle} value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="Mon-Sun 9am-10pm" />
            </div>
            <div>
              <label style={labelStyle}>Contact</label>
              <input style={inputStyle} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="(555) 000-0000" />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Amenities</label>
            <input style={inputStyle} value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="Outdoor seating, Full bar, Vegetarian friendly" />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Price Range</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {PRICE_OPTIONS.map(p => (
                <button type="button" key={p.value} onClick={() => setForm({ ...form, pricing_tier: p.value })} style={{
                  flex: 1, padding: "10px", borderRadius: "6px", cursor: "pointer",
                  border: form.pricing_tier === p.value ? "2px solid #d32323" : "1px solid #ddd",
                  background: form.pricing_tier === p.value ? "#d32323" : "#fff",
                  color: form.pricing_tier === p.value ? "#fff" : "#333",
                  fontWeight: 600, fontSize: "16px"
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            width: "100%", padding: "12px", background: saving ? "#ccc" : "#d32323",
            color: "#fff", border: "none", borderRadius: "6px",
            fontSize: "15px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer"
          }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Reviews Tab - Read Only */}
      {activeTab === "reviews" && (
        <div>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "16px", padding: "8px 12px", background: "#f9f9f9", borderRadius: "6px" }}>
            👁️ Read-only — reviews can only be edited or deleted by the users who wrote them.
          </div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>No reviews yet.</div>
          ) : (
            reviews.map(r => (
              <div key={r.id} style={{ padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", marginBottom: "10px", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: "#f15700", fontSize: "16px" }}>{"★".repeat(Math.round(r.rating))}{"☆".repeat(5 - Math.round(r.rating))}</span>
                  <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>{r.rating}/5</span>
                </div>
                <p style={{ margin: "0 0 8px", color: "#333", fontSize: "14px" }}>{r.comment}</p>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };