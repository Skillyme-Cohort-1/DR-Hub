import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../services/constants";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Reservation type" },
  { id: 2, label: "Date & time" },
  { id: 3, label: "Your details" },
  { id: 4, label: "Confirm booking" },
];

const RESERVATION_TYPES = [
  {
    id: "focus_suite",
    title: "Focus suite",
    description: "Soundproof space for interviews, depositions, and deep work — 2–4 people.",
    maxAttendees: 4,
    icon: Building2,
  },
  {
    id: "boardroom",
    title: "Boardroom",
    description: "Formal meetings, hearings prep, and partner sessions — 8–14 people.",
    maxAttendees: 14,
    icon: Layers,
  },
  {
    id: "adr_suite",
    title: "ADR suite",
    description: "Mediation and arbitration with neutral layout and breakout-friendly flow.",
    maxAttendees: 10,
    icon: Users,
  },
  {
    id: "day_workspace",
    title: "Day workspace",
    description: "Flexible desk access for solo practice and light collaboration during business hours.",
    maxAttendees: 6,
    icon: Sparkles,
  },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", range: "08:00 – 12:00" },
  { id: "afternoon", label: "Afternoon", range: "12:00 – 15:00" },
  { id: "late_afternoon", label: "Late afternoon", range: "15:00 – 18:00" },
  { id: "evening", label: "Evening", range: "18:00 – 20:00" },
];

const initialForm = {
  reservationTypeId: "",
  date: "",
  slotId: "",
  fullName: "",
  email: "",
  phone: "",
  attendees: 1,
};

const API_BASE = BACKEND_URL.replace(/\/$/, "");

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function phoneOk(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

function getAuthUser() {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    const user = getAuthUser();
    return {
      ...initialForm,
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNumber || user?.phone || "",
    };
  });
  const [reservationTypes, setReservationTypes] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const authUser = getAuthUser();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const minDate = useMemo(() => todayISODate(), []);

  useEffect(() => {
    let mounted = true;
    const loadRooms = async () => {
      setRoomsLoading(true);
      setRoomsError("");
      try {
        const response = await fetch(`${API_BASE}/api/rooms`, {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        });
        const payload = await response.json();
        if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
          throw new Error("Failed to load reservation types.");
        }
        if (!mounted) return;
        const mappedTypes = payload.data
          .filter((room) => room?.isActive)
          .map((room, index) => ({
            id: room.id,
            title: room.name,
            description: room.description || "No description available.",
            maxAttendees: Number(room.capacity) || 1,
            cost: Number(room.cost) || 0,
            icon: RESERVATION_TYPES[index % RESERVATION_TYPES.length].icon,
          }));
        setReservationTypes(mappedTypes);
      } catch {
        if (mounted) setRoomsError("Unable to load reservation types right now.");
      } finally {
        if (mounted) setRoomsLoading(false);
      }
    };

    loadRooms();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const selectedRoomId = form.reservationTypeId;
    const selectedDate = form.date;

    setForm((prev) => ({ ...prev, slotId: "" }));
    setSlots([]);
    setSlotsError("");

    if (!selectedRoomId || !selectedDate) return;

    let mounted = true;
    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const query = new URLSearchParams({
          slotDate: selectedDate,
          roomId: selectedRoomId,
        }).toString();
        const response = await fetch(`${API_BASE}/api/slots/${selectedRoomId}?${query}`, {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        });
        const payload = await response.json();
        if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
          throw new Error("Failed to load slots.");
        }
        if (!mounted) return;
        const matchingSlots = payload.data.filter((slot) => {
          const slotDate = new Date(slot.slotDate).toISOString().slice(0, 10);
          return slotDate === selectedDate && !slot.booked && !slot.blocked;
        });
        setSlots(matchingSlots);
      } catch {
        if (mounted) setSlotsError("Unable to load slots for that date.");
      } finally {
        if (mounted) setSlotsLoading(false);
      }
    };

    loadSlots();
    return () => {
      mounted = false;
    };
  }, [form.reservationTypeId, form.date]);

  const selectedType = reservationTypes.find((t) => t.id === form.reservationTypeId);
  const maxAttendees = selectedType?.maxAttendees ?? 14;

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const userDetailsAreAutofilled = Boolean(authUser);

  const canGoNext = () => {
    if (step === 1) return Boolean(form.reservationTypeId);
    if (step === 2) return Boolean(form.date && form.slotId);
    if (step === 3) {
      return (
        form.fullName.trim().length >= 2 &&
        validateEmail(form.email) &&
        phoneOk(form.phone) &&
        form.attendees >= 1 &&
        form.attendees <= maxAttendees
      );
    }
    if (step === 4) return true;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    if (step < 4) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmitBooking = async () => {
    if (!selectedType) return;
    setSubmitLoading(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("authToken") || "";
      const headers = {
        Accept: "*/*",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Create booking
      const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          roomId: form.reservationTypeId,
          slotId: form.slotId,
          bookingDate: form.date,
          totalCost: selectedType.cost,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phone.trim(),
          numberOfAttendees: form.attendees,
        }),
      });
      const bookingText = await bookingRes.text();
      let bookingPayload = null;
      try { bookingPayload = bookingText ? JSON.parse(bookingText) : null; } catch { bookingPayload = null; }
      if (!bookingRes.ok) {
        throw new Error(bookingPayload?.message || "Unable to create your booking. Please try again.");
      }

      const createdBooking = bookingPayload?.data || bookingPayload?.booking || {};
      const selectedSlot = slots.find((s) => s.id === form.slotId);
      navigate("/booking/pay", {
        replace: true,
        state: {
          booking: {
            ...createdBooking,
            room: selectedType,
            date: form.date,
          },
          reservationTypeName: selectedType?.title,
          slotTitle: selectedSlot?.title || "Selected slot",
          bookingFee: selectedType?.cost,
        },
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0F1A2E] text-white antialiased">
      <BookingHeader />

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28 lg:max-w-4xl lg:px-8 lg:pt-32">
        {/* Progress */}
        <nav aria-label="Booking steps" className="mb-12">
          <ol className="flex flex-wrap items-center gap-2 sm:gap-0">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${
                    step === s.id
                      ? "bg-[#E67E22] text-white"
                      : step > s.id
                        ? "bg-white/10 text-white/80"
                        : "bg-white/5 text-white/40"
                  }`}
                >
                  <span className="tabular-nums">{s.id}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 ? (
                  <span className="mx-1 text-white/20 sm:mx-2" aria-hidden>
                    /
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-white/45 sm:hidden">{STEPS[step - 1]?.label}</p>
        </nav>

        {step === 1 && (
          <section aria-labelledby="step1-title">
            <h1 id="step1-title" className="mb-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Choose reservation type
            </h1>
            <p className="mb-8 text-white/55">Select the space that best fits your session.</p>
            {roomsError ? <p className="mb-4 text-sm text-red-300">{roomsError}</p> : null}
            {roomsLoading ? <p className="text-sm text-white/60">Loading reservation types...</p> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {reservationTypes.map((type) => {
                const Icon = type.icon;
                const selected = form.reservationTypeId === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        reservationTypeId: type.id,
                        attendees: Math.min(f.attendees, type.maxAttendees),
                      }));
                    }}
                    className={`flex flex-col rounded-2xl border p-6 text-left transition-all ${
                      selected
                        ? "border-[#E67E22] bg-[#E67E22]/10 shadow-lg shadow-[#E67E22]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E67E22]/15 text-[#E67E22] ring-1 ring-[#E67E22]/25">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <span className="text-lg font-semibold text-white">{type.title}</span>
                    <span className="mt-2 text-sm leading-relaxed text-white/55">{type.description}</span>
                    <span className="mt-3 text-sm text-white/70">Ksh {type.cost.toLocaleString()}</span>
                    <span className="mt-4 text-xs font-medium uppercase tracking-wider text-[#E67E22]/90">
                      Up to {type.maxAttendees} attendees
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step2-title">
            <h1 id="step2-title" className="mb-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Date &amp; time slot
            </h1>
            <p className="mb-8 text-white/55">Pick a day and the block that works for you.</p>

            <div className="mb-8">
              <label htmlFor="booking-date" className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Calendar className="h-4 w-4 text-[#E67E22]" aria-hidden />
                Date
              </label>
              <input
                id="booking-date"
                type="date"
                min={minDate}
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                className="w-full max-w-xs rounded-lg border border-white/10 bg-[#162032] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
              />
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
                <Clock className="h-4 w-4 text-[#E67E22]" aria-hidden />
                Time slot
              </p>
              {!form.date ? (
                <p className="text-sm text-white/50">Select a date first to view available slots.</p>
              ) : slotsLoading ? (
                <p className="text-sm text-white/60">Loading available slots...</p>
              ) : slotsError ? (
                <p className="text-sm text-red-300">{slotsError}</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-white/50">No available slots for the selected date.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const selected = form.slotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => update({ slotId: slot.id })}
                        className={`rounded-xl border px-4 py-4 text-left transition-all ${
                          selected
                            ? "border-[#E67E22] bg-[#E67E22]/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <span className="block font-semibold text-white">{slot.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step3-title">
            <h1 id="step3-title" className="mb-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Who&apos;s booking?
            </h1>
            <p className="mb-8 text-white/55">
              Primary contact for this reservation
              {selectedType ? ` · ${selectedType.title}` : ""}.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="booker-name" className="mb-2 block text-sm font-medium text-white/80">
                  Full name
                </label>
                <input
                  id="booker-name"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => update({ fullName: e.target.value })}
                  disabled={userDetailsAreAutofilled}
                  readOnly={userDetailsAreAutofilled}
                  className="w-full rounded-lg border border-white/10 bg-[#162032] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                  placeholder="Name as it should appear on the booking"
                />
              </div>
              <div>
                <label htmlFor="booker-email" className="mb-2 block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  id="booker-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  disabled={userDetailsAreAutofilled}
                  readOnly={userDetailsAreAutofilled}
                  className="w-full rounded-lg border border-white/10 bg-[#162032] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="booker-phone" className="mb-2 block text-sm font-medium text-white/80">
                  Phone
                </label>
                <input
                  id="booker-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  disabled={userDetailsAreAutofilled}
                  readOnly={userDetailsAreAutofilled}
                  className="w-full rounded-lg border border-white/10 bg-[#162032] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                  placeholder="+254 …"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="booker-attendees" className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Users className="h-4 w-4 text-[#E67E22]" aria-hidden />
                  Number of attendees
                </label>
                <input
                  id="booker-attendees"
                  type="number"
                  min={1}
                  max={maxAttendees}
                  value={form.attendees}
                  onChange={(e) => update({ attendees: Math.max(1, Math.min(maxAttendees, Number(e.target.value) || 1)) })}
                  className="w-full max-w-[200px] rounded-lg border border-white/10 bg-[#162032] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                />
                <p className="mt-2 text-xs text-white/45">
                  Maximum {maxAttendees} for this reservation type.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#E67E22]">Summary</h2>
              <dl className="space-y-2 text-sm text-white/70">
                <div className="flex justify-between gap-4">
                  <dt>Type</dt>
                  <dd className="text-right text-white">{selectedType?.title ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Date</dt>
                  <dd className="text-right text-white">{form.date || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Slot</dt>
                  <dd className="text-right text-white">
                    {slots.find((s) => s.id === form.slotId)?.title ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Attendees</dt>
                  <dd className="text-right text-white">{form.attendees}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="step4-title">
            <h1 id="step4-title" className="mb-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Confirm booking details
            </h1>
            <p className="mb-8 text-white/55">Review details below, then submit your booking.</p>

            <div className="rounded-2xl border border-[#E67E22]/30 bg-[#E67E22]/5 p-6">
              <dl className="space-y-3 text-sm text-white/75">
                <div className="flex justify-between gap-4">
                  <dt>Reservation type</dt>
                  <dd className="text-right text-white">{selectedType?.title || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Date</dt>
                  <dd className="text-right text-white">{form.date || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Time slot</dt>
                  <dd className="text-right text-white">{slots.find((s) => s.id === form.slotId)?.title || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Booked by</dt>
                  <dd className="text-right text-white">{form.fullName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Email</dt>
                  <dd className="text-right text-white">{form.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Phone</dt>
                  <dd className="text-right text-white">{form.phone}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Attendees</dt>
                  <dd className="text-right text-white">{form.attendees}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white/50">
              After submission, you will be redirected to the booking fee payment page.
            </div>
          </section>
        )}


        {/* Nav buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d35400] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {submitError ? <p className="text-sm text-red-300">{submitError}</p> : null}
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={submitLoading || !canGoNext()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d35400] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? "Submitting…" : "Submit booking"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BookingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0F1A2E]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-[#E67E22]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          DR Hub
        </Link>
        <Link to="/dashboard" className="text-sm font-medium text-white/70 hover:text-white">
          Dashboard
        </Link>
      </div>
    </header>
  );
}
