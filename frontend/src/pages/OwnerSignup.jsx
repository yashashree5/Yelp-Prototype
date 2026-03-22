import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function OwnerSignup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", restaurant_location: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/owner/signup", form);
      alert("Owner account created! Please login.");
      navigate("/owner/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#d32323" }}>yelp✱</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "8px 0 4px" }}>Owner Sign Up</h2>
          <p style={{ color: "#666", fontSize: "13px" }}>Create your restaurant owner account</p>
        </div>

        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: "Full Name", field: "name", type: "text", placeholder: "Your full name" },
            { label: "Email", field: "email", type: "email", placeholder: "owner@restaurant.com" },
            { label: "Password", field: "password", type: "password", placeholder: "Min 6 characters" },
            { label: "Restaurant Location", field: "restaurant_location", type: "text", placeholder: "123 Main St, San Jose, CA" },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>{label}</label>
              <input
                type={type} required placeholder={placeholder}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", background: loading ? "#ccc" : "#d32323",
            color: "#fff", border: "none", borderRadius: "6px",
            fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Creating account..." : "Sign Up as Owner"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#666" }}>
          Already have an account? <a href="/owner/login" style={{ color: "#d32323", textDecoration: "none", fontWeight: 600 }}>Login</a>
        </p>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#666" }}>
          Not an owner? <a href="/login" style={{ color: "#0073bb", textDecoration: "none" }}>User Login</a>
        </p>
      </div>
    </div>
  );
}