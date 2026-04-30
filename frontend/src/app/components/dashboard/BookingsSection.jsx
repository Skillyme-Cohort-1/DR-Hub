import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate, formatCurrency, formatStatus } from "../../lib/formatters";

export function BookingsSection({ bookings, loading, error, onPayDeposit }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Your Bookings</h2>
          <p className="mt-1 text-sm text-slate-400">Manage and track your workspace reservations</p>
        </div>
        <Link to="/booking">
          <Button className="inline-flex items-center gap-2 rounded-lg bg-[#E87722] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E87722]/20 transition-all hover:bg-[#d46a1a] hover:shadow-[#E87722]/30">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Booking ID</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Room</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : null}
              {!loading && error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : null}
              {!loading && !error && bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                    No bookings yet.
                  </td>
                </tr>
              ) : null}
              {!loading && !error && bookings.map((booking) => (
                <tr key={booking.id} className="group border-b border-slate-700/50 transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-4 text-sm font-mono text-slate-400">{booking.reference || booking.id}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-slate-200">{booking.room?.name || "N/A"}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">{formatBookingDate(booking.date)}</td>
                  <td className="px-4 py-4"><StatusBadge status={formatStatus(booking.status)} /></td>
                  <td className="px-4 py-4 text-sm font-semibold text-white">{formatCurrency(booking.amountCharged)}</td>
                  <td className="px-4 py-4 text-right">
                    {booking.status === "DRAFT" ? (
                      <button
                        type="button"
                        onClick={() => onPayDeposit(booking)}
                        className="text-sm font-medium text-[#E87722] transition-colors hover:text-[#f39c4d]"
                      >
                        Pay Deposit
                      </button>
                    ) : booking.status === "PENDING" || booking.status === "CONFIRMED" ? (
                      <button
                        type="button"
                        onClick={() => onPayDeposit(booking)}
                        className="text-sm font-medium text-[#E87722] transition-colors hover:text-[#f39c4d]"
                      >
                        Make Payment
                      </button>
                    ) : (
                      <Link to={`/booking/${booking.id}`} className="text-sm font-medium text-[#E87722] transition-colors hover:text-[#f39c4d]">
                        View Details
                      </Link>
                    )}
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