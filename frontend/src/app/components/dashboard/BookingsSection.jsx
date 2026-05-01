import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate, formatCurrency, formatStatus } from "../../lib/formatters";

const thClass = "px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60";
const tdClass = "px-4 py-4 text-sm text-foreground/70";

export function BookingsSection({ bookings, loading, error, onPayDeposit }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Your Bookings</h2>
          <p className="mt-1 text-sm text-foreground/50">Manage and track your workspace reservations</p>
        </div>
        <Link to="/booking">
          <Button className="inline-flex items-center gap-2 rounded-lg bg-[#E87722] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E87722]/20 transition-all hover:bg-[#d46a1a]">
            <Plus className="h-4 w-4" /> New Booking
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={thClass}>Booking ID</th>
                <th className={thClass}>Room</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Amount</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-foreground/50">Loading bookings...</td></tr>
              ) : null}
              {!loading && error ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-red-400">{error}</td></tr>
              ) : null}
              {!loading && !error && bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-foreground/50">No bookings yet.</td></tr>
              ) : null}
              {!loading && !error && bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border/50 transition-colors hover:bg-muted/20">
                  <td className={`${tdClass} font-mono`}>{booking.reference || booking.id}</td>
                  <td className="px-4 py-4 text-sm font-medium">{booking.room?.name || "N/A"}</td>
                  <td className={tdClass}>{formatBookingDate(booking.date)}</td>
                  <td className="px-4 py-4"><StatusBadge status={formatStatus(booking.status)} /></td>
                  <td className="px-4 py-4 text-sm font-semibold">{formatCurrency(booking.amountCharged)}</td>
                  <td className="px-4 py-4 text-right">
                    {booking.status === "DRAFT" ? (
                      <button type="button" onClick={() => onPayDeposit(booking)} className="text-sm font-medium text-[#E87722] hover:text-[#f39c4d]">
                        Pay Deposit
                      </button>
                    ) : booking.status === "PENDING" || booking.status === "CONFIRMED" ? (
                      <button type="button" onClick={() => onPayDeposit(booking)} className="text-sm font-medium text-[#E87722] hover:text-[#f39c4d]">
                        Make Payment
                      </button>
                    ) : (
                      <Link to={`/booking/${booking.id}`} className="text-sm font-medium text-[#E87722] hover:text-[#f39c4d]">
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