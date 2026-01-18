import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { FaCalendar, FaClock } from "react-icons/fa";

/**
 * Endpoint:
 *   GET /api/trainer/subscriptions
 *
 * Response:
 * {
 *   "bookings": [
 *      {
 *        id,
 *        member_name | member:{name},
 *        date | start_date,
 *        time | start_time,
 *        session_datetime (common: "YYYY-MM-DD HH:mm:ss"),
 *        status,
 *        note
 *      }
 *   ]
 * }
 */

function getMemberName(b) {
  return b?.member_name || b?.member?.name || b?.user?.name || "—";
}

/** ✅ NEW: parse backend datetime safely (supports "YYYY-MM-DD HH:mm:ss" and ISO) */
function parseBackendDateTime(value) {
  if (!value) return null;
  const str = String(value);
  const normalized = str.includes("T") ? str : str.replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** ✅ UPDATED: supports session_datetime + more fallbacks */
function getDate(b) {
  const dtRaw =
    b?.session_datetime ||
    b?.session_time ||
    b?.datetime ||
    b?.date_time ||
    b?.starts_at ||
    b?.start_time;

  const d = parseBackendDateTime(dtRaw);
  if (d) return formatISODate(d);

  // fallback if backend provides a pure date field
  if (b?.date) return b.date;
  if (b?.start_date) return b.start_date;

  // fallback if string contains date at beginning
  if (typeof dtRaw === "string" && dtRaw.length >= 10) return dtRaw.slice(0, 10);

  return "";
}

/** ✅ UPDATED: supports session_datetime + more fallbacks */
function getTime(b) {
  const dtRaw =
    b?.session_datetime ||
    b?.session_time ||
    b?.datetime ||
    b?.date_time ||
    b?.starts_at ||
    b?.start_time;

  const d = parseBackendDateTime(dtRaw);
  if (d) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // fallback if backend provides a pure time field
  if (b?.time) return b.time;

  // fallback if string looks like time or includes time part
  if (typeof dtRaw === "string") {
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(dtRaw)) return dtRaw; // "10:30" or "10:30:00"
    const maybe = dtRaw.split(" ")[1] || dtRaw.split("T")[1]; // "YYYY-MM-DD HH:mm:ss" or ISO
    if (maybe) return maybe;
  }

  return "—";
}

export default function TrainerBooking() {
  const isMobile = useMemo(() => window.innerWidth < 768, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookings, setBookings] = useState([]);

  // filters
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ UPDATED ENDPOINT
      const res = await axiosClient.get("/trainer/subscriptions");
      setBookings(Array.isArray(res?.data?.bookings) ? res.data.bookings : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const nameMatch =
        !search || getMemberName(b).toLowerCase().includes(search.toLowerCase());

      const dateMatch = !date || getDate(b) === date;

      return nameMatch && dateMatch;
    });
  }, [bookings, search, date]);

  const cardStyle = {
    borderRadius: 14,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: 14,
    color: "#fff",
    backdropFilter: "blur(6px)",
  };

  const pill = (bg) => ({
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    background: bg,
    border: "1px solid rgba(255,255,255,0.15)",
  });

  const statusPill = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("cancel")) return pill("rgba(220,53,69,0.35)");
    if (s.includes("complete")) return pill("rgba(25,135,84,0.35)");
    if (s.includes("pending")) return pill("rgba(255,193,7,0.35)");
    return pill("rgba(13,110,253,0.35)");
  };

  if (!isMobile) {
    return (
      <div className="container py-3" style={{ maxWidth: 720 }}>
        <div className="alert alert-warning">
          Trainer booking view is optimized for mobile.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={cardStyle} className="mb-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              Trainer Bookings
            </div>
            <div className="small" style={{ opacity: 0.9 }}>
              From subscriptions
            </div>
          </div>

          <button
            className="btn btn-sm btn-outline-light"
            onClick={fetchBookings}
            disabled={loading}
            style={{ borderRadius: 10 }}
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mt-3 d-flex gap-2">
          <input
            className="form-control"
            placeholder="Search member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              borderRadius: 12,
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
            }}
          />

          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              borderRadius: 12,
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              width: 150,
            }}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* List */}
      {loading ? (
        <div style={cardStyle}>Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div style={cardStyle}>No bookings found.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filtered.map((b, i) => (
            <div key={b.id ?? i} style={cardStyle}>
              <div className="d-flex justify-content-between">
                <div style={{ fontWeight: 900 }}>{getMemberName(b)}</div>
                <span style={statusPill(b.status)}>
                  {String(b.status || "ACTIVE").toUpperCase()}
                </span>
              </div>

              <div className="mt-2 d-flex gap-2 flex-wrap">
                <span style={pill("rgba(255,255,255,0.12)")}>
                  <FaCalendar/> {getDate(b) || "—"}
                </span>
                <span style={pill("rgba(255,255,255,0.12)")}>
                  <FaClock/> {getTime(b)}
                </span>
              </div>

              {b.note && (
                <div className="small mt-2" style={{ opacity: 0.9 }}>
                  {b.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
