import { useState } from "react";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";

const EMPTY_FORM = { name: "", email: "", password: "", phoneNumber: "", gender: "", address: "", city: "", country: "", occupation: "", status: "INACTIVE", role: "MEMBER" };

export default function UsersPage({ users, usersLoading, usersError, token, onReload }) {
  const addToast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => { setEditingId(null); setFormError(""); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (u) => {
    setEditingId(u.id);
    setFormError("");
    setForm({ name: u.name || "", email: u.email || "", password: "", phoneNumber: u.phoneNumber || "", gender: u.gender || "", address: u.address || "", city: u.city || "", country: u.country || "", occupation: u.occupation || "", status: u.status || "ACTIVE", role: u.role || "MEMBER" });
    setShowModal(true);
  };

  const submitForm = async () => {
    if (!token) { setFormError("Authentication token is missing."); return; }
    if (!form.name.trim() || !form.email.trim()) { setFormError("Name and email are required."); return; }
    if (!editingId && form.password.length < 8) { setFormError("Password must be at least 8 characters for new users."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      if (!editingId) {
        await apiFetch("/api/users/register", { method: "POST", body: { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role } });
        addToast("User created successfully", "green", "\u2713");
      } else {
        await apiFetch(`/api/users/${editingId}`, { token, method: "PATCH", body: { name: form.name.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber || null, gender: form.gender || null, address: form.address || null, city: form.city || null, country: form.country || null, occupation: form.occupation || null, status: form.status, role: form.role } });
        addToast("User updated successfully", "green", "\u2713");
      }
      setShowModal(false);
      onReload();
    } catch (err) {
      setFormError(err.message || "Could not reach the users API.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div>
          <div className="dh-panel-title">System Users</div>
          <div className="dh-panel-sub">{usersLoading ? "Loading users..." : `${users.length} users`}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="dh-btn-primary" onClick={onReload}>Refresh</button>
          <button className="dh-btn-primary" onClick={openCreate}>+ New User</button>
        </div>
      </div>
      {usersError && <div style={{ padding: "12px 20px", color: "#ffb4b4" }}>{usersError}</div>}
      <div className="dh-table-wrap">
        <table className="dh-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Occupation</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {!usersLoading && users.length === 0 && !usersError && <tr><td colSpan={8}><div className="dh-empty">No users found</div></td></tr>}
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name || "-"}</td>
                <td>{u.email || "-"}</td>
                <td>{u.phoneNumber || "-"}</td>
                <td>{u.occupation || "-"}</td>
                <td>{u.role || "-"}</td>
                <td><span className={`dh-status ${String(u.status || "").toLowerCase() === "active" ? "s-confirmed" : "s-pending"}`}>{u.status || "UNKNOWN"}</span></td>
                <td style={{ color: "#888", fontSize: 11 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                <td><button className="dh-action-btn btn-view" onClick={() => openEdit(u)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit User" : "Add User"} onClose={() => setShowModal(false)} footer={
          <>
            <button className="dh-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="dh-btn-primary" onClick={submitForm} disabled={submitting}>{submitting ? "Saving..." : editingId ? "Save Changes" : "Create User"}</button>
          </>
        }>
          <div className="dh-form-row">
            <div className="dh-form-group"><label>Name *</label><input value={form.name} onChange={set("name")} placeholder="Full name" /></div>
            <div className="dh-form-group"><label>Email *</label><input type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" /></div>
          </div>
          {!editingId && (
            <>
              <div className="dh-form-group"><label>Password *</label><input type="password" minLength={8} value={form.password} onChange={set("password")} placeholder="At least 8 characters" /></div>
              <div className="dh-form-group"><label>Role</label><select value={form.role} onChange={set("role")}><option value="MEMBER">MEMBER</option><option value="ADMIN">ADMIN</option></select></div>
            </>
          )}
          {editingId && (
            <>
              <div className="dh-form-row">
                <div className="dh-form-group"><label>Phone Number</label><input value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+254..." /></div>
                <div className="dh-form-group"><label>Gender</label><select value={form.gender} onChange={set("gender")}><option value="">Not set</option><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option><option value="OTHER">OTHER</option></select></div>
              </div>
              <div className="dh-form-row">
                <div className="dh-form-group"><label>City</label><input value={form.city} onChange={set("city")} placeholder="City" /></div>
                <div className="dh-form-group"><label>Country</label><input value={form.country} onChange={set("country")} placeholder="Country" /></div>
              </div>
              <div className="dh-form-group"><label>Occupation</label><input value={form.occupation} onChange={set("occupation")} placeholder="Occupation" /></div>
              <div className="dh-form-group"><label>Address</label><input value={form.address} onChange={set("address")} placeholder="Address" /></div>
              <div className="dh-form-row">
                <div className="dh-form-group"><label>Status</label><select value={form.status} onChange={set("status")}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></div>
                <div className="dh-form-group"><label>Role</label><select value={form.role} onChange={set("role")}><option value="MEMBER">MEMBER</option><option value="ADMIN">ADMIN</option></select></div>
              </div>
            </>
          )}
          {formError && <div style={{ color: "#ffb4b4", fontSize: 12 }}>{formError}</div>}
        </Modal>
      )}
    </div>
  );
}