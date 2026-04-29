import { Download, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate } from "../../lib/formatters";

export function DocumentsSection({
  documents,
  documentsLoading,
  documentsError,
  documentName,
  setDocumentName,
  documentFile,
  setDocumentFile,
  uploadingDocument,
  onUpload,
  onDelete,
  onDownload,
  onView,
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Documents</h2>
          <p className="mt-1 text-sm text-slate-400">Manage your credentials and verification documents</p>
        </div>
      </div>

      <form
        onSubmit={onUpload}
        className="grid gap-3 rounded-xl border border-slate-700/50 bg-slate-800/80 p-4 shadow-sm md:grid-cols-[1.3fr_1fr_auto]"
      >
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Document name (optional)"
          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-[#E87722]/50 focus:bg-slate-700"
        />
        <input
          type="file"
          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-[#E87722] file:px-3 file:py-1.5 file:text-white"
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
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/80 p-6 text-sm text-slate-400 shadow-sm">Loading documents...</div>
      ) : null}

      {!documentsLoading && documents.length === 0 ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/80 p-6 text-sm text-slate-400 shadow-sm">
          No documents uploaded yet.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((documentItem) => (
          <div key={documentItem.id} className="group overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/80 p-5 shadow-sm transition-all hover:border-[#E87722]/30 hover:shadow-md hover:shadow-[#E87722]/10">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">{documentItem.documentName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Uploaded: {formatBookingDate(documentItem.createdAt)}</p>
                </div>
              </div>
              <StatusBadge status={documentItem.status || "PENDING"} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onDownload(documentItem)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700/50 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600/50"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
              <button
                type="button"
                onClick={() => onView(documentItem)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700/50 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600/50"
              >
                View
              </button>
              <button
                type="button"
                onClick={() => onDelete(documentItem.id)}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}