import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, loginOwner, selectAuthLoading, selectAuthError, clearAuthError } from "../store/slices/authSlice";

export default function Login() {
  const [activeTab, setActiveTab] = useState("user");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  async function handleUserSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ email: userEmail, password: userPassword }));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  }

  async function handleOwnerSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginOwner({ email: ownerEmail, password: ownerPassword }));
    if (loginOwner.fulfilled.match(result)) {
      navigate("/owner/dashboard");
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue', Arial, sans-serif", padding: "40px 20px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "100%", maxWidth: "440px", overflow: "hidden" }}>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "#fcfcfc" }}>
          <button onClick={() => setActiveTab("user")} style={{
            flex: 1, padding: "16px 0", border: "none", background: "none", cursor: "pointer",
            fontWeight: 700, fontSize: "15px",
            color: activeTab === "user" ? "#d32323" : "#666",
            borderBottom: activeTab === "user" ? "3px solid #d32323" : "3px solid transparent",
          }}>User Login</button>
          <button onClick={() => setActiveTab("owner")} style={{
            flex: 1, padding: "16px 0", border: "none", background: "none", cursor: "pointer",
            fontWeight: 700, fontSize: "15px",
            color: activeTab === "owner" ? "#0073bb" : "#666",
            borderBottom: activeTab === "owner" ? "3px solid #0073bb" : "3px solid transparent",
          }}>Business Owner</button>
        </div>

        {/* User Tab */}
        {activeTab === "user" && (
          <div style={{ padding: "32px 40px" }}>
            <p style={{ color: "#666", fontSize: "14px", textAlign: "center", marginBottom: "24px" }}>Sign in to write reviews & save favorites</p>
            {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
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
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "12px", background: loading ? "#ccc" : "#d32323",
                color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
              }}>{loading ? "Logging in..." : "Login as User"}</button>
            </form>
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
              New to Yelp? <Link to="/signup" style={{ color: "#d32323", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
            </p>
          </div>
        )}

        {/* Owner Tab */}
        {activeTab === "owner" && (
          <div style={{ padding: "32px 40px" }}>
            <p style={{ color: "#666", fontSize: "14px", textAlign: "center", marginBottom: "24px" }}>Manage your restaurant page</p>
            {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
            <form onSubmit={handleOwnerSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Business Email</label>
                <input type="email" required value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                  placeholder="owner@restaurant.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Password</label>
                <input type="password" required value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)}
                  placeholder="********"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "12px", background: loading ? "#ccc" : "#0073bb",
                color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
              }}>{loading ? "Logging in..." : "Login to Business Dashboard"}</button>
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
