import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminQr() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const res = await axiosClient.get("/attendance/qr");
    setData(res.data);
  };

  const refresh = async () => {
    setMsg(null);
    setLoading(true);
    try {
      await axiosClient.post("/attendance/qr/refresh");
      await load();
      setMsg({ type: "success", text: "QR refreshed." });
    } catch (e) {
      setMsg({ type: "danger", text: e?.response?.data?.message || "Failed to refresh." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Gym QR Codes</h4>
          <div className="text-muted">Scan twice: first check-in, second check-out.</div>
        </div>
        <button className="btn btn-dark" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh QR"}
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {!data ? (
        <div>Loading...</div>
      ) : (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5>Member QR Code</h5>
                <p className="text-muted mb-2">Members scan for check-in & check-out</p>
                <QRCodeCanvas value={data.user_qr} size={220} />
                <div className="mt-3 small text-break">
                  <b>Link:</b> {data.user_qr}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5>Trainer QR Code</h5>
                <p className="text-muted mb-2">Trainers scan for check-in & check-out</p>
                <QRCodeCanvas value={data.trainer_qr} size={220} />
                <div className="mt-3 small text-break">
                  <b>Link:</b> {data.trainer_qr}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
