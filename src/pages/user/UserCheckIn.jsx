import MobileQrScanner from "../../components/MobileQrScanner";

export default function UserCheckIn() {
  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>Check-in</h2>
      <p style={{ marginBottom: 16, opacity: 0.85 }}>
        Scan your member QR code to check in at the gym.
      </p>
      <MobileQrScanner role="user" />
    </div>
  );
}