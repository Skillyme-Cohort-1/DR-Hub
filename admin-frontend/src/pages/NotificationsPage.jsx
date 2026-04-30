import { useState } from "react";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";

export default function NotificationsPage({ bookings, setBookings, token }) {
  const addToast = useToast();
  const [rejectTargetId, setRejectTargetId] = useState(null);

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
        <div className="dh-panel-title">{"\u{1F514}"} All Notifications</div>
        <button className="dh-panel-link" onClick={() => addToast("Notifications cleared", "green", "\u2713")}>Clear all</button>
      </div>
      {bookings.filter((b) => b.status === "pending").map((b) => (
        <div key={b.id} className="dh-alert-item">
          <div className="dh-alert-icon" style={{ background: "rgba(245,158,11,0.12)" }}>{"\u231B"}</div>
          <div style={{ flex: 1 }}>
            <div className="dh-alert-title">Pending Approval &mdash; {b.name}</div>
            <div className="dh-alert-desc">{b.room} &middot; {b.slot} &middot; {b.date} &middot; Ksh {b.amount.toLocaleString()}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="dh-action-btn btn-approve" onClick={() => approveBooking(b.id)}>{"\u2713"} Approve</button>
            <button className="dh-action-btn btn-reject" onClick={() => setRejectTargetId(b.id)}>{"\u2717"} Reject</button>
          </div>
        </div>
      ))}
      {bookings.filter((b) => b.payment === "pending").map((b) => (
        <div key={`pay-${b.id}`} className="dh-alert-item">
          <div className="dh-alert-icon" style={{ background: "rgba(240,123,43,0.12)" }}>{"\u{1F4B3}"}</div>
          <div>
            <div className="dh-alert-title">Payment Pending &mdash; {b.name}</div>
            <div className="dh-alert-desc">Ksh {b.amount.toLocaleString()} outstanding for {b.room} on {b.date}</div>
          </div>
          <div className="dh-alert-time">Today</div>
        </div>
      ))}
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