import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setAuth }) {
  const [activeTab, setActiveTab] = useState("user"); // "user" or "owner"

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [ownerLoading, setOwnerLoading] = useState(false);

  const navigate = useNavigate();

  async function handleUserSubmit(e) {
    e.preventDefault();
    if (!userEmail || !userPassword) {
      setUserError("All fields are required.");
      return;
    }
    try {
      setUserLoading(true);
      setUserError("");
      const res = await api.post("/auth/user/login", { email: userEmail, password: userPassword });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", "user");
      try {
        const profile = await api.get("/users/me");
        setAuth({ loggedIn: true, user: { email: userEmail, role: "user", name: profile.data.name, profile_pic: profile.data.profile_pic } });
      } catch {
        setAuth({ loggedIn: true, user: { email: userEmail, role: "user" } });
      }
      navigate("/");
    } catch {
      setUserError("Invalid email or password.");
    } finally {
      setUserLoading(false);
    }
  }

  async function handleOwnerSubmit(e) {
    e.preventDefault();
    if (!ownerEmail || !ownerPassword) {
      setOwnerError("All fields are required.");
      return;
    }
    try {
      setOwnerLoading(true);
      setOwnerError("");
      const res = await api.post("/auth/owner/login", { email: ownerEmail, password: ownerPassword });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", "owner");
      setAuth({ loggedIn: true, user: { email: ownerEmail, role: "owner" } });
      navigate("/owner/dashboard");
    } catch (err) {
      setOwnerError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setOwnerLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue', Arial, sans-serif", padding: "40px 20px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "100%", maxWidth: "440px", overflow: "hidden" }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "#fcfcfc" }}>
          <button
            onClick={() => setActiveTab("user")}
            style={{
              flex: 1, padding: "16px 0", border: "none", background: "none", cursor: "pointer",
              fontWeight: 700, fontSize: "15px",
              color: activeTab === "user" ? "#d32323" : "#666",
              borderBottom: activeTab === "user" ? "3px solid #d32323" : "3px solid transparent",
              transition: "all 0.2s"
            }}
          >
            User Login
          </button>
          <button
            onClick={() => setActiveTab("owner")}
            style={{
              flex: 1, padding: "16px 0", border: "none", background: "none", cursor: "pointer",
              fontWeight: 700, fontSize: "15px",
              color: activeTab === "owner" ? "#0073bb" : "#666",
              borderBottom: activeTab === "owner" ? "3px solid #0073bb" : "3px solid transparent",
              transition: "all 0.2s"
            }}
          >
            Business Owner
          </button>
        </div>

        {/* User Tab Content */}
        {activeTab === "user" && (
          <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Sign in to write reviews & save favorites</p>
            </div>

            {userError && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{userError}</div>}

            <form onSubmit={handleUserSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Email</label>
                <input type="email" required value={userEmail} onChange={e => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Password</label>
                <input type="password" required value={userPassword} onChange={e => setUserPassword(e.target.value)}
                  placeholder="********"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={userLoading} style={{
                width: "100%", padding: "12px", background: userLoading ? "#ccc" : "#d32323",
                color: "#fff", border: "none", borderRadius: "6px", transition: "background 0.2s",
                fontSize: "15px", fontWeight: 700, cursor: userLoading ? "not-allowed" : "pointer"
              }}>
                {userLoading ? "Logging in..." : "Login as User"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
              New to Yelp? <Link to="/signup" style={{ color: "#d32323", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
            </p>
          </div>
        )}

        {/* Owner Tab Content */}
        {activeTab === "owner" && (
          <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Manage your restaurant page</p>
            </div>

            {ownerError && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{ownerError}</div>}

            <form onSubmit={handleOwnerSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Business Email</label>
                <input type="email" required value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                  placeholder="owner@restaurant.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#fff" }} />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Password</label>
                <input type="password" required value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)}
                  placeholder="********"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#fff" }} />
              </div>

              <button type="submit" disabled={ownerLoading} style={{
                width: "100%", padding: "12px", background: ownerLoading ? "#ccc" : "#0073bb",
                color: "#fff", border: "none", borderRadius: "6px", transition: "background 0.2s",
                fontSize: "15px", fontWeight: 700, cursor: ownerLoading ? "not-allowed" : "pointer"
              }}>
                {ownerLoading ? "Logging in..." : "Login to Business Dashboard"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
              Don't have an account? <Link to="/owner/signup" style={{ color: "#0073bb", textDecoration: "none", fontWeight: 600 }}>Claim your page</Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}