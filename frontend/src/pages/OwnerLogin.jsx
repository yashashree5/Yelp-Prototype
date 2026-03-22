import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function OwnerLogin({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/owner/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", "owner");
      setAuth({ loggedIn: true, user: { email, role: "owner" } });
      navigate("/owner/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#d32323" }}>yelp✱</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "8px 0 4px" }}>Owner Login</h2>
          <p style={{ color: "#666", fontSize: "13px" }}>Sign in to manage your restaurant</p>
        </div>

        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="********"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", background: loading ? "#ccc" : "#d32323",
            color: "#fff", border: "none", borderRadius: "6px",
            fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Logging in..." : "Login as Owner"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#666" }}>
          Don't have an account? <a href="/owner/signup" style={{ color: "#d32323", textDecoration: "none", fontWeight: 600 }}>Sign Up</a>
        </p>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#666" }}>
          Not an owner? <a href="/login" style={{ color: "#0073bb", textDecoration: "none" }}>User Login</a>
        </p>
      </div>
    </div>
  );
}