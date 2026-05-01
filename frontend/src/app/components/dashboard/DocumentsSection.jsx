import { Download, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate } from "../../lib/formatters";

const fileInputClass =
  "w-full rounded-lg border border-border bg-input-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#E87722]/50";

export function DocumentsSection({
  documents, documentsLoading, documentsError,
  documentName, setDocumentName,
  documentFile, setDocumentFile,
  uploadingDocument, onUpload, onDelete, onDownload, onView,
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Documents</h2>
        <p className="mt-1 text-sm text-foreground/50">Manage your credentials and verification documents</p>
      </div>

      {/* Upload form */}
      <form
        onSubmit={onUpload}
        className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1.3fr_1fr_auto]"
      >
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Document name (optional)"
          className={fileInputClass}
        />
        <input
          type="file"
          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
          className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-[#E87722] file:px-3 file:py-1.5 file:text-white"
        />
        <Button
          type="submit"
          disabled={uploadingDocument}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E87722] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d46a1a] disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploadingDocument ? "Uploading..." : "Upload"}
        </Button>
      </form>

      {documentsError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {documentsError}
        </div>
      ) : null}

      {documentsLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-foreground/50">
          Loading documents...
        </div>
      ) : null}

      {!documentsLoading && documents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-foreground/50">
          No documents uploaded yet.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-[#E87722]/30 hover:shadow-md hover:shadow-[#E87722]/5"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{doc.documentName}</p>
                  <p className="mt-0.5 text-xs text-foreground/50">Uploaded: {formatBookingDate(doc.createdAt)}</p>
                </div>
              </div>
              <StatusBadge status={doc.status || "PENDING"} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
              >
                <Download className="h-3 w-3" /> Download
              </button>
              <button
                type="button"
                onClick={() => onView(doc)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
              >
                View
              </button>
              <button
                type="button"
                onClick={() => onDelete(doc.id)}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}