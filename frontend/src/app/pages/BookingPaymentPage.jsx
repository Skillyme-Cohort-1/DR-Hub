import { useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowLeft, Smartphone, Wallet } from "lucide-react";

export function BookingPaymentPage() {
  const location = useLocation();
  const booking = location.state?.booking;
  const reservationTypeName = location.state?.reservationTypeName || booking?.room?.name || "Room booking";
  const slotTitle = location.state?.slotTitle || "Selected slot";
  const roleFromStorage = (() => {
    try {
      const raw = localStorage.getItem("authUser");
      const user = raw ? JSON.parse(raw) : null;
      return String(user?.userType || user?.role || "").toUpperCase();
    } catch {
      return "";
    }
  })();
  const fallbackFee = roleFromStorage === "MEMBER" ? 1000 : 2000;
  const bookingFee = Number(location.state?.bookingFee || fallbackFee);
  const [paymentType, setPaymentType] = useState("deposit");

  const bookingReference = useMemo(
    () => booking?.reference || booking?.id || "",
    [booking]
  );
  const fullPaymentAmount = useMemo(() => {
    const amount =
      Number(booking?.amountCharged) ||
      Number(booking?.totalCost) ||
      Number(booking?.room?.cost) ||
      0;
    return amount > 0 ? amount : bookingFee;
  }, [booking, bookingFee]);
  const payableAmount = paymentType === "full" ? fullPaymentAmount : bookingFee;

  if (!booking?.id) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0F1A2E] text-white antialiased">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0F1A2E]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6 lg:px-8">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to booking
          </Link>
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-[#E67E22]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DR Hub
          </Link>
          <span className="text-sm font-medium text-white/60">Payment</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20 pt-28 lg:px-8 lg:pt-32">
        <h1 className="mb-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
          Pay booking fee
        </h1>
        <p className="mb-8 text-white/55">Complete payment to confirm this booking.</p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">Booking details</h2>
          <dl className="space-y-3 text-sm text-white/75">
            <div className="flex justify-between gap-4">
              <dt>Booking reference</dt>
              <dd className="text-right font-mono text-white">{bookingReference || "Pending reference"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Reservation</dt>
              <dd className="text-right text-white">{reservationTypeName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Booking date</dt>
              <dd className="text-right text-white">{booking?.date ? new Date(booking.date).toLocaleDateString() : "N/A"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Time slot</dt>
              <dd className="text-right text-white">{slotTitle}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E67E22]/30 bg-[#E67E22]/5 p-6">
          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-white/80">Choose payment option</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentType("deposit")}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  paymentType === "deposit"
                    ? "border-[#E67E22] bg-[#E67E22]/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20"
                }`}
              >
                <span className="block font-semibold">Deposit payment</span>
                <span className="text-xs text-white/60">Ksh {bookingFee.toLocaleString()}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  paymentType === "full"
                    ? "border-[#E67E22] bg-[#E67E22]/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20"
                }`}
              >
                <span className="block font-semibold">Full payment</span>
                <span className="text-xs text-white/60">Ksh {fullPaymentAmount.toLocaleString()}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/55">
                {paymentType === "full" ? "Full payment amount" : "Deposit amount"}
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-white">Ksh {payableAmount.toLocaleString()}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E67E22]/15 text-[#E67E22]">
              <Wallet className="h-8 w-8" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">
            <Smartphone className="h-4 w-4" aria-hidden />
            M-Pesa Payment Details
          </h2>
          <dl className="space-y-3 text-sm text-white/75">
            <div className="flex justify-between gap-4">
              <dt>Pay Bill</dt>
              <dd className="text-right font-mono font-semibold text-white">522522</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Account Number</dt>
              <dd className="text-right font-mono font-semibold text-white">1302541374</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Account Name</dt>
              <dd className="text-right font-semibold text-white">Full Circle Dispute Resolution Hub</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-white/45">Use the details above to make your M-Pesa payment.</p>
        </div>
      </main>
    </div>
  );
}
