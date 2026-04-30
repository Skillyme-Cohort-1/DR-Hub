import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../config/api";

export default function AttendancesPage({ attendances, loading, token, refetch }) {
  const addToast = useToast();
  const [search, setSearch] = useState("");
  const [checkingOut, setCheckingOut] = useState(null);

  const filtered = attendances.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return String(a.user?.name || "").toLowerCase().includes(q) || String(a.booking?.reference || "").toLowerCase().includes(q);
  });

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div>
          <div className="dh-panel-title">Check-Ins</div>
          <div className="dh-panel-sub">Manage check-in operations for rooms</div>
        </div>
      </div>
      <div style={{ padding: "14px 20px 0" }}>
        <input className="dh-search" placeholder="Search by name or booking reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="dh-table-wrap">
        <table className="dh-table">
          <thead><tr><th>Name</th><th>Booking ID</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={4}><div className="dh-empty">Loading attendances...</div></td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={4}><div className="dh-empty">No attendances found.</div></td></tr>}
            {!loading && filtered.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.user?.name || "-"}</td>
                <td>{a.booking?.reference || "-"}</td>
                <td>
                  <span className={`dh-status ${String(a.status || "").toLowerCase() === "checked in" ? "s-confirmed" : "s-pending"}`}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    {String(a.status || "").toLowerCase() === "checked in" && (
                      <button
                        className="dh-action-btn btn-reject"
                        disabled={checkingOut === a.id}
                        onClick={async () => {
                          setCheckingOut(a.id);
                          try {
                            await apiFetch("/api/attendances/check-out", {
                              token,
                              method: "POST",
                              body: { bookingId: a.booking?.id || a.bookingId },
                            });
                            addToast("Checked out successfully", "green", "\u2713");
                            refetch();
                          } catch (err) {
                            addToast(err.message || "Failed to check out", "red", "\u2717");
                          } finally {
                            setCheckingOut(null);
                          }
                        }}
                      >
                        {checkingOut === a.id ? "Checking out..." : "Check-Out"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}