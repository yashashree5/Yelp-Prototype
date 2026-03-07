import { useState } from "react";
import { api } from "../services/api";

export default function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/login", { email, password });

      localStorage.setItem("token", res.data.access_token);

      setAuth({ loggedIn: true, user: res.data.user });

    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">

      <div className="card mx-auto p-4" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}