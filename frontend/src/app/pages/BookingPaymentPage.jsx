import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Wallet } from "lucide-react";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

function phoneOk(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function BookingPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const defaultPhone = location.state?.defaultPhone || "";

  const [mpesaPhone, setMpesaPhone] = useState(defaultPhone);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
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

  const handlePayBookingFee = async () => {
    if (!phoneOk(mpesaPhone)) {
      setPaymentError("Enter a valid M-Pesa phone number.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");
    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch(`${API_BASE}/api/payments/mpesa/stk-push`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phoneNumber: mpesaPhone.replace(/\s+/g, "").replace(/^\+/, ""),
          amount: payableAmount,
          bookingId: booking.id,
        }),
      });

      const responseText = await response.text();
      let payload = null;
      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(payload?.message || "Payment request failed. Please try again.");
      }

      navigate("/booking/success", {
        replace: true,
        state: {
          bookingRef: bookingReference,
        },
      });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to process payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
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

        <div className="mt-6">
          <label htmlFor="mpesa-phone" className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
            <Smartphone className="h-4 w-4 text-[#E67E22]" aria-hidden />
            M-Pesa phone number
          </label>
          <input
            id="mpesa-phone"
            type="tel"
            value={mpesaPhone}
            onChange={(e) => setMpesaPhone(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
            placeholder="e.g. 0712 345 678"
          />
          <p className="mt-2 text-xs text-white/45">Use the number that should receive the STK push prompt.</p>
        </div>

        {paymentError ? <p className="mt-4 text-sm text-red-300">{paymentError}</p> : null}

        <div className="mt-8">
          <button
            type="button"
            onClick={handlePayBookingFee}
            disabled={paymentLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d35400] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paymentLoading ? "Processing…" : `Pay now · Ksh ${payableAmount.toLocaleString()}`}
          </button>
        </div>
      </main>
    </div>
  );
}
