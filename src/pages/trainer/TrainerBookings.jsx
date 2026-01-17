import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";

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
 *        status,
 *        note
 *      }
 *   ]
 * }
 */

function getMemberName(b) {
  return (
    b?.member_name ||
    b?.member?.name ||
    b?.user?.name ||
    "—"
  );
}

function getDate(b) {
  return (
    b?.date ||
    b?.start_date ||
    (b?.start_time ? b.start_time.slice(0, 10) : "")
  );
}

function getTime(b) {
  if (!b?.time && !b?.start_time) return "—";

  if (b?.start_time) {
    const d = new Date(b.start_time);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return b.start_time;
  }

  return b.time;
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
        !search ||
        getMemberName(b).toLowerCase().includes(search.toLowerCase());

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
                <div style={{ fontWeight: 900 }}>
                  {getMemberName(b)}
                </div>
                <span style={statusPill(b.status)}>
                  {String(b.status || "ACTIVE").toUpperCase()}
                </span>
              </div>

              <div className="mt-2 d-flex gap-2 flex-wrap">
                <span style={pill("rgba(255,255,255,0.12)")}>
                  📅 {getDate(b) || "—"}
                </span>
                <span style={pill("rgba(255,255,255,0.12)")}>
                  ⏰ {getTime(b)}
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
