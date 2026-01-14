import React from "react";
import MobileQrScanner from "../../components/MobileQrScanner";

export default function TrainerScan() {
  return (
    <div className="container py-3" style={{ maxWidth: 520 }}>
      <h4 className="mb-1">Trainer Check-in</h4>
      <div className="text-muted mb-3">Open camera and scan the Trainer QR.</div>
      <MobileQrScanner role="trainer" />
    </div>
  );
}
