import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Calendar, Clock, CreditCard, FileText, User } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatBookingDate, formatCurrency, formatStatus, formatProfileDate } from "../lib/formatters";

import { BACKEND_URL } from "../../services/constants";

const API_BASE = BACKEND_URL.replace(/\/$/, "");

export function BookingDetailsPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchBooking = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
          method: "GET",
          headers: {
            Accept: "*/*",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const payload = await res.json();
        if (!res.ok || !payload?.booking) {
          throw new Error(payload?.message || "Failed to load booking.");
        }
        if (mounted) setBooking(payload.booking);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unable to load booking.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBooking();
    return () => { mounted = false; };
  }, [id]);

  const balance = booking ? Math.max(0, (booking.amountCharged || 0) - (booking.amountPaid || 0)) : 0;

  return (
    <div className="min-h-screen bg-[#0F1A2E] text-white antialiased">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0F1A2E]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to dashboard
          </Link>
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-[#E67E22]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DR Hub
          </Link>
          <span className="text-sm font-medium text-white/60">Booking details</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28 lg:px-8 lg:pt-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-white/60">Loading booking details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-red-300">{error}</p>
            <Link to="/dashboard" className="mt-4 text-sm font-medium text-[#E67E22] hover:underline">
              Return to dashboard
            </Link>
          </div>
        ) : booking ? (
          <>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 font-mono text-sm text-[#E67E22]">{booking.reference}</p>
                <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Booking details
                </h1>
              </div>
              <StatusBadge status={formatStatus(booking.status)} />
            </div>

            {/* Room & Schedule */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">
                <Building2 className="h-4 w-4" aria-hidden />
                Reservation
              </h2>
              <dl className="space-y-3 text-sm text-white/75">
                <div className="flex justify-between gap-4">
                  <dt>Room</dt>
                  <dd className="text-right font-medium text-white">{booking.room?.name || "N/A"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-white/40" aria-hidden />Date</dt>
                  <dd className="text-right text-white">{formatBookingDate(booking.date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-white/40" aria-hidden />Time slot</dt>
                  <dd className="text-right text-white">{booking.slot?.title || "N/A"}</dd>
                </div>
                {booking.slot?.fullDay ? (
                  <div className="flex justify-between gap-4">
                    <dt>Full day</dt>
                    <dd className="text-right text-white">Yes</dd>
                  </div>
                ) : null}
                {booking.notes ? (
                  <div className="flex justify-between gap-4">
                    <dt className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-white/40" aria-hidden />Notes</dt>
                    <dd className="text-right text-white">{booking.notes}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 rounded-2xl border border-[#E67E22]/30 bg-[#E67E22]/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">
                <CreditCard className="h-4 w-4" aria-hidden />
                Payment summary
              </h2>
              <dl className="space-y-3 text-sm text-white/75">
                <div className="flex justify-between gap-4">
                  <dt>Amount charged</dt>
                  <dd className="text-right font-semibold text-white">{formatCurrency(booking.amountCharged)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Amount paid</dt>
                  <dd className="text-right font-semibold text-emerald-400">{formatCurrency(booking.amountPaid)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                  <dt className="font-medium text-white">Balance</dt>
                  <dd className={`text-right font-bold ${balance > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {formatCurrency(balance)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Deposit paid</dt>
                  <dd className="text-right text-white">{booking.depositPaid ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">
                  Payment history
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                        <th className="pb-3 pr-4">Reference</th>
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 pr-4">Method</th>
                        <th className="pb-3 pr-4 text-right">Amount</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.payments.map((pmt) => (
                        <tr key={pmt.id} className="border-b border-white/5">
                          <td className="py-3 pr-4 font-mono text-white/70">{pmt.paymentReference}</td>
                          <td className="py-3 pr-4 text-white/70">{pmt.paymentType}</td>
                          <td className="py-3 pr-4 text-white/70">{pmt.paymentMethod || "N/A"}</td>
                          <td className="py-3 pr-4 text-right font-semibold text-white">{formatCurrency(pmt.amount)}</td>
                          <td className="py-3 pr-4"><StatusBadge status={formatStatus(pmt.status)} /></td>
                          <td className="py-3 text-white/50">{formatBookingDate(pmt.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
                No payments recorded yet.
              </div>
            )}

            {/* Booker Info */}
            {booking.user ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">
                  <User className="h-4 w-4" aria-hidden />
                  Booked by
                </h2>
                <dl className="space-y-3 text-sm text-white/75">
                  <div className="flex justify-between gap-4">
                    <dt>Name</dt>
                    <dd className="text-right text-white">{booking.user.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Email</dt>
                    <dd className="text-right text-white">{booking.user.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Role</dt>
                    <dd className="text-right text-white">{formatStatus(booking.user.role)}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {/* Timestamps */}
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs text-white/35">
              <p>Created: {formatProfileDate(booking.createdAt)}</p>
              <p>Updated: {formatProfileDate(booking.updatedAt)}</p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
