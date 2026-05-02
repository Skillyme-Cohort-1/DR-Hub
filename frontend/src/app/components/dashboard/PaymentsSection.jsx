import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate, formatStatus } from "../../lib/formatters";

const thClass = "px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60";
const tdClass = "px-4 py-4 text-sm text-foreground/70";

export function PaymentsSection({ payments, loading, error }) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Payment History</h2>
        <p className="mt-1 text-sm text-foreground/50">View your transaction records and invoices</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={thClass}>Reference</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-foreground/50">Loading payments...</td></tr>
              ) : null}
              {!loading && error ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-red-400">{error}</td></tr>
              ) : null}
              {!loading && !error && payments.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-foreground/50">No payments yet.</td></tr>
              ) : null}
              {!loading && !error && payments.map((payment) => (
                <tr key={payment.reference} className="border-b border-border/50 transition-colors hover:bg-muted/20">
                  <td className={`${tdClass} font-mono`}>{payment.paymentReference || "N/A"}</td>
                  <td className={tdClass}>{formatBookingDate(payment.createdAt)}</td>
                  <td className="px-4 py-4 text-sm font-semibold">{payment.amount}</td>
                  <td className="px-4 py-4"><StatusBadge status={formatStatus(payment.status)} /></td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-sm font-medium text-[#E87722] hover:text-[#f39c4d]">
                      Download Receipt
                    </button>
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