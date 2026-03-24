import { useState, useEffect } from "react";
import { api } from "../api/axios";

export default function OwnerProfile() {
  const [form, setForm] = useState({ name: "", email: "", restaurant_location: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/users/owner/me");
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          restaurant_location: res.data.restaurant_location || ""
        });
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await api.put("/users/owner/me", form);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Owner Profile</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>Manage your account information</p>

      {success && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}
      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

      <form onSubmit={handleSave}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="owner@restaurant.com" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Restaurant Location</label>
          <input style={inputStyle} value={form.restaurant_location} onChange={e => setForm({ ...form, restaurant_location: e.target.value })} placeholder="123 Main St, San Jose, CA" />
        </div>

        <button type="submit" disabled={saving} style={{
          width: "100%", padding: "12px", background: saving ? "#ccc" : "#d32323",
          color: "#fff", border: "none", borderRadius: "6px",
          fontSize: "15px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
          marginTop: "8px"
        }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

const fieldStyle = { marginBottom: "20px" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" };
