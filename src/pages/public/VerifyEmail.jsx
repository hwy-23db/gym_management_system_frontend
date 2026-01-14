import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./AuthGlass.css";

export default function VerifyEmail() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const e = sessionStorage.getItem("verify_email") || "";
    setEmail(e);
    if (!e) nav("/register");
  }, [nav]);

  const onSubmit = async (data) => {
    setMsg(null);
    setLoading(true);
    try {
      await axiosClient.post("/register/verify-email", {
        email,
        code: data.code,
      });

      sessionStorage.removeItem("verify_email");
      nav("/login");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center p-3">
      <div className="glass-card p-4 w-100" style={{ maxWidth: 460 }}>
        <div className="mb-4">
          <div className="login-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <h4 className="login-title">Verify Email</h4>
          <p className="glass-subtitle">
            Enter the 6-digit code sent to <b>{email}</b>
          </p>
        </div>

        {msg && <div className="alert alert-danger">{msg}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Verification Code</label>
            <input
              className={`form-control ${errors.code ? "is-invalid" : ""}`}
              placeholder="123456"
              {...register("code", {
                required: "Required",
                minLength: { value: 6, message: "Code must be 6 digits" },
                maxLength: { value: 6, message: "Code must be 6 digits" },
              })}
            />
            {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Verifying..." : "VERIFY"}
          </button>

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link link-muted text-decoration-none p-0"
              onClick={() => nav("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
