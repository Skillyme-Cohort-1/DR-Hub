import { useMemo } from "react";
import { formatCalendarDayLabel } from "../utils/helpers";

export function useCalendarData(bookings, allSlots) {
  return useMemo(() => {
    const slotDates = allSlots
      .map((s) => {
        if (!s?.slotDate) return "";
        const p = new Date(s.slotDate);
        return Number.isNaN(p.getTime()) ? "" : p.toISOString().slice(0, 10);
      })
      .filter(Boolean);

    const bookingDates = bookings.map((b) => b.date).filter(Boolean);
    const todayIso = new Date().toISOString().slice(0, 10);
    const isoDates = Array.from(new Set([...slotDates, ...bookingDates]))
      .filter((d) => d >= todayIso)
      .sort();
    const calendarDays = isoDates.map((d) => ({ isoDate: d, label: formatCalendarDayLabel(d) }));

    const slotTitles = allSlots
      .map((s) => (typeof s?.title === "string" ? s.title.trim() : ""))
      .filter(Boolean);
    const bookingTitles = bookings
      .map((b) => (typeof b.slot === "string" ? b.slot.trim() : ""))
      .filter((s) => s && s !== "N/A");
    const calendarSlots = Array.from(new Set([...slotTitles, ...bookingTitles]));

    const slotRooms = allSlots.map((s) => s?.room?.name || "").filter(Boolean);
    const bookingRooms = bookings.map((b) => b.room).filter(Boolean);
    const calendarRooms = Array.from(new Set([...slotRooms, ...bookingRooms]));

    const calendarData = {};
    allSlots.forEach((slot) => {
      const title = typeof slot?.title === "string" ? slot.title.trim() : "";
      const roomName = slot?.room?.name || "";
      if (!title || !roomName || !slot?.slotDate) return;
      const parsed = new Date(slot.slotDate);
      if (Number.isNaN(parsed.getTime())) return;
      const isoDate = parsed.toISOString().slice(0, 10);
      const key = `${isoDate}-${title}-${roomName}`;
      const rawCost = slot?.cost ?? slot?.room?.cost ?? slot?.room?.price ?? slot?.room?.amount;
      const normalizedCost = Number(rawCost);
      const normalizedCapacity = Number(slot?.room?.capacity);
      calendarData[key] = {
        type: slot.booked ? "booked" : "available",
        bookingId: null,
        name: "Reserved",
        status: slot.booked ? "confirmed" : "available",
        slotId: slot?.id || "",
        roomId: slot?.roomId || slot?.room?.id || "",
        roomName,
        slotTitle: title,
        isoDate,
        cost: Number.isFinite(normalizedCost) ? normalizedCost : "",
        roomCapacity: Number.isFinite(normalizedCapacity) ? normalizedCapacity : "",
      };
    });

    bookings.forEach((b) => {
      if (!b.date || !b.slot || b.slot === "N/A") return;
      if (b.status !== "confirmed" && b.status !== "pending") return;
      const key = `${b.date}-${b.slot}-${b.room}`;
      calendarData[key] = {
        type: "booked",
        name: b.name.split(" ")[1] || b.name.split(" ")[0],
        status: b.status,
        bookingId: b.id,
      };
    });

    const getCalSlot = (isoDate, slot, room) => {
      return calendarData[`${isoDate}-${slot}-${room}`] || { type: "unavailable" };
    };

    return { calendarDays, calendarSlots, calendarRooms, getCalSlot };
  }, [bookings, allSlots]);
}