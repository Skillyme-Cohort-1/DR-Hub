import { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";
import { getInitials, normalizeBookingStatus } from "../utils/helpers";

export default function BookingDetails({ bookingId, token, setBookings, onBack }) {
  const addToast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ paymentType: "FullPayment", amount: "" });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinAttendees, setCheckinAttendees] = useState("");
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinError, setCheckinError] = useState("");

  const loadDetails = async (id) => {
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const data = await apiFetch(`/api/bookings/${id}`, { token });
      setBooking(data.booking);
    } catch (err) {
      setError(err.message || "Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId && token) loadDetails(bookingId);
  }, [bookingId, token]);

  const updateBookingStatus = async (newStatus, label) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        token,
        method: "PATCH",
        body: { status: newStatus },
      });
      const normalizedStatus = newStatus === "APPROVED" ? "confirmed" : "rejected";
      setBookings((p) => p.map((b) => (b.id === bookingId ? { ...b, status: normalizedStatus } : b)));
      setBooking((b) => b && { ...b, status: normalizedStatus });
      addToast(`Booking ${label} successfully`, newStatus === "APPROVED" ? "green" : "red", newStatus === "APPROVED" ? "\u2713" : "\u2717");
    } catch (err) {
      addToast(err.message || `Failed to ${label.toLowerCase()} booking`, "red", "\u2717");
    }
  };

  const approveBooking = () => updateBookingStatus("APPROVED", "approved");
  const rejectBooking = () => {
    updateBookingStatus("REJECTED", "rejected");
    setShowRejectConfirm(false);
  };


  const submitPayment = async () => {
    if (!booking) return;
    if (!paymentForm.paymentType || !paymentForm.amount) { setPaymentError("Payment type and amount are required."); return; }
    const amount = Number(paymentForm.amount);
    const balance = Number(booking.amountCharged || 0) - Number(booking.amountPaid || 0);
    if (amount <= 0) { setPaymentError("Amount must be greater than zero."); return; }
    if (amount > balance) { setPaymentError(`Amount cannot exceed the remaining balance (Ksh ${balance.toLocaleString()}).`); return; }
    setPaymentSubmitting(true);
    setPaymentError("");
    try {
      await apiFetch("/api/payments/manual", {
        token, method: "POST",
        body: { bookingId: booking.id, paymentType: paymentForm.paymentType, amount },
      });
      addToast("Payment recorded successfully", "green", "\u2713");
      setShowPayment(false);
      setPaymentForm({ paymentType: "FullPayment", amount: "" });
      loadDetails(booking.id);
    } catch (err) {
      setPaymentError(err.message || "Error connecting to server.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const submitCheckin = async () => {
    if (!booking) return;
    if (!checkinAttendees || Number(checkinAttendees) <= 0) { setCheckinError("Valid number of attendees is required."); return; }
    setCheckinSubmitting(true);
    setCheckinError("");
    try {
      await apiFetch("/api/attendances/check-in", {
        token, method: "POST",
        body: { bookingId: booking.id, numberOfAttendees: Number(checkinAttendees) },
      });
      addToast("Checked in successfully", "green", "\u2713");
      setShowCheckin(false);
      setCheckinAttendees("");
      loadDetails(booking.id);
    } catch (err) {
      setCheckinError(err.message || "Error connecting to server.");
    } finally {
      setCheckinSubmitting(false);
    }
  };

  const openPaymentModal = () => {
    setPaymentError("");
    const initialType = booking.depositPaid ? "BalancePayment" : "Deposit";
    let initialAmount = "";
    if (initialType === "Deposit") initialAmount = booking.user?.role === "MEMBER" ? 1000 : 2000;
    else if (initialType === "BalancePayment") initialAmount = Number(booking.amountCharged || 0) - Number(booking.amountPaid || 0);
    setPaymentForm({ paymentType: initialType, amount: initialAmount });
    setShowPayment(true);
  };

  const status = booking ? normalizeBookingStatus(booking.status) : "";
  const charged = Number(booking?.amountCharged || 0);
  const paid = Number(booking?.amountPaid || 0);
  const balance = charged - paid;

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div><div className="dh-panel-title">Booking Details</div><div className="dh-panel-sub">Full information about the booking</div></div>
        <button className="dh-btn-primary" onClick={onBack}>&larr; Back</button>
      </div>
      <div style={{ padding: 20 }}>
        {loading && <div className="dh-empty">Loading booking details...</div>}
        {!loading && error && <div className="dh-empty" style={{ color: "#ffb4b4" }}>{error}</div>}
        {!loading && !error && booking && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{booking.reference || booking.id}</div>
                <div style={{ color: "#888", fontSize: 12 }}>Created on {new Date(booking.createdAt).toLocaleString()}</div>
              </div>
              <StatusBadge status={status} />
            </div>

            {/* Info cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              <InfoCard title="Client Information">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Avatar initials={getInitials(booking.user?.name)} color="#6c63ff" size={40} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{booking.user?.name || "N/A"}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{booking.user?.email || "N/A"}</div>
                  </div>
                </div>
              </InfoCard>
              <InfoCard title="Reservation Details">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                  <Field label="Room">{booking.room?.name || "N/A"}</Field>
                  <Field label="Date">{booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}</Field>
                  <Field label="Time Slot">{booking.slot?.title || "N/A"}</Field>
                </div>
              </InfoCard>
              <InfoCard title="Payment Summary">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                  <Field label="Amount Charged"><span style={{ color: "#F07B2B" }}>Ksh {charged.toLocaleString()}</span></Field>
                  <Field label="Amount Paid"><span style={{ color: "#22C55E" }}>Ksh {paid.toLocaleString()}</span></Field>
                  <Field label="Deposit Paid">{booking.depositPaid ? "Yes" : "No"}</Field>
                  <Field label="Payments Count">{booking.payments?.length || 0}</Field>
                </div>
              </InfoCard>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 10, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {charged > paid && <button className="dh-action-btn btn-view" style={{ padding: "10px 20px", fontSize: 13, borderColor: "#22C55E", color: "#22C55E" }} onClick={openPaymentModal}>{"\u{1F4B3}"} Make Payment</button>}
              {status === "pending" && <button className="dh-action-btn btn-approve" style={{ padding: "10px 20px", fontSize: 13 }} onClick={approveBooking}>{"\u2713"} Approve Booking</button>}
              {(status === "pending" || status === "draft") && <button className="dh-action-btn btn-reject" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => setShowRejectConfirm(true)}>{"\u2717"} Reject Booking</button>}

              {status === "checked in" && (
                <button className="dh-action-btn btn-reject" style={{ padding: "10px 20px", fontSize: 13 }} onClick={async () => {
                  try {
                    await apiFetch("/api/attendances/check-out", { token, method: "POST", body: { bookingId: booking.id } });
                    addToast("Checked out successfully", "green", "\u2713");
                    loadDetails(booking.id);
                  } catch (err) {
                    addToast(err.message || "Failed to check out", "red", "\u2717");
                  }
                }}>{"\u{1F44B}"} Check-Out</button>
              )}
              {status !== "checked in" && (
                charged <= paid
                  ? <button className="dh-action-btn btn-view" style={{ padding: "10px 20px", fontSize: 13, borderColor: "#3B82F6", color: "#3B82F6" }} onClick={() => { setCheckinError(""); setCheckinAttendees(""); setShowCheckin(true); }}>{"\u{1F44B}"} Check-in</button>
                  : <button className="dh-action-btn" style={{ padding: "10px 20px", fontSize: 13, borderColor: "#555", color: "#888", cursor: "not-allowed" }} disabled>{"\u{1F44B}"} Check-in</button>
              )}
            </div>

            {/* Payments history */}
            {booking.payments?.length > 0 && (
              <InfoCard title="Payments History" style={{ marginTop: 20 }}>
                <div className="dh-table-wrap">
                  <table className="dh-table" style={{ background: "transparent" }}>
                    <thead><tr><th style={{ paddingLeft: 0 }}>ID</th><th>Type</th><th>Method</th><th>Amount</th><th>Date</th><th style={{ paddingRight: 0 }}>Status</th></tr></thead>
                    <tbody>
                      {booking.payments.map((pmt, i) => (
                        <tr key={pmt.id} style={{ cursor: "default" }}>
                          <td style={{ paddingLeft: 0, fontWeight: 600 }}>{i + 1}</td>
                          <td>{pmt.paymentType || "-"}</td>
                          <td>{pmt.paymentMethod || "-"}</td>
                          <td>{pmt.amount || 0}</td>
                          <td style={{ color: "#888", fontSize: 11 }}>{pmt.createdAt ? new Date(pmt.createdAt).toLocaleDateString() : "-"}</td>
                          <td style={{ paddingRight: 0 }}><StatusBadge status={pmt.status ? String(pmt.status).toLowerCase() : "pending"} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </InfoCard>
            )}

            {booking.notes && (
              <InfoCard title="Booking Notes" style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "#ccc" }}>{booking.notes}</div>
              </InfoCard>
            )}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {showPayment && booking && (
        <Modal title="Record Manual Payment" subtitle={`Booking ${booking.reference || booking.id}`} onClose={() => setShowPayment(false)} footer={
          <>
            <button className="dh-btn-cancel" onClick={() => setShowPayment(false)}>Cancel</button>
            <button className="dh-btn-primary" onClick={submitPayment} disabled={paymentSubmitting}>{paymentSubmitting ? "Recording..." : "Record Payment"}</button>
          </>
        }>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 6, marginBottom: 10, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#888" }}>Amount Charged:</span><span>Ksh {charged.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#888" }}>Amount Paid:</span><span style={{ color: "#22C55E" }}>Ksh {paid.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 4, marginTop: 4 }}><span style={{ color: "#888" }}>Remaining Balance:</span><span style={{ fontWeight: 600, color: "#F07B2B" }}>Ksh {balance.toLocaleString()}</span></div>
          </div>
          <div className="dh-form-row">
            <div className="dh-form-group">
              <label>Payment Type *</label>
              <select value={paymentForm.paymentType} onChange={(e) => {
                const t = e.target.value;
                let a = "";
                if (t === "Deposit") a = booking.user?.role === "MEMBER" ? 1000 : 2000;
                else if (t === "FullPayment") a = charged;
                else if (t === "BalancePayment") a = balance;
                setPaymentForm({ paymentType: t, amount: a });
              }}>
                {booking.depositPaid ? <option value="BalancePayment">Balance Payment</option> : <><option value="Deposit">Deposit</option><option value="FullPayment">Full Payment</option></>}
              </select>
            </div>
            <div className="dh-form-group">
              <label>Amount (Ksh) *</label>
              <input type="number" min="1" placeholder="Enter amount" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} />
            </div>
          </div>
          {paymentError && <div style={{ color: "#ffb4b4", fontSize: 12 }}>{paymentError}</div>}
        </Modal>
      )}

      {/* Check-in modal */}
      {showCheckin && booking && (
        <Modal title="Check-in Attendees" subtitle={`Booking ${booking.reference || booking.id}`} onClose={() => setShowCheckin(false)} footer={
          <>
            <button className="dh-btn-cancel" onClick={() => setShowCheckin(false)}>Cancel</button>
            <button className="dh-btn-primary" onClick={submitCheckin} disabled={checkinSubmitting}>{checkinSubmitting ? "Checking in..." : "Confirm Check-in"}</button>
          </>
        }>
          <div className="dh-form-group">
            <label>Number of Attendees *</label>
            <input type="number" min="1" placeholder="Enter number of attendees" value={checkinAttendees} onChange={(e) => setCheckinAttendees(e.target.value)} />
          </div>
          {checkinError && <div style={{ color: "#ffb4b4", fontSize: 12, marginTop: 10 }}>{checkinError}</div>}
        </Modal>
      )}

      {/* Reject confirmation */}
      {showRejectConfirm && (
        <Modal title="Reject Booking" onClose={() => setShowRejectConfirm(false)} footer={
          <>
            <button className="dh-btn-cancel" onClick={() => setShowRejectConfirm(false)}>Cancel</button>
            <button className="dh-btn-primary" style={{ background: "#EF4444" }} onClick={rejectBooking}>Confirm Reject</button>
          </>
        }>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>
            Are you sure you want to reject booking <strong style={{ color: "var(--text-primary)" }}>{booking?.reference || bookingId}</strong>? This action will update the booking status to rejected.
          </p>
        </Modal>
      )}
    </div>
  );
}

function InfoCard({ title, children, style }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", ...style }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 12, fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{children}</div>
    </div>
  );
}