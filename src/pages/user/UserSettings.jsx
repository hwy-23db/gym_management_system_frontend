import React from "react";
import axiosClient from "../../api/axiosClient";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function UserSettings() {
  const card = {
    borderRadius: 16,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: 16,
    color: "#fff",
    backdropFilter: "blur(8px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  };

  const logoutBtn = {
    width: "100%",
    padding: "14px 12px",
    borderRadius: 14,
    border: "1px solid rgba(220,53,69,0.45)",
    background: "rgba(220,53,69,0.25)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 15,
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch {
      // even if backend fails, continue logout locally
    }

    // clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login
    window.location.href = "/login";
  };

  return (
    <div className="container py-3" style={{ maxWidth: 520 }}>
      {/* Header */}
      <div style={card} className="mb-3">
        <div style={{ fontSize: 18, fontWeight: 900 }}>Settings</div>
        <div className="small" style={{ opacity: 0.9, marginTop: 6 }}>
          User account
        </div>
      </div>

      {/* Logout only */}
      <div style={card}>
        <button style={logoutBtn} onClick={handleLogout}>
          <FaLongArrowAltRight /><span>Logout</span>
        </button>
      </div>
    </div>
  );
}
