import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { parseTokenFromQrText } from "../../utils/qr";
import QrScanner from "../common/QrScanner";

function toNiceTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function findLastCheckInTimestamp(scans) {
  if (!Array.isArray(scans)) return null;
  for (let i = scans.length - 1; i >= 0; i--) {
    if (scans[i]?.action === "check_in") return scans[i]?.timestamp || null;
  }
  return null;
}

export default function TrainerScan() {
  const isMobile = useMemo(() => window.innerWidth < 768, []);
  const [busy, setBusy] = useState(false);

  const [statusMsg, setStatusMsg] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [result, setResult] = useState(null);

  const busyRef = useRef(false);
  const recentScansRef = useRef([]);

  useEffect(() => {
    recentScansRef.current = recentScans;
  }, [recentScans]);

  const nextAction = useMemo(() => {
    if (latestScan?.action === "check_in") return "check_out";
    return "check_in";
  }, [latestScan]);

  // Load initial status
  useEffect(() => {
    if (!isMobile) return;

    (async () => {
      try {
        const res = await axiosClient.get("/trainer/check-in");
        setLatestScan(res?.data?.latest_scan || null);
        setRecentScans(res?.data?.recent_scans || []);
      } catch (e) {
        setStatusMsg({
          type: "warning",
          text: e?.response?.data?.message || "Unable to load scan status.",
        });
      }
    })();
  }, [isMobile]);

  // ✅ TrainerScan controls workflow: API call + UI messages
  const handleDecode = async (decodedText) => {
    if (busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setStatusMsg(null);
    setResult(null);

    const parsed = parseTokenFromQrText(decodedText);
    if (!parsed?.token) {
      setStatusMsg({ type: "danger", text: "Invalid QR format." });
      busyRef.current = false;
      setBusy(false);
      return;
    }

    try {
      const res = await axiosClient.post("/trainer/check-in/scan", {
        token: parsed.token,
      });

      const record = res?.data?.record;
      const action = record?.action;
      const timestamp = record?.timestamp;

      const prev = recentScansRef.current || [];
      const newRecent = [...prev, { action, timestamp }];

      recentScansRef.current = newRecent;
      setRecentScans(newRecent);
      setLatestScan({ action, timestamp });

      if (action === "check_in") {
        setResult({
          action,
          checkInTime: timestamp,
          checkOutTime: null,
        });
      } else if (action === "check_out") {
        setResult({
          action,
          checkInTime: findLastCheckInTimestamp(newRecent),
          checkOutTime: timestamp,
        });
      }

      setStatusMsg({
        type: "success",
        text: res?.data?.message || "Recorded.",
      });
    } catch (e) {
      setStatusMsg({
        type: "danger",
        text: e?.response?.data?.message || "Scan failed.",
      });
    } finally {
      // Let user read feedback; scanner component will continue after cooldown
      setTimeout(() => {
        busyRef.current = false;
        setBusy(false);
      }, 900);
    }
  };

  if (!isMobile) {
    return (
      <div className="container py-3" style={{ maxWidth: 520 }}>
        <h4 className="mb-1">Trainer Scan</h4>
        <div className="alert alert-warning mb-0">
          Trainer scan is available on mobile view only.
        </div>
      </div>
    );
  }

  const overlayCard = {
    background: "rgba(0,0,0,0.70)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 14,
    color: "rgba(255,255,255,0.96)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  };

  const labelPill = {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.20)",
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 700,
    letterSpacing: 0.2,
  };

  const instructionPill = {
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 700,
    color: "#fff",
    display: "inline-block",
    marginTop: 8,
  };

  return (
    <div className="container py-3" style={{ maxWidth: 520 }}>
      {/* High-contrast overlay header */}
      <div style={overlayCard} className="mb-3">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
              Trainer Check-in / Check-out
            </div>

            <div style={instructionPill}>
              Scan once — system will automatically record{" "}
              <b>Check-in</b> or <b>Check-out</b> based on last attendance.
            </div>
          </div>

          <div className="text-end">
            <span className={`badge ${busy ? "bg-secondary" : "bg-success"}`}>
              {busy ? "Processing" : "Ready"}
            </span>
          </div>
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between">
          <div style={{ opacity: 0.92 }}>
            Next action:
            <span className="ms-2" style={labelPill}>
              {nextAction === "check_in" ? "CHECK-IN" : "CHECK-OUT"}
            </span>
          </div>

          <div className="small" style={{ opacity: 0.9 }}>
            Latest:{" "}
            <b>{latestScan?.action ? latestScan.action.replace("_", "-") : "—"}</b>{" "}
            {latestScan?.timestamp ? `at ${toNiceTime(latestScan.timestamp)}` : ""}
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`alert alert-${statusMsg.type}`} style={{ fontWeight: 600 }}>
          {statusMsg.text}
        </div>
      )}

      {/* ✅ Scanner-only component (no title/text inside it) */}
      <QrScanner onDecode={handleDecode} cooldownMs={1500} />

      {/* Result card */}
      {result && (
        <div style={overlayCard} className="mt-3">
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {result.action === "check_in" ? "Check-in recorded" : "Check-out recorded"}
          </div>

          <hr style={{ opacity: 0.18 }} />

          <div className="small">
            <div className="d-flex justify-content-between">
              <span style={{ opacity: 0.85 }}>Check-in time</span>
              <span style={{ fontWeight: 700 }}>{toNiceTime(result.checkInTime)}</span>
            </div>

            <div className="d-flex justify-content-between mt-2">
              <span style={{ opacity: 0.85 }}>Check-out time</span>
              <span style={{ fontWeight: 700 }}>{toNiceTime(result.checkOutTime)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
