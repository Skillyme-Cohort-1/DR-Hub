import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Coffee,
  FileVideo,
  Layers,
  MapPin,
  ParkingCircle,
  Printer,
  Sparkles,
  Users,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Reservation type" },
  { id: 2, label: "Date & time" },
  { id: 3, label: "Your details" },
  { id: 4, label: "Add-ons" },
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

const ADD_ONS = [
  {
    id: "catering",
    label: "Catering",
    description: "Light meals or refreshments arranged for your session.",
    price: "From Ksh 2,500",
    icon: Coffee,
  },
  {
    id: "av_extra",
    label: "Extra AV support",
    description: "On-site help with displays, conferencing, and recordings.",
    price: "From Ksh 1,500",
    icon: FileVideo,
  },
  {
    id: "parking",
    label: "Reserved parking",
    description: "Dedicated bay for the duration of your booking.",
    price: "Ksh 500",
    icon: ParkingCircle,
  },
  {
    id: "printing",
    label: "Printing & binding",
    description: "High-volume print and same-day binding for bundles.",
    price: "Quoted on use",
    icon: Printer,
  },
];

const initialForm = {
  reservationTypeId: "",
  date: "",
  slotId: "",
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  attendees: 1,
  addOnIds: [],
  notes: "",
  documents: [],
};

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

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

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reservationTypes, setReservationTypes] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

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
          return slotDate === selectedDate && slot.booked === false;
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

  const toggleAddOn = (id) => {
    setForm((f) => ({
      ...f,
      addOnIds: f.addOnIds.includes(id) ? f.addOnIds.filter((x) => x !== id) : [...f.addOnIds, id],
    }));
  };

  const handleDocumentsChange = async (event) => {
    const pickedFiles = Array.from(event.target.files || []);
    if (!pickedFiles.length) return;

    try {
      const serialized = await Promise.all(
        pickedFiles.map(async (file) => {
          const dataURL = await readFileAsDataURL(file);
          const base64Content = dataURL.includes(",") ? dataURL.split(",")[1] : "";
          return {
            name: "",
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            contentBase64: base64Content,
          };
        })
      );

      setForm((prev) => ({
        ...prev,
        documents: [...prev.documents, ...serialized],
      }));
    } catch {
      setSubmitError("Some documents could not be read. Please try again.");
    } finally {
      event.target.value = "";
    }
  };

  const removeDocument = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, index) => index !== indexToRemove),
    }));
  };

  const updateDocumentName = (indexToUpdate, name) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, index) => (index === indexToUpdate ? { ...doc, name } : doc)),
    }));
  };

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
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    if (step < 4) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    const hasUnnamedDocuments = form.documents.some((doc) => !doc.name?.trim());
    if (hasUnnamedDocuments) {
      setSubmitError("Please provide a name for every uploaded document.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(`${API_BASE}/api/bookings/non-user`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: form.reservationTypeId,
          slotId: form.slotId,
          bookingDate: form.date,
          totalCost: selectedType.cost,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phone.trim(),
          numberOfAttendees: form.attendees,
          documents: form.documents,
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
        throw new Error(payload?.message || responseText || "Unable to submit your booking at the moment.");
      }

      const ref = payload?.data?.reference || payload?.data?.id || `DRH-${Date.now().toString(36).toUpperCase()}`;
      navigate("/booking/success", {
        replace: true,
        state: {
          bookingRef: ref,
        },
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit your booking at the moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
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
                className="w-full max-w-xs rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
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
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
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
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
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
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                  placeholder="+254 …"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="booker-org" className="mb-2 block text-sm font-medium text-white/80">
                  Organization <span className="font-normal text-white/40">(optional)</span>
                </label>
                <input
                  id="booker-org"
                  type="text"
                  value={form.organization}
                  onChange={(e) => update({ organization: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                  placeholder="Chambers or firm name"
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
                  className="w-full max-w-[200px] rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                />
                <p className="mt-2 text-xs text-white/45">
                  Maximum {maxAttendees} for this reservation type.
                </p>
              </div>
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="step4-title">
            <h1 id="step4-title" className="mb-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Optional add-ons
            </h1>
            <p className="mb-8 text-white/55">Enhance your session — select any that apply. Final pricing is confirmed with you.</p>

            <div className="space-y-3">
              {ADD_ONS.map((addon) => {
                const Icon = addon.icon;
                const on = form.addOnIds.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleAddOn(addon.id)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                      on ? "border-[#E67E22] bg-[#E67E22]/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        on ? "border-[#E67E22] bg-[#E67E22] text-white" : "border-white/25 bg-transparent"
                      }`}
                      aria-hidden
                    >
                      {on ? <Check className="h-4 w-4" /> : null}
                    </span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E67E22]/10 text-[#E67E22]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-white">{addon.label}</span>
                        <span className="text-sm text-[#E67E22]">{addon.price}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/50">{addon.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <label htmlFor="booking-notes" className="mb-2 block text-sm font-medium text-white/80">
                Special requests <span className="font-normal text-white/40">(optional)</span>
              </label>
              <textarea
                id="booking-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update({ notes: e.target.value })}
                className="w-full resize-y rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                placeholder="Dietary needs, accessibility, bundle pages, etc."
              />
            </div>

            <div className="mt-8">
              <label htmlFor="booking-documents" className="mb-2 block text-sm font-medium text-white/80">
                Documents <span className="font-normal text-white/40">(optional, multiple allowed)</span>
              </label>
              <input
                id="booking-documents"
                type="file"
                multiple
                onChange={handleDocumentsChange}
                className="block w-full cursor-pointer rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#E67E22] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#d35400]"
              />
              {form.documents.length ? (
                <ul className="mt-3 space-y-2">
                  {form.documents.map((doc, index) => (
                    <li
                      key={`${doc.fileName}-${index}`}
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 truncate text-white/80">{doc.fileName}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="shrink-0 text-xs font-medium text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2">
                        <label htmlFor={`document-name-${index}`} className="mb-1 block text-xs text-white/60">
                          Document name
                        </label>
                        <input
                          id={`document-name-${index}`}
                          type="text"
                          value={doc.name}
                          onChange={(e) => updateDocumentName(index, e.target.value)}
                          placeholder="Enter a name for this document"
                          className="w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-white outline-none focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-white/45">No documents selected.</p>
              )}
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
                <div className="flex justify-between gap-4">
                  <dt>Add-ons</dt>
                  <dd className="text-right text-white">
                    {form.addOnIds.length ? `${form.addOnIds.length} selected` : "None"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Documents</dt>
                  <dd className="text-right text-white">
                    {form.documents.length ? `${form.documents.length} attached` : "None"}
                  </dd>
                </div>
              </dl>
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
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d35400] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit booking request"}
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
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
        <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white">
          Login
        </Link>
      </div>
    </header>
  );
}
