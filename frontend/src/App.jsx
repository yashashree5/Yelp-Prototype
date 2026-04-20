import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, selectIsLoggedIn, selectRole } from "./store/slices/authSlice";
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
import OwnerSignup from "./pages/OwnerSignup.jsx";
import OwnerLogin from "./pages/OwnerLogin.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import OwnerManageRestaurant from "./pages/OwnerManageRestaurant.jsx";
import OwnerProfile from "./pages/OwnerProfile.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

export default function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const role = useSelector(selectRole);

  // Fetch user profile on app load if logged in
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCurrentUser());
    }
  }, [isLoggedIn, dispatch]);

  function renderForRole(requiredRole, element) {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (role !== requiredRole) return (
      <div className="container mt-5">
        <div className="alert alert-warning">You are not authorized to access this page.</div>
      </div>
    );
    return element;
  }

  function renderForRoles(roles, element) {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (!roles.includes(role)) return (
      <div className="container mt-5">
        <div className="alert alert-warning">You are not authorized to access this page.</div>
      </div>
    );
    return element;
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />

        {/* Owner auth routes */}
        <Route path="/owner/signup" element={<OwnerSignup />} />
        <Route path="/owner/login" element={<OwnerLogin />} />

        {/* User protected routes */}
        <Route path="/profile" element={renderForRole("user", <Profile />)} />
        <Route path="/write-review/:id" element={renderForRole("user", <WriteReview />)} />
        <Route path="/add-restaurant" element={renderForRoles(["user", "owner"], <AddRestaurant />)} />
        <Route path="/preferences" element={renderForRole("user", <Preferences />)} />
        <Route path="/favorites" element={renderForRole("user", <Favorites />)} />
        <Route path="/history" element={renderForRole("user", <History />)} />

        {/* Owner protected routes */}
        <Route path="/owner/dashboard" element={renderForRole("owner", <OwnerDashboard />)} />
        <Route path="/owner/profile" element={renderForRole("owner", <OwnerProfile />)} />
        <Route path="/owner/restaurant/:id" element={renderForRole("owner", <OwnerManageRestaurant />)} />
      </Routes>
      <ChatWidget isLoggedIn={isLoggedIn} role={role} />
    </>
  );
}
