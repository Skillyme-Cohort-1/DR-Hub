import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { getRoomCost } from "../utils/helpers";

const EMPTY_ROOM = { name: "", capacity: "", cost: "", description: "" };

export default function RoomsPage({ rooms, roomsLoading, fetchRooms, createRoom, updateRoom, deleteRoom, token, onOpenRoomDetails }) {
  const addToast = useToast();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ROOM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rooms.length === 0) fetchRooms();
  }, []);

  const openCreate = () => { setEditingId(null); setFormError(""); setForm(EMPTY_ROOM); setShowModal(true); };
  const openEdit = (room) => {
    setEditingId(room.id);
    setFormError("");
    setForm({ name: room.name, capacity: room.capacity, cost: room.cost ?? room.price ?? room.pricePerDay ?? room.pricePerHour ?? room.amount ?? "", description: room.description || "" });
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.capacity || form.cost === "") { setFormError("Room name, capacity, and cost are required."); return; }
    setFormError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await updateRoom(editingId, form);
        addToast("Room updated successfully", "green", "\u2713");
      } else {
        await createRoom(form);
        addToast("Room created successfully", "green", "\u2713");
      }
      setShowModal(false);
      setForm(EMPTY_ROOM);
    } catch (err) {
      setFormError(err.message || "Error saving room.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteRoom(id);
      addToast("Room deleted", "green", "\u2713");
    } catch (err) {
      addToast(err.message || "Error deleting room", "red", "\u2717");
    }
  };

  const filtered = rooms.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return String(r.name || "").toLowerCase().includes(q) || String(r.description || "").toLowerCase().includes(q);
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div><div className="dh-panel-title">Room Management</div><div className="dh-panel-sub">Manage office spaces and meeting rooms</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="dh-btn-primary" onClick={openCreate}>+ Add Room</button>
          <button className="dh-btn-primary" onClick={fetchRooms}>{"\u{1F504}"} Refresh</button>
        </div>
      </div>
      <div style={{ padding: "14px 20px 0" }}><input className="dh-search" placeholder="Search room by name or description..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="dh-table-wrap">
        <table className="dh-table">
          <thead><tr><th>Room</th><th>Capacity</th><th>Cost</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {roomsLoading && <tr><td colSpan={6}><div className="dh-empty">Loading rooms...</div></td></tr>}
            {!roomsLoading && filtered.length === 0 && <tr><td colSpan={6}><div className="dh-empty">No rooms found.</div></td></tr>}
            {!roomsLoading && filtered.map((room) => (
              <tr key={room.id}>
                <td style={{ fontWeight: 600 }}>{room.name || "-"}</td>
                <td>{room.capacity || "-"}</td>
                <td>{getRoomCost(room)}</td>
                <td>{room.description || "No description"}</td>
                <td><span className={`dh-status ${room.isActive ? "s-confirmed" : "s-rejected"}`}>{room.isActive ? "Active" : "Inactive"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="dh-action-btn btn-view" onClick={() => onOpenRoomDetails(room)}>Details</button>
                    <button className="dh-action-btn btn-view" onClick={() => openEdit(room)}>Edit</button>
                    <button className="dh-action-btn btn-reject" onClick={() => handleDelete(room.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Room" : "Add New Room"} onClose={() => setShowModal(false)} footer={
          <>
            <button type="button" className="dh-btn-cancel" onClick={() => { setShowModal(false); setFormError(""); }}>Cancel</button>
            <button type="submit" form="room-form" className="dh-btn-primary" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Save Changes" : "Create Room"}</button>
          </>
        }>
          <form id="room-form" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="dh-form-group"><label>Room Name *</label><input type="text" placeholder="e.g. Private Office, Boardroom" value={form.name} onChange={set("name")} required /></div>
            <div className="dh-form-group"><label>Capacity *</label><input type="number" min="1" placeholder="Number of people" value={form.capacity} onChange={set("capacity")} required /></div>
            <div className="dh-form-group"><label>Cost (Ksh) *</label><input type="number" min="0" step="0.01" placeholder="e.g. 6000" value={form.cost} onChange={set("cost")} required /></div>
            <div className="dh-form-group"><label>Description</label><textarea placeholder="Brief description of the room..." rows={3} value={form.description} onChange={set("description")} /></div>
            {formError && <div style={{ color: "#ffb4b4", fontSize: 12 }}>{formError}</div>}
          </form>
        </Modal>
      )}
    </div>
  );
}