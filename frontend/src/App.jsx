import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import RestaurantDetails from "./pages/RestaurantDetails.jsx";
import Profile from "./pages/Profile.jsx";
import WriteReview from "./pages/WriteReview.jsx";
import AddRestaurant from "./pages/AddRestaurant.jsx";
import Preferences from "./pages/Preferences.jsx";
import Favorites from "./pages/Favorites.jsx";
import History from "./pages/History.jsx";
import Chatbot from "./pages/Chatbot";
import OwnerSignup from "./pages/OwnerSignup.jsx";
import OwnerLogin from "./pages/OwnerLogin.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";

export default function App() {
  const [auth, setAuth] = useState({ loggedIn: false, user: null });

  function RequireAuth({ children }) {
    if (!auth.loggedIn) return (
      <div className="container mt-5">
        <div className="alert alert-danger">Login required. <a href="/login">Login here</a></div>
      </div>
    );
    return children;
  }

  return (
    <>
      <Navbar auth={auth} setAuth={setAuth} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />

        {/* Owner auth routes */}
        <Route path="/owner/signup" element={<OwnerSignup />} />
        <Route path="/owner/login" element={<OwnerLogin setAuth={setAuth} />} />

        {/* User protected routes */}
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/write-review/:id" element={<RequireAuth><WriteReview /></RequireAuth>} />
        <Route path="/add-restaurant" element={<RequireAuth><AddRestaurant /></RequireAuth>} />
        <Route path="/preferences" element={<RequireAuth><Preferences /></RequireAuth>} />
        <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="/chatbot" element={<RequireAuth><Chatbot /></RequireAuth>} />

        {/* Owner protected routes */}
        <Route path="/owner/dashboard" element={<RequireAuth><OwnerDashboard /></RequireAuth>} />
      </Routes>
    </>
  );
}