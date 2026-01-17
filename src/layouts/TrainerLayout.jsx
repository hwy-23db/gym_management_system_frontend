import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiHome, FiLogIn, FiMessageCircle, FiCalendar, FiSettings } from "react-icons/fi";
import "./TrainerLayout.css";

export default function TrainerLayout() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ mobile-only trainer view
  if (!isMobile) {
    return (
      <div className="trainer-shell">
        <main className="trainer-content">
          <div>
            <h2>Mobile Only</h2>
            <p>Please open Trainer View on a mobile device.</p>
            <p style={{ opacity: 0.8, marginTop: 8 }}>
              (Max width: 767px)
            </p>

            {/* optional quick redirect */}
            <div style={{ marginTop: 14 }}>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="trainer-shell">
      <main className="trainer-content">
        <Outlet />
      </main>

      <nav className="trainer-bottom-nav">
        <NavLink
          to="/trainer/home"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <FiHome className="nav-icon" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/trainer/scan"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <FiLogIn className="nav-icon" />
          <span>Check In</span>
        </NavLink>

        <NavLink
          to="/trainer/messages"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <FiMessageCircle className="nav-icon" />
          <span>Messages</span>
        </NavLink>

        <NavLink
          to="/trainer/bookings"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <FiCalendar className="nav-icon" />
          <span>Bookings</span>
        </NavLink>
        <NavLink
          to="/trainer/settings"
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
          <FiSettings className="nav-icon" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
