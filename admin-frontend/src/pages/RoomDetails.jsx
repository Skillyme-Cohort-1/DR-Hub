import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";
import { extractSlots, getRoomCost } from "../utils/helpers";

export default function RoomDetails({ room, token, onBack }) {
  const addToast = useToast();
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotForm, setSlotForm] = useState({ title: "", slotDate: "" });
  const [slotSubmitting, setSlotSubmitting] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!room?.id) return;
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const data = await apiFetch(`/api/slots?roomId=${encodeURIComponent(room.id)}`, { token });
      const all = extractSlots(data);
      setSlots(all.filter((s) => { const rid = s.roomId || s.room?.id; return !rid || String(rid) === String(room.id); }));
    } catch (err) {
      setSlots([]);
      setSlotsError(err.message || "Could not reach the slots API.");
    } finally {
      setSlotsLoading(false);
    }
  }, [room?.id, token]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const createSlot = async () => {
    if (!room?.id) { setSlotsError("No room selected."); return; }
    if (!slotForm.title.trim() || !slotForm.slotDate) { setSlotsError("Slot title and slot date are required."); return; }
    setSlotSubmitting(true);
    setSlotsError("");
    try {
      const data = await apiFetch("/api/slots", { token, method: "POST", body: { title: slotForm.title.trim(), slotDate: slotForm.slotDate, roomId: room.id } });
      addToast(data.message || "Booking slot created.", "green", "\u2713");
      setSlotForm({ title: "", slotDate: "" });
      fetchSlots();
    } catch (err) {
      setSlotsError(err.message || "Could not reach the slots API.");
    } finally {
      setSlotSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Room info */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div><div className="dh-panel-title">{room.name || "Room"}</div><div className="dh-panel-sub">Room information and booking slots</div></div>
          <button className="dh-btn-primary" onClick={onBack}>&larr; Back to Rooms</button>
        </div>
        <div className="dh-table-wrap">
          <table className="dh-table">
            <thead><tr><th>Room</th><th>Capacity</th><th>Cost</th><th>Status</th><th>Description</th></tr></thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>{room.name || "-"}</td>
                <td>{room.capacity || "-"}</td>
                <td>{getRoomCost(room)}</td>
                <td><span className={`dh-status ${room.isActive ? "s-confirmed" : "s-rejected"}`}>{room.isActive ? "Active" : "Inactive"}</span></td>
                <td>{room.description || "No description"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create slot */}
      <div className="dh-panel">
        <div className="dh-panel-hd"><div><div className="dh-panel-title">Create Booking Slot</div><div className="dh-panel-sub">Add a named slot for a selected date</div></div></div>
        <div className="dh-modal-body">
          <div className="dh-form-row">
            <div className="dh-form-group"><label>Slot Title *</label><input type="text" placeholder="e.g. 9am - 11am" value={slotForm.title} onChange={(e) => setSlotForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="dh-form-group"><label>Slot Date *</label><input type="date" value={slotForm.slotDate} onChange={(e) => setSlotForm((p) => ({ ...p, slotDate: e.target.value }))} /></div>
          </div>
          {slotsError && <div style={{ color: "#ffb4b4", fontSize: 12 }}>{slotsError}</div>}
        </div>
        <div className="dh-modal-ft"><button className="dh-btn-primary" onClick={createSlot} disabled={slotSubmitting}>{slotSubmitting ? "Saving..." : "Create Slot"}</button></div>
      </div>

      {/* Slot list */}
      <div className="dh-panel">
        <div className="dh-panel-hd"><div className="dh-panel-title">Room Booking Slots</div><button className="dh-btn-primary" onClick={fetchSlots}>Refresh Slots</button></div>
        <div className="dh-table-wrap">
          <table className="dh-table">
            <thead><tr><th>Title</th><th>Slot Date</th><th>Status</th></tr></thead>
            <tbody>
              {slotsLoading && <tr><td colSpan={3}><div className="dh-empty">Loading slots...</div></td></tr>}
              {!slotsLoading && slots.length === 0 && <tr><td colSpan={3}><div className="dh-empty">No slots created for this room yet.</div></td></tr>}
              {!slotsLoading && slots.map((s) => (
                <tr key={s.id || `${s.title}-${s.slotDate}`}>
                  <td>{s.title || "-"}</td>
                  <td>{s.slotDate ? new Date(s.slotDate).toLocaleDateString() : "-"}</td>
                  <td>{s.booked ? "Booked" : "Available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}