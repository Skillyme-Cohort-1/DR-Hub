import { CheckCircle } from "lucide-react";
import { formatDate, formatStatus } from "../../lib/formatters";

const thClass = "px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60";
const tdClass = "px-4 py-4 text-sm text-foreground/70";

export function CheckinsSection({ checkins, loading, error }) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Check-in History</h2>
        <p className="mt-1 text-sm text-foreground/50">Track your arrival records and access history</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={thClass}>Booking ID</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-foreground/50">Loading check-ins...</td></tr>
              ) : null}
              {!loading && error ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-red-400">{error}</td></tr>
              ) : null}
              {!loading && !error && checkins.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-foreground/50">No check-ins yet.</td></tr>
              ) : null}
              {!loading && !error && checkins.map((checkin) => (
                <tr key={`${checkin.bookingId}-${checkin.time}`} className="border-b border-border/50 transition-colors hover:bg-muted/20">
                  <td className={`${tdClass} font-mono`}>{checkin.booking?.reference}</td>
                  <td className={tdClass}>{formatDate(checkin.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E87722]/10 px-3 py-1 text-xs font-medium text-[#E87722]">
                      <CheckCircle className="h-3 w-3" /> {formatStatus(checkin.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}