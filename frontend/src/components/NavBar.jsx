import { Link } from "react-router-dom";

const YelpLogo = () => (
  <svg width="60" height="28" viewBox="0 0 60 28" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="24" fontFamily="'Georgia', serif" fontWeight="900" fontSize="28" fill="#d32323" letterSpacing="-1">yelp</text>
    <text x="53" y="14" fontFamily="Arial" fontWeight="900" fontSize="18" fill="#d32323">✱</text>
  </svg>
);

export default function Navbar({ auth, setAuth }) {
  function handleLogout() {
    setAuth({ loggedIn: false, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  return (
    <nav style={{
      display: "flex", alignItems: "center", padding: "0 24px",
      height: "60px", borderBottom: "1px solid #e0e0e0",
      position: "sticky", top: 0, background: "#fff", zIndex: 100,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", gap: "24px"
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <YelpLogo />
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "14px", color: "#333" }}>
        <span style={{ cursor: "default", fontWeight: 500 }}>Restaurants ▾</span>
        {auth.loggedIn && (
          <>
            {auth.user?.role !== "owner" && (
              <>
                <Link to="/add-restaurant" style={{ textDecoration: "none", color: "#333" }}>Add Restaurant</Link>
                <Link to="/favorites" style={{ textDecoration: "none", color: "#333" }}>Favorites</Link>
                <Link to="/history" style={{ textDecoration: "none", color: "#333" }}>History</Link>
                <Link to="/preferences" style={{ textDecoration: "none", color: "#333" }}>Preferences</Link>
              </>
            )}
            {auth.user?.role === "owner" && (
              <Link to="/owner/dashboard" style={{ textDecoration: "none", color: "#333" }}>Dashboard</Link>
            )}
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
        {auth.loggedIn ? (
          <>
            {auth.user?.role === "user" ? (
              <Link to="/profile" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>
                👤 {auth.user?.name || auth.user?.email}
              </Link>
            ) : (
              <Link to="/owner/profile" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>
                👤 {auth.user?.name || auth.user?.email}
              </Link>
            )}
            <button onClick={handleLogout} style={{
              background: "transparent", border: "1px solid #d32323", color: "#d32323",
              padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontSize: "14px"
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>Log In</Link>
            <Link to="/signup" style={{
              background: "#d32323", color: "#fff", padding: "8px 16px",
              borderRadius: "4px", textDecoration: "none", fontWeight: 600, fontSize: "14px"
            }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}