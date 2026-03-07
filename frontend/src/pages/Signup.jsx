import { useState } from "react";
import { api } from "../services/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setError("");

      await api.post("/signup", { email, password });

      setSuccess("Account created! You can now login.");

      setEmail("");
      setPassword("");

    } catch (err) {
      setError("Signup failed.");
    }
  }

  return (
    <div className="container mt-5">

      <div className="card mx-auto p-4" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">Signup</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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

          <button className="btn btn-success w-100">
            Signup
          </button>

        </form>

      </div>

    </div>
  );
}