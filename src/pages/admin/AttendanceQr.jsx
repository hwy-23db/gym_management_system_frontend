import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { QRCodeCanvas } from "qrcode.react";

export default function AttendanceQr() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await axiosClient.get("/attendance/qr");
    setData(res.data);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await axiosClient.post("/attendance/qr/refresh");
      await load();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!data) return <div className="container py-4">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Gym QR Codes</h4>
        <button className="btn btn-dark" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh QR"}
        </button>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h5>Member QR Code</h5>
              <p className="text-muted">Scan twice daily: check-in then check-out</p>
              <QRCodeCanvas value={data.user_qr} size={220} />
              <div className="mt-3 small text-break">
                <b>Scan link:</b> {data.user_qr}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h5>Trainer QR Code</h5>
              <p className="text-muted">Scan for workday tracking</p>
              <QRCodeCanvas value={data.trainer_qr} size={220} />
              <div className="mt-3 small text-break">
                <b>Scan link:</b> {data.trainer_qr}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
