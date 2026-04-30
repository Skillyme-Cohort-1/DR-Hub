import { useState } from "react";
import Avatar from "../components/Avatar";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";

export default function BookingsPage({
  bookings,
  setBookings,
  token,
  loading,
  error,
  onOpenBookingDetails,
}) {
  const addToast = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectTargetId, setRejectTargetId] = useState(null);

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.room.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const updateBookingStatus = async (id, newStatus, label) => {
    try {
      await apiFetch(`/api/bookings/${id}/status`, {
        token,
        method: "PATCH",
        body: { status: newStatus },
      });
      const normalizedStatus = newStatus === "APPROVED" ? "confirmed" : "rejected";
      setBookings((p) => p.map((b) => (b.id === id ? { ...b, status: normalizedStatus } : b)));
      addToast(`Booking ${label} successfully`, newStatus === "APPROVED" ? "green" : "red", newStatus === "APPROVED" ? "\u2713" : "\u2717");
    } catch (err) {
      addToast(err.message || `Failed to ${label.toLowerCase()} booking`, "red", "\u2717");
    }
  };

  const approveBooking = (id) => updateBookingStatus(id, "APPROVED", "approved");
  const rejectBooking = (id) => {
    updateBookingStatus(id, "REJECTED", "rejected");
    setRejectTargetId(null);
  };

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div>
          <div className="dh-panel-title">All Bookings</div>
          <div className="dh-panel-sub">
            {loading ? "Loading bookings..." : `${filtered.length} of ${bookings.length} shown`}
          </div>
          {!loading && error && <div className="dh-panel-sub" style={{ color: "#fca5a5" }}>{error}</div>}
        </div>
      </div>
      <div className="dh-filter-bar">
        {["all", "pending", "confirmed", "rejected", "completed"].map((f) => (
          <button key={f} className={`dh-filter-btn ${filter === f ? "active-filter" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && <span style={{ marginLeft: 5, opacity: 0.7 }}>({bookings.filter((b) => b.status === f).length})</span>}
          </button>
        ))}
        <input className="dh-search" placeholder="Search name or room..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginLeft: "auto" }} />
      </div>
      <div className="dh-table-wrap">
        <table className="dh-table">
          <thead><tr><th>ID</th><th>Client</th><th>Room</th><th>Date</th><th>Slot</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8}><div className="dh-empty">No bookings match this filter</div></td></tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} onClick={() => onOpenBookingDetails(b.id)}>
                <td style={{ color: "#888", fontSize: 10 }}>{b.reference}</td>
                <td><div className="dh-client-cell"><Avatar initials={b.initials} color={b.color} /><div><div className="dh-cname">{b.name}</div><div className="dh-ctype">{b.type}</div></div></div></td>
                <td><span className="dh-room-chip">{b.roomIcon} {b.room}</span></td>
                <td style={{ color: "#888", fontSize: 11 }}>{b.date}</td>
                <td><span className="dh-slot-badge">{b.slot}</span></td>
                <td><span className="dh-amount">{b.amount.toLocaleString()}</span></td>
                <td><StatusBadge status={b.status} /></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="dh-actions">
                    {b.status === "pending" && <button className="dh-action-btn btn-approve" onClick={() => approveBooking(b.id)}>{"\u2713"} Approve</button>}
                    {(b.status === "pending" || b.status === "draft") && <button className="dh-action-btn btn-reject" onClick={() => setRejectTargetId(b.id)}>{"\u2717"} Reject</button>}
                    {b.status !== "pending" && b.status !== "draft" && <button className="dh-action-btn btn-view" onClick={() => onOpenBookingDetails(b.id)}>View</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectTargetId && (
        <Modal title="Reject Booking" onClose={() => setRejectTargetId(null)} footer={
          <>
            <button className="dh-btn-cancel" onClick={() => setRejectTargetId(null)}>Cancel</button>
            <button className="dh-btn-primary" style={{ background: "#EF4444" }} onClick={() => rejectBooking(rejectTargetId)}>Confirm Reject</button>
          </>
        }>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>
            Are you sure you want to reject this booking? This action will update the booking status to rejected.
          </p>
        </Modal>
      )}
    </div>
  );
}