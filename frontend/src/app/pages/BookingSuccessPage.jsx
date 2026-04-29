import { Check } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BookingSuccessPage() {
  const location = useLocation();
  const bookingRef = location.state?.bookingRef;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16 lg:px-8">
        <div className="w-full rounded-2xl border border-[#E67E22]/25 bg-[#E67E22]/5 p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E67E22]/20 text-[#E67E22]">
            <Check className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Booking successful
          </h1>
          <p className="mt-3 text-white/65">You will receive an email with information on how to proceed.</p>
          {bookingRef ? <p className="mt-4 font-mono text-lg text-[#E67E22]">{bookingRef}</p> : null}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/5"
            >
              Back to home
            </Link>
            <Link
              to="/booking"
              className="rounded-lg bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              New booking
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
