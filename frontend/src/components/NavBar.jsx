import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectIsLoggedIn, selectRole, selectUser } from "../store/slices/authSlice";

const YelpLogo = () => (
  <svg width="60" height="28" viewBox="0 0 60 28" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="24" fontFamily="'Georgia', serif" fontWeight="900" fontSize="28" fill="#d32323" letterSpacing="-1">yelp</text>
    <text x="53" y="14" fontFamily="Arial" fontWeight="900" fontSize="18" fill="#d32323">✱</text>
  </svg>
);

export default function Navbar() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const role = useSelector(selectRole);
  const user = useSelector(selectUser);

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <nav style={{
      display: "flex", alignItems: "center", padding: "0 24px",
      height: "60px", borderBottom: "1px solid #e0e0e0",
      position: "sticky", top: 0, background: "#fff", zIndex: 100,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", gap: "24px"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <YelpLogo />
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "14px", color: "#333" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}>Restaurants ▾</Link>
        {isLoggedIn && (
          <>
            {role !== "owner" && (
              <>
                <Link to="/add-restaurant" style={{ textDecoration: "none", color: "#333" }}>Add Restaurant</Link>
                <Link to="/favorites" style={{ textDecoration: "none", color: "#333" }}>Favorites</Link>
                <Link to="/history" style={{ textDecoration: "none", color: "#333" }}>History</Link>
                <Link to="/preferences" style={{ textDecoration: "none", color: "#333" }}>Preferences</Link>
              </>
            )}
            {role === "owner" && (
              <>
                <Link to="/owner/dashboard" style={{ textDecoration: "none", color: "#333" }}>Dashboard</Link>
                <Link to="/owner/profile" style={{ textDecoration: "none", color: "#333" }}>My Restaurant</Link>
              </>
            )}
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        {isLoggedIn ? (
          <>
            {user?.profile_pic ? (
              <img src={user.profile_pic} alt="avatar"
                style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "2px solid #eee" }} />
            ) : (
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#d32323",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px" }}>
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <Link to={role === "owner" ? "/owner/profile" : "/profile"}
              style={{ fontSize: "14px", color: "#333", textDecoration: "none", fontWeight: 500 }}>
              {user?.name || "Profile"}
            </Link>
            <button onClick={handleLogout} style={{
              background: "#d32323", color: "#fff", border: "none",
              padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "13px"
            }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: "14px", color: "#333", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
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
