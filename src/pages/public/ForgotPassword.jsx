import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./AuthGlass.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await axiosClient.post("/users/forgot-password", {
        email: email.trim(),
      });
      const serverMsg = res?.data?.message || "Password reset link sent.";
      setMsg({ type: "success", text: serverMsg });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message || "Failed to send password reset link.";
      setMsg({ type: "danger", text: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center p-3">
      <div className="glass-card p-4 w-100" style={{ maxWidth: 520 }}>
        <div className="mb-4">
          <div className="login-icon">
            <i className="bi bi-key"></i>
          </div>
          <h4 className="login-title">Forgot Password</h4>
          <p className="glass-subtitle">
            Enter your email to receive a reset link.
          </p>
        </div>

        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="link-muted text-decoration-none">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}