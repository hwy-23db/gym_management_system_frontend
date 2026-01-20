const subscriptions = [
  {
    plan: "Premium",
    status: "Active",
    renewal: "Aug 30, 2024",
  },
  {
    plan: "Nutrition Add-on",
    status: "Inactive",
    renewal: "—",
  },
];

export default function UserSubscriptions() {
  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>Subscription</h2>
      <p style={{ marginBottom: 16, opacity: 0.85 }}>
        Manage your membership plans and renewal dates.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {subscriptions.map((item) => (
          <div
            key={item.plan}
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{item.plan}</p>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{item.status}</span>
            </div>
            <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
              Renewal date: {item.renewal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}