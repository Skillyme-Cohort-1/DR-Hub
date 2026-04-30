import { useState, useEffect } from "react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { apiFetch, API_BASE_URL } from "../config/api";
import { mapDocumentStatus, getDocumentPreviewUrl } from "../utils/helpers";

export default function ClientDetails({ client, bookings, token, onBack }) {
  const addToast = useToast();
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState("");
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const clientBookings = client?.id
    ? bookings.filter((b) => String(b.userId || "") === String(client.id))
    : [];

  const loadDocuments = async (clientId) => {
    if (!token || !clientId) return;
    setDocsLoading(true);
    setDocsError("");
    try {
      const data = await apiFetch(`/api/documents?userId=${encodeURIComponent(clientId)}`, { token });
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err) {
      setDocsError(err.message || "Failed to fetch documents.");
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (client?.id) loadDocuments(client.id);
  }, [client?.id, token]);

  const submitDocument = async () => {
    if (!client || !token) { setDocError("Client or auth session missing."); return; }
    if (!docName.trim()) { setDocError("Document name is required."); return; }
    if (!docFile) { setDocError("Please choose a file."); return; }
    setDocSubmitting(true);
    setDocError("");
    try {
      const formData = new FormData();
      formData.append("documentName", docName.trim());
      formData.append("userId", client.id);
      formData.append("status", "PENDING");
      formData.append("document", docFile);
      await apiFetch("/api/documents", { token, method: "POST", body: formData });
      addToast("Document uploaded", "green", "\u{1F4C4}");
      setShowUpload(false);
      await loadDocuments(client.id);
    } catch (err) {
      setDocError(err.message || "Could not upload document.");
    } finally {
      setDocSubmitting(false);
    }
  };

  const updateDocStatus = async (docId, status) => {
    try {
      await apiFetch(`/api/documents/${docId}`, { token, method: "PATCH", body: { status } });
      addToast(`Document ${status === "APPROVED" ? "approved" : "declined"}`, status === "APPROVED" ? "green" : "red", status === "APPROVED" ? "\u2713" : "\u2717");
      await loadDocuments(client.id);
    } catch (err) {
      addToast(err.message || "Could not update document", "red", "\u2717");
    }
  };

  if (!client) return <div className="dh-empty">Select a client from the Clients tab.</div>;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Profile */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div><div className="dh-panel-title">Client Details</div><div className="dh-panel-sub">Profile and account information</div></div>
          <button className="dh-btn-primary" onClick={onBack}>Back to Clients</button>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {[["Name", client.name], ["Email", client.email], ["Phone", client.phoneNumber], ["Occupation", client.occupation], ["Gender", client.gender], ["Status", client.status], ["Address", client.address], ["City", client.city], ["Country", client.country]].map(([label, val]) => (
            <div key={label}><strong>{label}:</strong> {val || "-"}</div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div className="dh-panel-title">Documents</div>
          <button className="dh-btn-primary" onClick={() => { setDocName(""); setDocFile(null); setDocError(""); setShowUpload(true); }}>Upload Document</button>
        </div>
        <div className="dh-table-wrap">
          <table className="dh-table">
            <thead><tr><th>#</th><th>Document</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {docsLoading && <tr><td colSpan={4}><div className="dh-empty">Loading documents...</div></td></tr>}
              {!docsLoading && docsError && <tr><td colSpan={4}><div className="dh-empty">{docsError}</div></td></tr>}
              {!docsLoading && !docsError && documents.length === 0 && <tr><td colSpan={4}><div className="dh-empty">No documents found</div></td></tr>}
              {!docsLoading && !docsError && documents.map((doc, i) => (
                <tr key={doc.id}>
                  <td style={{ color: "#888", fontSize: 11 }}>{i + 1}</td>
                  <td>{doc.documentName}</td>
                  <td style={{ color: "#888", fontSize: 11 }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="dh-actions">
                      <button className="dh-action-btn btn-view" onClick={() => setPreview(doc)}>Preview</button>
                      {String(doc.status).toUpperCase() !== "APPROVED" && (
                        <>
                          <button className="dh-action-btn btn-approve" onClick={() => updateDocStatus(doc.id, "APPROVED")}>Approve</button>
                          <button className="dh-action-btn btn-reject" onClick={() => updateDocStatus(doc.id, "DECLINED")}>Decline</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings */}
      <div className="dh-panel">
        <div className="dh-panel-hd"><div className="dh-panel-title">Bookings</div></div>
        <div className="dh-table-wrap">
          <table className="dh-table">
            <thead><tr><th>ID</th><th>Room</th><th>Date</th><th>Slot</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {clientBookings.length === 0 && <tr><td colSpan={6}><div className="dh-empty">No bookings found for this client</div></td></tr>}
              {clientBookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ color: "#888", fontSize: 11 }}>{b.id}</td>
                  <td>{b.room}</td>
                  <td style={{ color: "#888", fontSize: 11 }}>{b.date || "-"}</td>
                  <td>{b.slot || "-"}</td>
                  <td><span className="dh-amount">{Number(b.amount || 0).toLocaleString()}</span></td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <Modal title="Upload Document" onClose={() => setShowUpload(false)} footer={
          <>
            <button className="dh-btn-cancel" onClick={() => setShowUpload(false)}>Cancel</button>
            <button className="dh-btn-primary" onClick={submitDocument} disabled={docSubmitting}>{docSubmitting ? "Uploading..." : "Upload"}</button>
          </>
        }>
          <div className="dh-form-group"><label>Document Name *</label><input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. National ID Copy" /></div>
          <div className="dh-form-group"><label>File *</label><input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} /></div>
          {docError && <div style={{ color: "#ffb4b4", fontSize: 12 }}>{docError}</div>}
        </Modal>
      )}

      {/* Preview modal */}
      {preview && (() => {
        const url = getDocumentPreviewUrl(preview, API_BASE_URL);
        return (
          <Modal title="Document Preview" onClose={() => setPreview(null)} maxWidth="min(920px, 96vw)" footer={
            <button className="dh-btn-cancel" onClick={() => setPreview(null)}>Close</button>
          }>
            <div><strong>Name:</strong> {preview.documentName}</div>
            <div><strong>Status:</strong> {mapDocumentStatus(preview.status)}</div>
            <div><strong>Uploaded:</strong> {preview.createdAt ? new Date(preview.createdAt).toLocaleString() : "-"}</div>
            {url ? (
              <>
                <p style={{ margin: "8px 0 0" }}><a href={url} target="_blank" rel="noopener noreferrer" className="dh-panel-link">Open in new tab</a></p>
                <iframe title={preview.documentName} src={url} width="100%" height={600} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, marginTop: 12, background: "#111" }} />
              </>
            ) : (
              <div style={{ color: "#888", fontSize: 12 }}>No preview URL is available for this document.</div>
            )}
          </Modal>
        );
      })()}
    </div>
  );
}