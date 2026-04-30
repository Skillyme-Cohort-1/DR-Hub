import { useState } from "react";
import Avatar from "../components/Avatar";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";
import { getInitials } from "../utils/helpers";

export default function LeadsPage({ leads, setLeads, leadsLoading, leadsError, token }) {
  const addToast = useToast();
  const [filter, setFilter] = useState("all");
  const [noteInputs, setNoteInputs] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", stage: "new", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const filtered = leads.filter((l) => filter === "all" || l.stage === filter);

  const advanceLead = (id) => {
    setLeads((p) => p.map((l) => {
      if (l.id !== id) return l;
      const next = l.stage === "new" ? "follow-up" : "converted";
      addToast(`${l.name} moved to ${next}`, "orange", "\u2192");
      return { ...l, stage: next };
    }));
  };

  const saveNote = (id) => {
    setLeads((p) => p.map((l) => l.id === id ? { ...l, note: noteInputs[id] || l.note } : l));
    addToast("Note saved", "green", "\u{1F4AC}");
  };

  const removeLead = (lead) => {
    if (!confirm(`Remove ${lead.name} from leads?`)) return;
    setLeads((p) => p.filter((l) => l.id !== lead.id));
    addToast("Lead removed", "orange", "\u{1F5D1}");
  };

  const submitLead = async (e) => {
    e.preventDefault();
    if (!newLead.name.trim()) { addToast("Lead name is required", "red", "!"); return; }
    if (!token) { addToast("Authentication token is missing", "red", "!"); return; }
    setSubmitting(true);
    try {
      const data = await apiFetch("/api/contact", { token, method: "POST", body: { fullName: newLead.name.trim(), email: newLead.email.trim(), phoneNumber: newLead.phone.trim(), message: newLead.notes.trim() } });
      const created = data?.contact || data?.lead || data?.data || {};
      const leadName = created.fullName || newLead.name.trim();
      setLeads((prev) => [{ id: created.id || Date.now(), name: leadName, initials: getInitials(leadName), color: "#" + Math.floor(Math.random() * 16777215).toString(16), stage: newLead.stage, phone: (created.phoneNumber || newLead.phone).trim(), email: created.email || newLead.email.trim(), note: created.message || newLead.notes.trim(), createdAt: created.createdAt || new Date().toISOString() }, ...prev]);
      addToast(data.message || `${leadName} added to pipeline!`, "green", "\u2713");
      setShowCreate(false);
      setNewLead({ name: "", phone: "", email: "", stage: "new", notes: "" });
    } catch (err) {
      addToast(err.message || "Could not reach the leads API.", "red", "!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div><div className="dh-panel-title">Lead Pipeline</div><div className="dh-panel-sub">Track and manage potential clients</div></div>
        <button className="dh-btn-primary" onClick={() => setShowCreate(true)}>+ Add Lead</button>
      </div>
      <div className="dh-filter-bar">
        {["all", "new", "follow-up", "converted"].map((stage) => (
          <button key={stage} className={`dh-filter-btn ${filter === stage ? "active-filter" : ""}`} onClick={() => setFilter(stage)}>
            {stage === "all" ? "All" : stage.charAt(0).toUpperCase() + stage.slice(1)}
            <span style={{ marginLeft: 5, opacity: 0.7 }}>({stage === "all" ? leads.length : leads.filter((l) => l.stage === stage).length})</span>
          </button>
        ))}
      </div>
      <div className="dh-table-wrap">
        <table className="dh-table">
          <thead><tr><th>Name</th><th>Contact</th><th>Stage</th><th>Notes</th><th>Added</th><th>Actions</th></tr></thead>
          <tbody>
            {leadsLoading && <tr><td colSpan={6}><div className="dh-empty">Loading leads...</div></td></tr>}
            {!leadsLoading && leadsError && <tr><td colSpan={6}><div className="dh-empty">{leadsError}</div></td></tr>}
            {!leadsLoading && !leadsError && filtered.map((lead) => (
              <tr key={lead.id}>
                <td><div className="dh-client-cell"><Avatar initials={lead.initials} color={lead.color} size={34} /><div><div className="dh-cname">{lead.name}</div></div></div></td>
                <td><div>{lead.phone || "\u2014"}</div><div style={{ fontSize: 11, color: "#888" }}>{lead.email || "\u2014"}</div></td>
                <td><span className={`dh-lead-stage stage-${lead.stage}`}>{lead.stage === "follow-up" ? "Follow Up" : lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}</span></td>
                <td><input className="dh-note-input" placeholder="Add note..." defaultValue={lead.note} style={{ width: 180 }} onChange={(e) => setNoteInputs((p) => ({ ...p, [lead.id]: e.target.value }))} onBlur={() => saveNote(lead.id)} /></td>
                <td style={{ color: "#888", fontSize: 11 }}>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Just now"}</td>
                <td>
                  <div className="dh-actions">
                    {lead.stage !== "converted" && <button className="dh-action-btn btn-approve" onClick={() => advanceLead(lead.id)}>{"\u2192"} {lead.stage === "new" ? "Follow Up" : "Convert"}</button>}
                    <button className="dh-action-btn btn-view" onClick={() => setViewLead(lead)}>{"\u{1F441}"} View</button>
                    <button className="dh-action-btn btn-reject" onClick={() => removeLead(lead)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
            {!leadsLoading && !leadsError && filtered.length === 0 && <tr><td colSpan={6}><div className="dh-empty">No leads found. Click "+ Add Lead" to get started.</div></td></tr>}
          </tbody>
        </table>
      </div>

      {/* View lead modal */}
      {viewLead && (
        <Modal title="Lead Details" onClose={() => setViewLead(null)} footer={<button className="dh-btn-cancel" onClick={() => setViewLead(null)}>Close</button>}>
          {[["Full Name", viewLead.name], ["Email Address", viewLead.email], ["Phone Number", viewLead.phone], ["Lead Stage", viewLead.stage === "follow-up" ? "Follow Up" : String(viewLead.stage || "new").charAt(0).toUpperCase() + String(viewLead.stage || "new").slice(1)]].map(([l, v]) => (
            <div key={l} className="dh-form-group"><label>{l}</label><div>{v || "\u2014"}</div></div>
          ))}
          <div className="dh-form-group"><label>Message / Notes</label><div style={{ whiteSpace: "pre-wrap" }}>{viewLead.note || "\u2014"}</div></div>
          <div className="dh-form-group"><label>Created</label><div>{viewLead.createdAt ? new Date(viewLead.createdAt).toLocaleString() : "\u2014"}</div></div>
          <div className="dh-form-group"><label>Lead ID</label><div style={{ wordBreak: "break-all", color: "#888", fontSize: 12 }}>{String(viewLead.id || "\u2014")}</div></div>
        </Modal>
      )}

      {/* Create lead modal */}
      {showCreate && (
        <Modal title="Capture Lead" onClose={() => setShowCreate(false)} footer={
          <>
            <button type="button" className="dh-btn-cancel" onClick={() => { setShowCreate(false); setNewLead({ name: "", phone: "", email: "", stage: "new", notes: "" }); }}>Cancel</button>
            <button type="submit" form="lead-form" className="dh-btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Lead"}</button>
          </>
        }>
          <form id="lead-form" onSubmit={submitLead} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 12, color: "#888" }}>Save a new contact message into the leads pipeline.</div>
            <div className="dh-form-row">
              <div className="dh-form-group"><label>Full Name *</label><input type="text" placeholder="John Doe" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} required /></div>
              <div className="dh-form-group"><label>Phone Number</label><input type="tel" placeholder="07454491093" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} /></div>
            </div>
            <div className="dh-form-group"><label>Email Address</label><input type="email" placeholder="johndoe@gmail.com" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} /></div>
            <div className="dh-form-group"><label>Message</label><textarea rows="3" placeholder="Testing the API" value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} style={{ resize: "vertical" }} /></div>
          </form>
        </Modal>
      )}
    </div>
  );
}