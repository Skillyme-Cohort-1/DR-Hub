import { useState } from "react";
import Avatar from "../components/Avatar";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";
import { formatCalendarDayLabel } from "../utils/helpers";

export default function Overview({
  bookings,
  setBookings,
  token,
  calendarDays,
  calendarSlots,
  calendarRooms,
  getCalSlot,
  onNavigate,
  onOpenBookingDetails,
  onOpenBookingFromSlot,
}) {
  const addToast = useToast();

  const [rejectTargetId, setRejectTargetId] = useState(null);

  const totalRevenue = bookings.filter((b) => b.payment === "paid").reduce((s, b) => s + b.amount, 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

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
    <>
      {/* Stats */}
      <div className="dh-stats">
        {[
          { icon: "\u{1F4C5}", bg: "rgba(240,123,43,0.12)", badge: <span className="dh-badge-up">&uarr; 12%</span>, num: bookings.length, label: "Total Bookings" },
          { icon: "\u{1F4B0}", bg: "rgba(34,197,94,0.12)", badge: <span className="dh-badge-up">&uarr; 8%</span>, num: totalRevenue.toLocaleString(), label: "Revenue (Ksh)", numStyle: { fontSize: 22 } },
          { icon: "\u231B", bg: "rgba(245,158,11,0.12)", badge: <span className="dh-badge-warn">{pendingCount} new</span>, num: pendingCount, label: "Pending Approvals", numStyle: { color: "#F59E0B" } },
          { icon: "\u2705", bg: "rgba(59,130,246,0.12)", badge: <span className="dh-badge-up">{confirmedCount} active</span>, num: confirmedCount, label: "Confirmed Bookings" },
        ].map((s, i) => (
          <div key={i} className="dh-stat">
            <div className="dh-stat-top">
              <div className="dh-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              {s.badge}
            </div>
            <div className="dh-stat-num" style={s.numStyle}>{s.num}</div>
            <div className="dh-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table + Calendar */}
      <div className="dh-grid2">
        {/* Recent Bookings */}
        <div className="dh-panel">
          <div className="dh-panel-hd">
            <div>
              <div className="dh-panel-title">Recent Bookings</div>
              <div className="dh-panel-sub">Pending approvals need action</div>
            </div>
            <button className="dh-panel-link" onClick={() => onNavigate("bookings")}>View all &rarr;</button>
          </div>
          <div className="dh-table-wrap">
            <table className="dh-table">
              <thead><tr><th>Client</th><th>Room</th><th>Slot</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} onClick={() => onOpenBookingDetails(b.id)}>
                    <td><div className="dh-client-cell"><Avatar initials={b.initials} color={b.color} /><div><div className="dh-cname">{b.name}</div><div className="dh-ctype">{b.type}</div></div></div></td>
                    <td><span className="dh-room-chip">{b.roomIcon} {b.room}</span></td>
                    <td><span className="dh-slot-badge">{b.slot}</span></td>
                    <td><span className="dh-amount">{b.amount.toLocaleString()}</span></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="dh-actions">
                        {b.status === "pending" && <button className="dh-action-btn btn-approve" onClick={() => approveBooking(b.id)}>{"\u2713"}</button>}
                        {(b.status === "pending" || b.status === "draft") && <button className="dh-action-btn btn-reject" onClick={() => setRejectTargetId(b.id)}>{"\u2717"}</button>}
                        {b.status !== "pending" && b.status !== "draft" && <button className="dh-action-btn btn-view" onClick={() => onOpenBookingDetails(b.id)}>View</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="dh-panel">
          <div className="dh-panel-hd">
            <div>
              <div className="dh-panel-title">This Week</div>
              <div className="dh-panel-sub">Room availability at a glance</div>
            </div>
            <button className="dh-panel-link" onClick={() => onNavigate("calendar")}>Full view &rarr;</button>
          </div>
          <div className="dh-cal">
            {calendarDays.length === 0 || calendarSlots.length === 0 || calendarRooms.length === 0 ? (
              <div className="dh-empty" style={{ margin: "12px 0" }}>No calendar slot data available from backend</div>
            ) : (
              <>
                <div className="dh-cal-hd" style={{ gridTemplateColumns: `70px repeat(${calendarRooms.length}, 1fr)` }}>
                  <div className="dh-cal-hd-item" />
                  {calendarRooms.map((r) => <div key={r} className="dh-cal-hd-item">{r.split(" ")[0]}</div>)}
                </div>
                {calendarDays.slice(0, 2).map((day) =>
                  calendarSlots.map((slot) => (
                    <div key={`${day.isoDate} ${slot}`} className="dh-cal-row" style={{ gridTemplateColumns: `70px repeat(${calendarRooms.length}, 1fr)` }}>
                      <div className="dh-cal-time">{day.label.split(" ")[0]}<br />{slot}</div>
                      {calendarRooms.map((room) => {
                        const s = getCalSlot(day.isoDate, slot, room);
                        return (
                          <div key={room} className={`dh-cal-slot cal-${s.type}`} onClick={() => {
                            if (s.type === "booked") { addToast(`${s.name} \u2014 ${room} ${slot}`, "orange", "\u{1F4CB}"); return; }
                            if (s.type === "available") onOpenBookingFromSlot(s);
                          }}>
                            <div style={{ fontSize: 10, fontWeight: 700 }}>{s.type === "booked" ? s.name : s.type === "available" ? "Free" : "\u2014"}</div>
                            {s.type === "booked" && <div style={{ fontSize: 9, opacity: 0.7 }}>{s.status}</div>}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div className="dh-cal-legend">
                  {[["cal-booked", "Booked"], ["cal-available", "Available"]].map(([cls, lbl]) => (
                    <div key={lbl} className="dh-legend-item"><div className={`dh-legend-dot ${cls}`} style={{ border: "1px solid currentColor" }} />{lbl}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Revenue + Rooms + Alerts */}
      <div className="dh-grid3">
        <div className="dh-panel">
          <div className="dh-panel-hd"><div><div className="dh-panel-title">Weekly Revenue</div><div className="dh-panel-sub">Ksh &middot; This week</div></div></div>
          <div style={{ padding: "16px 20px 8px" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900 }}>{totalRevenue.toLocaleString()}</span>
            <span className="dh-badge-up" style={{ marginLeft: 10 }}>&uarr; 8%</span>
          </div>
          <div className="dh-bars">
            {[45, 70, 90, 55, 65, 30].map((h, i) => (
              <div key={i} className="dh-bar-grp">
                <div className="dh-bar" style={{ height: `${h}%`, background: `rgba(240,123,43,${0.2 + h / 200})` }} title={`Ksh ${h * 1000}`} />
                <div className="dh-bar-lbl">{["M", "T", "W", "T", "F", "S"][i]}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 16 }} />
        </div>

        <div className="dh-panel">
          <div className="dh-panel-hd"><div className="dh-panel-title">Room Utilisation</div></div>
          {[
            { name: "Private Office", cap: "1\u20133 pax", pct: 78, color: "#F07B2B" },
            { name: "Boardroom", cap: "1\u20136 pax", pct: 55, color: "#3B82F6" },
            { name: "Combined Space", cap: "1\u201310 pax", pct: 40, color: "#22C55E" },
          ].map((r) => (
            <div key={r.name} className="dh-room-row">
              <div className="dh-room-dot" style={{ background: r.color }} />
              <div className="dh-room-info"><div className="dh-room-name">{r.name}</div><div className="dh-room-cap">{r.cap}</div></div>
              <div className="dh-bar-bg"><div className="dh-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
              <div className="dh-room-pct">{r.pct}%</div>
            </div>
          ))}
          <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Peak Hours</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "#F07B2B", borderRadius: 4, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>10am\u20131pm</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Most booked</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>2pm\u20135pm</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>2nd busiest</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dh-panel">
          <div className="dh-panel-hd">
            <div className="dh-panel-title">{"\u{1F514}"} Alerts</div>
            <button className="dh-panel-link" onClick={() => addToast("All alerts cleared", "green", "\u2713")}>Clear all</button>
          </div>
          {pendingCount > 0 && (
            <div className="dh-alert-item">
              <div className="dh-alert-icon" style={{ background: "rgba(245,158,11,0.12)" }}>{"\u231B"}</div>
              <div><div className="dh-alert-title">{pendingCount} Pending Approvals</div><div className="dh-alert-desc">Bookings awaiting your review</div></div>
              <div className="dh-alert-time">Now</div>
            </div>
          )}
          {bookings.filter((b) => b.payment === "pending").map((b) => (
            <div key={b.id} className="dh-alert-item">
              <div className="dh-alert-icon" style={{ background: "rgba(240,123,43,0.12)" }}>{"\u{1F4B3}"}</div>
              <div><div className="dh-alert-title">Payment Pending</div><div className="dh-alert-desc">{b.name} — Ksh {b.amount.toLocaleString()}</div></div>
              <div className="dh-alert-time">Today</div>
            </div>
          ))}
        </div>
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
    </>
  );
}