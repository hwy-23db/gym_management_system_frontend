import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";

function moneyMMK(v) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-US") + " MMK";
}

function normalizeSubscriptions(payload) {
  // backend returns: { subscriptions: [...] }
  if (Array.isArray(payload?.subscriptions)) return payload.subscriptions;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export default function AdminSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  const [subs, setSubs] = useState([]);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(""); // optional

  const resetForm = () => {
    setMemberId("");
    setPlanId("");
    setStartDate("");
  };

  const load = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await axiosClient.get("/subscriptions");
      setSubs(normalizeSubscriptions(res.data));
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to load subscriptions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    setMsg(null);
    setShowModal(true);
    resetForm();

    // load options: members + plans
    setOptionsLoading(true);
    try {
      const res = await axiosClient.get("/subscriptions/options");
      setMembers(Array.isArray(res.data?.members) ? res.data.members : []);
      setPlans(Array.isArray(res.data?.plans) ? res.data.plans : []);
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to load subscription options.",
      });
      // keep modal open so admin can try again
    } finally {
      setOptionsLoading(false);
    }
  };

  const createSubscription = async () => {
    setMsg(null);

    if (!memberId) {
      setMsg({ type: "danger", text: "Please select a member." });
      return;
    }
    if (!planId) {
      setMsg({ type: "danger", text: "Please select a plan." });
      return;
    }

    try {
      const payload = {
        member_id: Number(memberId),
        membership_plan_id: Number(planId),
      };
      if (startDate) payload.start_date = startDate;

      const res = await axiosClient.post("/subscriptions", payload);

      setShowModal(false);
      setMsg({
        type: "success",
        text: res?.data?.message || "Subscription created successfully.",
      });
      await load();
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to create subscription.",
      });
    }
  };

  const holdSubscription = async (id) => {
    setMsg(null);
    setBusyId(id);
    try {
      const res = await axiosClient.post(`/subscriptions/${id}/hold`);
      setMsg({ type: "success", text: res?.data?.message || "Subscription placed on hold." });
      await load();
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to hold subscription.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const resumeSubscription = async (id) => {
    setMsg(null);
    setBusyId(id);
    try {
      const res = await axiosClient.post(`/subscriptions/${id}/resume`);
      setMsg({ type: "success", text: res?.data?.message || "Subscription resumed." });
      await load();
    } catch (e) {
      setMsg({
        type: "danger",
        text: e?.response?.data?.message || "Failed to resume subscription.",
      });
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const planMap = useMemo(() => {
    const m = new Map();
    for (const p of plans) m.set(String(p.id), p);
    return m;
  }, [plans]);

  return (
    <div className="admin-card p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Subscription Management</h4>
          <div className="admin-muted">
            Track active members, hold subscriptions, and resume when they return.
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={openCreateModal} disabled={loading}>
            <i className="bi bi-plus-circle me-2"></i> Add New Subscription
          </button>

          <button className="btn btn-outline-light" onClick={load} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style={{ width: 90 }}>ID</th>
              <th>Member</th>
              <th>Member Phone</th>
              <th>Plan</th>
              <th>Details</th>
              <th>Price</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th style={{ width: 140 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {subs.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center text-muted py-4">
                  {loading ? "Loading..." : "No subscriptions found."}
                </td>
              </tr>
            ) : (
              subs.map((s) => {
                const status = String(s?.status || "");
                const isOnHold = !!s?.is_on_hold;

                const isExpired = status.toLowerCase() === "expired";
                const canHold = !isExpired && !isOnHold && status.toLowerCase() === "active";
                const canResume = !isExpired && isOnHold;

                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.member_name || "-"}</td>
                    <td>{s.member_phone || "-"}</td>
                    <td>
                      <span className="badge bg-primary">{s.plan_name || "-"}</span>
                    </td>
                    <td>{s.duration_days ? `${s.duration_days} day(s)` : "-"}</td>
                    <td>{moneyMMK(s.price)}</td>
                    <td>{s.start_date || "-"}</td>
                    <td>{s.end_date || "-"}</td>
                    <td>
                      {status === "Active" && <span className="badge bg-success">Active</span>}
                      {status === "On Hold" && <span className="badge bg-warning text-dark">On Hold</span>}
                      {status === "Expired" && <span className="badge bg-secondary">Expired</span>}
                      {!["Active", "On Hold", "Expired"].includes(status) && (
                        <span className="badge bg-info text-dark">{status || "-"}</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          disabled={!canHold || busyId === s.id}
                          onClick={() => holdSubscription(s.id)}
                          title="Place on hold"
                        >
                          {busyId === s.id ? "..." : "Hold"}
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          disabled={!canResume || busyId === s.id}
                          onClick={() => resumeSubscription(s.id)}
                          title="Resume subscription"
                        >
                          {busyId === s.id ? "..." : "Resume"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (Bootstrap) */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Choose a member and plan</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="admin-muted mb-3">
                  Select a member and plan to create a new subscription.
                </div>

                <div className="mb-3">
                  <label className="form-label">Member</label>
                  <select
                    className="form-select"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    disabled={optionsLoading}
                  >
                    <option value="">Select an option</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.phone ? `- ${m.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Plan</label>
                  <select
                    className="form-select"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    disabled={optionsLoading}
                  >
                    <option value="">Select an option</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.duration_days} day(s) - {moneyMMK(p.price)}
                      </option>
                    ))}
                  </select>

                  {planId && planMap.get(String(planId)) && (
                    <div className="admin-muted mt-2">
                      Selected:{" "}
                      <b>
                        {planMap.get(String(planId)).name} ({planMap.get(String(planId)).duration_days} days)
                      </b>
                    </div>
                  )}
                </div>

                {/* Optional start date (backend supports it). Keep it, but admin can ignore. */}
                <div className="mb-2">
                  <label className="form-label">Start Date (optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={optionsLoading}
                  />
                </div>
              </div>

              <div className="modal-footer border-secondary">
                <button className="btn btn-outline-light" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={createSubscription}
                  disabled={optionsLoading}
                >
                  Save Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
