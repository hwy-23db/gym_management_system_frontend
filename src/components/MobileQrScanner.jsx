import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axiosClient from "../api/axiosClient";
import { parseTokenFromQrText } from "../utils/qr";

export default function MobileQrScanner({ role }) {
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);

    scanner.render(async (decodedText) => {
      const parsed = parseTokenFromQrText(decodedText);

      if (!parsed) {
        setMsg({ type: "danger", text: "Invalid QR format." });
        return;
      }

      if (parsed.type && role === "user" && parsed.type !== "user") {
        setMsg({ type: "warning", text: "Please scan the Member QR code." });
        return;
      }
      if (parsed.type && role === "trainer" && parsed.type !== "trainer") {
        setMsg({ type: "warning", text: "Please scan the Trainer QR code." });
        return;
      }

      try {
        const endpoint = role === "trainer" ? "/trainer/check-in/scan" : "/user/check-in/scan";
        const res = await axiosClient.post(endpoint, { token: parsed.token });
        setMsg({ type: "success", text: res?.data?.message || "Recorded." });
      } catch (e) {
        setMsg({ type: "danger", text: e?.response?.data?.message || "Scan failed." });
      } finally {
        scanner.clear().catch(() => {});
      }
    });

    return () => scanner.clear().catch(() => {});
  }, [role]);

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div id="qr-reader" className="border rounded p-2 bg-light" />
      <div className="text-muted small mt-2">
        Scan twice daily: first scan = check-in, second scan = check-out.
      </div>
    </>
  );
}
