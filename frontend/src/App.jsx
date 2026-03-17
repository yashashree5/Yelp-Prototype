import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import RestaurantDetails from "./pages/RestaurantDetails.jsx";

export default function App() {
  const [auth, setAuth] = useState({ loggedIn: false, user: null });

  function RequireAuth({ auth, children }) {
    if (!auth.loggedIn) return <div className="container mt-5"><div className="alert alert-danger">Login required.</div></div>;
    return children;
  }

  return (
    <>
      <Navbar auth={auth} setAuth={setAuth} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      </Routes>
    </>
  );
}