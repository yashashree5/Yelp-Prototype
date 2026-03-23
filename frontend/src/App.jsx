import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar.jsx";
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
import OwnerManageRestaurant from "./pages/OwnerManageRestaurant.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "user";
    return token ? { loggedIn: true, user: { role } } : { loggedIn: false, user: null };
  });

  function renderForRole(role, element) {
    if (!auth.loggedIn) return (
      <div className="container mt-5">
        <div className="alert alert-danger">Login required. <a href="/login">Login here</a></div>
      </div>
    );
    if (auth.user?.role !== role) return (
      <div className="container mt-5">
        <div className="alert alert-warning">You are not authorized to access this page.</div>
      </div>
    );
    return element;
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
        <Route path="/profile" element={renderForRole("user", <Profile />)} />
        <Route path="/write-review/:id" element={renderForRole("user", <WriteReview />)} />
        <Route path="/add-restaurant" element={renderForRole("user", <AddRestaurant />)} />
        <Route path="/preferences" element={renderForRole("user", <Preferences />)} />
        <Route path="/favorites" element={renderForRole("user", <Favorites />)} />
        <Route path="/history" element={renderForRole("user", <History />)} />
        <Route path="/chatbot" element={renderForRole("user", <Chatbot />)} />

        {/* Owner protected routes */}
        <Route path="/owner/dashboard" element={renderForRole("owner", <OwnerDashboard />)} />
        <Route path="/owner/restaurant/:id" element={renderForRole("owner", <OwnerManageRestaurant />)} />
      </Routes>
      <ChatWidget isLoggedIn={auth.loggedIn} />
    </>
  );
}