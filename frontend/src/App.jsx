import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Navbar from "./components/NavBar.jsx";

export default function App() {
  function RequireAuth({ auth, children }) {
    if (!auth.loggedIn)
      return <div className="container mt-5"><div className="alert alert-danger">Login required to access this page.</div></div>;
    return children;
  }

  const [auth, setAuth] = useState({ loggedIn: false, user: null });

  return (
    <div className="container mt-4">
      <Navbar auth={auth} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup />} />

        {/* protected routes */}
        {/* 
        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }/>
        */}

      </Routes>

    </div>
  );
}