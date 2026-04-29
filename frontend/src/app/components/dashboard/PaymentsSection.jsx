import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate, formatStatus } from "../../lib/formatters";

export function PaymentsSection({ payments, loading, error }) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Payment History</h2>
        <p className="mt-1 text-sm text-slate-400">View your transaction records and invoices</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Reference</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : null}
              {!loading && error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : null}
              {!loading && !error && payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                    No payments yet.
                  </td>
                </tr>
              ) : null}
              {!loading && !error && payments.map((payment) => (
                <tr key={payment.reference} className="border-b border-slate-700/50 transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-4 text-sm font-mono text-slate-400">{payment.paymentReference || "N/A"}</td>
                  <td className="px-4 py-4 text-sm text-slate-400">{formatBookingDate(payment.createdAt)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-white">{payment.amount}</td>
                  <td className="px-4 py-4"><StatusBadge status={formatStatus(payment.status)} /></td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-sm font-medium text-[#E87722] transition-colors hover:text-[#f39c4d]">
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