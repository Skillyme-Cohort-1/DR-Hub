import { formatDate, formatStatus } from "../../lib/formatters";

export function CheckinsSection({ checkins, loading, error }) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Check-in History</h2>
        <p className="mt-1 text-sm text-slate-400">Track your arrival records and access history</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Booking ID</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                    Loading check-ins...
                  </td>
                </tr>
              ) : null}
              {!loading && error ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : null}
              {!loading && !error && checkins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                    No check-ins yet.
                  </td>
                </tr>
              ) : null}
              {!loading && !error && checkins.map((checkin) => (
                <tr key={`${checkin.bookingId}-${checkin.time}`} className="border-b border-slate-700/50 transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-4 text-sm font-mono text-slate-400">{checkin.booking?.reference}</td>
                  <td className="px-4 py-4 text-sm text-slate-400">{formatDate(checkin.createdAt)}</td>
                  <td className="px-4 py-4 text-sm text-slate-400">{formatStatus(checkin.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}