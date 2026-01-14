import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function moneyMMK(v) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-US") + " MMK";
}

export default function AdminPricing() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [prices, setPrices] = useState({
    monthly: "",
    quarterly: "",
    annual: "",
  });

  const [inputs, setInputs] = useState({
    monthly: "",
    quarterly: "",
    annual: "",
  });

  const [trainers, setTrainers] = useState([]);
  const [trainerInputs, setTrainerInputs] = useState({});
  const [busyKey, setBusyKey] = useState(null);

  const load = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const res = await axiosClient.get("/pricing");
      const p = res.data?.subscription_prices || {};

      const monthly = p.monthly ?? "";
      const quarterly = p.quarterly ?? "";
      const annual = p.annual ?? "";

      setPrices({ monthly, quarterly, annual });
      setInputs({
        monthly: String(monthly),
        quarterly: String(quarterly),
        annual: String(annual),
      });

      const t = Array.isArray(res.data?.trainers) ? res.data.trainers : [];
      setTrainers(t);

      const ti = {};
      t.forEach((tr) => {
        ti[tr.id] = String(tr.price_per_session ?? "");
      });
      setTrainerInputs(ti);
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to load pricing.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updatePlan = async (type) => {
    setMsg(null);

    const value = Number(inputs[type]);
    if (Number.isNaN(value) || value < 0) {
      setMsg({ type: "danger", text: "Please enter a valid price." });
      return;
    }

    setBusyKey(type);
    try {
      if (type === "monthly") {
        const res = await axiosClient.put("/pricing/monthly", {
          monthly_subscription_price: value,
        });
        setMsg({ type: "success", text: res?.data?.message || "Monthly price updated." });
      }

      if (type === "quarterly") {
        const res = await axiosClient.put("/pricing/quarterly", {
          quarterly_subscription_price: value,
        });
        setMsg({ type: "success", text: res?.data?.message || "Quarterly price updated." });
      }

      if (type === "annual") {
        const res = await axiosClient.put("/pricing/annual", {
          annual_subscription_price: value,
        });
        setMsg({ type: "success", text: res?.data?.message || "Annual price updated." });
      }

      await load();
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to update price.",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const updateTrainer = async (trainerId) => {
    setMsg(null);

    const value = Number(trainerInputs[trainerId]);
    if (Number.isNaN(value) || value < 0) {
      setMsg({ type: "danger", text: "Please enter a valid trainer session price." });
      return;
    }

    setBusyKey(`trainer-${trainerId}`);
    try {
      const res = await axiosClient.put(`/pricing/trainers/${trainerId}`, {
        price_per_session: value,
      });

      setMsg({ type: "success", text: res?.data?.message || "Trainer price updated." });
      await load();
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to update trainer price.",
      });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="admin-card p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Pricing</h4>
          <div className="admin-muted">Update subscription prices and trainer session pricing.</div>
        </div>

        <button className="btn btn-outline-light" onClick={load} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* ===== Subscription plan pricing ===== */}
      <div className="row g-3 mb-4">
        {/* Monthly */}
        <div className="col-12 col-md-4">
          <div className="card bg-dark text-light h-100 border-secondary">
            <div className="card-header border-secondary fw-semibold">Monthly Plan</div>
            <div className="card-body">
              <div className="admin-muted">Current monthly price</div>
              <div className="fs-5 fw-bold mb-3">{moneyMMK(prices.monthly)}</div>

              <div className="input-group mb-3">
                <input
                  className="form-control"
                  value={inputs.monthly}
                  onChange={(e) => setInputs((s) => ({ ...s, monthly: e.target.value }))}
                  placeholder="Enter new price"
                />
                <span className="input-group-text">MMK</span>
              </div>

              <button
                className="btn btn-primary w-100"
                disabled={busyKey === "monthly"}
                onClick={() => updatePlan("monthly")}
              >
                {busyKey === "monthly" ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Quarterly */}
        <div className="col-12 col-md-4">
          <div className="card bg-dark text-light h-100 border-secondary">
            <div className="card-header border-secondary fw-semibold">Quarterly Plan</div>
            <div className="card-body">
              <div className="admin-muted">Current quarterly price</div>
              <div className="fs-5 fw-bold mb-3">{moneyMMK(prices.quarterly)}</div>

              <div className="input-group mb-3">
                <input
                  className="form-control"
                  value={inputs.quarterly}
                  onChange={(e) => setInputs((s) => ({ ...s, quarterly: e.target.value }))}
                  placeholder="Enter new price"
                />
                <span className="input-group-text">MMK</span>
              </div>

              <button
                className="btn btn-primary w-100"
                disabled={busyKey === "quarterly"}
                onClick={() => updatePlan("quarterly")}
              >
                {busyKey === "quarterly" ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Annual */}
        <div className="col-12 col-md-4">
          <div className="card bg-dark text-light h-100 border-secondary">
            <div className="card-header border-secondary fw-semibold">Annual Plan</div>
            <div className="card-body">
              <div className="admin-muted">Current annual price</div>
              <div className="fs-5 fw-bold mb-3">{moneyMMK(prices.annual)}</div>

              <div className="input-group mb-3">
                <input
                  className="form-control"
                  value={inputs.annual}
                  onChange={(e) => setInputs((s) => ({ ...s, annual: e.target.value }))}
                  placeholder="Enter new price"
                />
                <span className="input-group-text">MMK</span>
              </div>

              <button
                className="btn btn-primary w-100"
                disabled={busyKey === "annual"}
                onClick={() => updatePlan("annual")}
              >
                {busyKey === "annual" ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Trainer session pricing ===== */}
      <div className="card bg-dark text-light border-secondary">
        <div className="card-header border-secondary fw-semibold">Trainer Session Pricing</div>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Trainer Name</th>
                <th style={{ width: 260 }}>Price per Session (MMK)</th>
                <th style={{ width: 140 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    {loading ? "Loading..." : "No trainers found."}
                  </td>
                </tr>
              ) : (
                trainers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>
                      <div className="input-group">
                        <input
                          className="form-control"
                          value={trainerInputs[t.id] ?? ""}
                          onChange={(e) =>
                            setTrainerInputs((s) => ({ ...s, [t.id]: e.target.value }))
                          }
                        />
                        <span className="input-group-text">MMK</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={busyKey === `trainer-${t.id}`}
                        onClick={() => updateTrainer(t.id)}
                      >
                        {busyKey === `trainer-${t.id}` ? "Updating..." : "Update"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
