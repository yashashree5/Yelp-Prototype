import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [activeTab, setActiveTab] = useState("user");

  // User State
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  // Owner State
  const [ownerForm, setOwnerForm] = useState({ name: "", email: "", password: "", restaurant_location: "" });
  const [ownerError, setOwnerError] = useState("");
  const [ownerSuccess, setOwnerSuccess] = useState("");
  const [ownerLoading, setOwnerLoading] = useState(false);

  const navigate = useNavigate();

  async function handleUserSubmit(e) {
    e.preventDefault();
    if (!userName || !userEmail || !userPassword) {
      setUserError("All fields are required.");
      return;
    }
    try {
      setUserLoading(true);
      setUserError("");
      setUserSuccess("");
      await api.post("/auth/user/signup", { name: userName, email: userEmail, password: userPassword });
      setUserSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setUserError("Signup failed. Email might already be registered.");
    } finally {
      setUserLoading(false);
    }
  }

  async function handleOwnerSubmit(e) {
    e.preventDefault();
    if (!ownerForm.name || !ownerForm.email || !ownerForm.password || !ownerForm.restaurant_location) {
      setOwnerError("All fields are required.");
      return;
    }
    try {
      setOwnerLoading(true);
      setOwnerError("");
      setOwnerSuccess("");
      await api.post("/auth/owner/signup", ownerForm);
      setOwnerSuccess("Owner account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setOwnerError(err.response?.data?.detail || "Signup failed.");
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
            User Sign Up
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
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Create a new user account</p>
            </div>

            {userError && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{userError}</div>}
            {userSuccess && <div style={{ background: "#d4edda", color: "#155724", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{userSuccess}</div>}

            <form onSubmit={handleUserSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>Full Name</label>
                <input type="text" required value={userName} onChange={e => setUserName(e.target.value)}
                  placeholder="Your full name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
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
                {userLoading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
              Already have an account? <Link to="/login" style={{ color: "#d32323", textDecoration: "none", fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        )}

        {/* Owner Tab Content */}
        {activeTab === "owner" && (
          <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Create your restaurant owner account</p>
            </div>

            {ownerError && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{ownerError}</div>}
            {ownerSuccess && <div style={{ background: "#d4edda", color: "#155724", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{ownerSuccess}</div>}

            <form onSubmit={handleOwnerSubmit}>
              {[
                { label: "Full Name", field: "name", type: "text", placeholder: "Your full name" },
                { label: "Email", field: "email", type: "email", placeholder: "owner@restaurant.com" },
                { label: "Password", field: "password", type: "password", placeholder: "Min 6 characters" },
                { label: "Restaurant Location", field: "restaurant_location", type: "text", placeholder: "123 Main St, San Jose, CA" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field} style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#333" }}>{label}</label>
                  <input
                    type={type} required placeholder={placeholder}
                    value={ownerForm[field]}
                    onChange={e => setOwnerForm({ ...ownerForm, [field]: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <button type="submit" disabled={ownerLoading} style={{
                width: "100%", padding: "12px", background: ownerLoading ? "#ccc" : "#0073bb",
                color: "#fff", border: "none", borderRadius: "6px", transition: "background 0.2s",
                fontSize: "15px", fontWeight: 700, cursor: ownerLoading ? "not-allowed" : "pointer",
                marginTop: "8px"
              }}>
                {ownerLoading ? "Creating account..." : "Sign Up as Owner"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
              Already have an account? <Link to="/login" style={{ color: "#0073bb", textDecoration: "none", fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}