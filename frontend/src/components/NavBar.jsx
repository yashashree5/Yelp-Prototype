import { Link } from "react-router-dom";

export default function Navbar({ auth, setAuth }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-danger" to="/">Yelp Prototype</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Explore</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {auth.loggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">{auth.user.name}</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-danger ms-2" onClick={() => { setAuth({ loggedIn: false, user: null }); localStorage.removeItem("token"); }}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-danger ms-2" to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}