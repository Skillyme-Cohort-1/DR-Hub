export const SIDEBAR_BREAKPOINT = 960;

export const BOOKING_COLORS = [
  "#6c63ff", "#059669", "#F07B2B", "#3B82F6",
  "#7C3AED", "#EC4899", "#0891b2", "#16a34a",
];

export const LEAD_COLORS = [
  "#6c63ff", "#F07B2B", "#22C55E", "#3B82F6", "#7C3AED", "#EC4899",
];

export const MAIN_NAV_ITEMS = [
  { id: "overview",    icon: "\u{1F4CA}", label: "Overview" },
  { id: "bookings",    icon: "\u{1F4C5}", label: "Bookings" },
  { id: "calendar",    icon: "\u{1F5D3}\uFE0F", label: "Calendar" },
  { id: "clients",     icon: "\u{1F465}", label: "Clients" },
  { id: "users",       icon: "\u{1F9D1}", label: "Users" },
  { id: "rooms",       icon: "\u{1F3E2}", label: "Rooms" },
  { id: "attendances", icon: "\u2705",    label: "Attendances" },
];

export const MGMT_NAV_ITEMS = [
  { id: "leads",         icon: "\u{1F3AF}", label: "Leads" },
  { id: "notifications", icon: "\u{1F514}", label: "Notifications" },
  { id: "analytics",     icon: "\u{1F4C8}", label: "Analytics" },
];

export function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getRoomIcon(roomName) {
  if (roomName === "Private Office") return "\u{1F3DB}\uFE0F";
  if (roomName === "Boardroom") return "\u{1F4CB}";
  return "\u2696\uFE0F";
}

export function normalizeBookingStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved") return "confirmed";
  if (normalized === "cancelled") return "rejected";
  if (normalized === "checked_in") return "checked in";
  if (normalized === "no_show") return "no show";
  return ["pending", "draft", "confirmed", "rejected", "completed", "declined", "rejected"].includes(normalized)
    ? normalized
    : "pending";
}

export function normalizeBookingPayment(payment) {
  return String(payment?.status || payment || "").toLowerCase();
}

export function mapApiBookingToDashboardBooking(booking, index) {
  const name = booking?.user?.name || "Unknown Client";
  const roomName = booking?.room?.name || "Combined";
  const parsedDate = booking?.date ? new Date(booking.date) : null;
  const isoDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString().slice(0, 10)
      : "";
  const slotTitle =
    typeof booking?.slot?.title === "string" && booking.slot.title.trim()
      ? booking.slot.title.trim()
      : "N/A";
  return {
    id: booking?.id,
    reference: booking?.reference,
    name,
    initials: getInitials(name),
    color: BOOKING_COLORS[index % BOOKING_COLORS.length],
    type: "Member",
    room: roomName,
    roomIcon: getRoomIcon(roomName),
    date: isoDate,
    slot: slotTitle,
    amount: Number(booking?.amountCharged) || 0,
    status: normalizeBookingStatus(booking?.status),
    userId: booking?.userId || booking?.user?.id || null,
    roomId: booking?.roomId || booking?.room?.id || null,
  };
}

export function formatCalendarDayLabel(isoDate) {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  const weekDay = parsed.toLocaleDateString("en-US", { weekday: "short" });
  const month = parsed.toLocaleDateString("en-US", { month: "short" });
  return `${weekDay} ${parsed.getDate()} ${month}`;
}

export function mapDocumentStatus(apiStatus) {
  const normalized = String(apiStatus || "").toUpperCase();
  if (normalized === "APPROVED") return "Verified";
  if (normalized === "DECLINED") return "Declined";
  return "Pending";
}

export function getDocumentPreviewUrl(doc, apiBaseUrl) {
  if (!doc) return null;
  if (doc.documentUrl) return doc.documentUrl;
  const file = doc.documentFile;
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  if (String(file).startsWith("/")) return `${apiBaseUrl}${file}`;
  return null;
}

export function extractSlots(data) {
  return Array.isArray(data.slots)
    ? data.slots
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.items)
        ? data.items
        : [];
}

export function getRoomCost(room) {
  const raw = room.cost ?? room.price ?? room.pricePerDay ?? room.pricePerHour ?? room.amount;
  const num = Number(raw);
  if (Number.isFinite(num) && String(raw).trim() !== "") return `Ksh ${num.toLocaleString()}`;
  return raw ? String(raw) : "-";
}