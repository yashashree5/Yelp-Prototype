import { useState, useEffect } from "react";
import { api } from "../api/axios";

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India",
  "Germany", "France", "Japan", "China", "Mexico", "Brazil", "Italy",
  "Spain", "South Korea", "Singapore", "New Zealand", "Ireland",
  "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland",
  "Austria", "Belgium", "Portugal", "Greece", "Poland", "Czech Republic",
  "Hungary", "Romania", "Bulgaria", "Croatia", "Serbia", "Ukraine",
  "Russia", "Turkey", "Israel", "UAE", "Saudi Arabia", "Egypt",
  "South Africa", "Nigeria", "Kenya", "Ghana", "Ethiopia", "Tanzania",
  "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Ecuador",
  "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Philippines",
  "Thailand", "Vietnam", "Indonesia", "Malaysia", "Other"
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian",
  "Japanese", "Chinese", "Korean", "Hindi", "Arabic", "Portuguese",
  "Russian", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Other"];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", city: "", country: "",
    gender: "", about_me: "", languages: "", profile_pic: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [picPreview, setPicPreview] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data || {});
        if (res.data?.profile_pic) setPicPreview(res.data.profile_pic);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleChange(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  function handlePicChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicPreview(reader.result);
        setProfile(prev => ({ ...prev, profile_pic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await api.put("/users/me", profile);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
      <div style={{ color: "#666" }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>My Profile</h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>Manage your personal information</p>

      {success && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}
      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", background: "#e0e0e0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {picPreview
              ? <img src={picPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "32px" }}>👤</span>
            }
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>Profile Picture</div>
            <input type="file" accept="image/*" onChange={handlePicChange} style={{ fontSize: "13px", color: "#666" }} />
            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>JPG, PNG up to 5MB</div>
          </div>
        </div>

        {/* Name + Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={profile.name || ""} onChange={e => handleChange("name", e.target.value)} placeholder="Your full name" required />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} type="email" value={profile.email || ""} onChange={e => handleChange("email", e.target.value)} placeholder="you@example.com" required />
          </div>
        </div>

        {/* Phone + Gender */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} value={profile.phone || ""} onChange={e => handleChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select style={inputStyle} value={profile.gender || ""} onChange={e => handleChange("gender", e.target.value)}>
              <option value="">Select gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* City + Country */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={profile.city || ""} onChange={e => handleChange("city", e.target.value)} placeholder="San Jose" />
          </div>
          <div>
            <label style={labelStyle}>Country</label>
            <select style={inputStyle} value={profile.country || ""} onChange={e => handleChange("country", e.target.value)}>
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Languages */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Languages</label>
          <select style={inputStyle} value={profile.languages || ""} onChange={e => handleChange("languages", e.target.value)}>
            <option value="">Select language</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* About Me */}
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>About Me</label>
          <textarea
            style={{ ...inputStyle, height: "100px", resize: "vertical" }}
            value={profile.about_me || ""}
            onChange={e => handleChange("about_me", e.target.value)}
            placeholder="Tell others a bit about yourself..."
          />
        </div>

        <button type="submit" disabled={saving} style={{
          background: saving ? "#ccc" : "#d32323", color: "#fff",
          border: "none", padding: "12px 32px", borderRadius: "6px",
          fontSize: "15px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer"
        }}>
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "13px", fontWeight: 600,
  color: "#333", marginBottom: "6px"
};

const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #ddd",
  borderRadius: "6px", fontSize: "14px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box", background: "#fff"
};