function isPastDate(isoDate) {
  return isoDate < new Date().toISOString().slice(0, 10);
}

export default function CalendarPage({
  bookings,
  calendarDays,
  calendarSlots,
  calendarRooms,
  getCalSlot,
  onOpenBookingDetails,
  onOpenBookingFromSlot,
}) {
  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div>
          <div className="dh-panel-title">Weekly Schedule &mdash; All Rooms</div>
          <div className="dh-panel-sub">Click a booked slot to view details</div>
        </div>
      </div>
      <div style={{ padding: "16px 20px", overflowX: "auto" }}>
        {calendarDays.length === 0 || calendarSlots.length === 0 || calendarRooms.length === 0 ? (
          <div className="dh-empty">No calendar slot data available from backend</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${calendarRooms.length},1fr)`, gap: 6, minWidth: 600, marginBottom: 8 }}>
              <div />
              {calendarRooms.map((r) => (
                <div key={r} style={{ fontSize: 11, fontWeight: 700, color: "#F07B2B", textAlign: "center", padding: 8, background: "rgba(240,123,43,0.08)", borderRadius: 6 }}>{r}</div>
              ))}
            </div>
            {calendarDays.map((day) => (
              <div key={day.isoDate}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#888", fontWeight: 600, padding: "12px 0 6px" }}>{day.label}</div>
                {calendarSlots.map((slot) => (
                  <div key={slot} style={{ display: "grid", gridTemplateColumns: `80px repeat(${calendarRooms.length},1fr)`, gap: 6, minWidth: 600, marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#888", fontWeight: 500, display: "flex", alignItems: "center" }}>{slot}</div>
                    {calendarRooms.map((room) => {
                      const s = getCalSlot(day.isoDate, slot, room);
                      const past = isPastDate(day.isoDate);
                      const disabled = past && s.type !== "booked";
                      const slotClass = disabled ? "dh-cal-slot cal-past" : `dh-cal-slot cal-${s.type}`;
                      return (
                        <div key={room} className={slotClass} onClick={() => {
                          if (disabled) return;
                          if (s.type === "booked") {
                            const b = bookings.find((bk) => bk.id === s.bookingId);
                            if (b) onOpenBookingDetails(b.id);
                            return;
                          }
                          if (s.type === "available") onOpenBookingFromSlot(s);
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700 }}>{disabled ? "Past" : s.type === "booked" ? s.name : s.type === "available" ? "Available" : "\u2014"}</div>
                          {!disabled && s.type === "booked" && <div style={{ fontSize: 9, opacity: 0.7 }}>{s.status}</div>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
            <div className="dh-cal-legend" style={{ marginTop: 16 }}>
              {[["cal-booked", "Booked"], ["cal-available", "Available"], ["cal-past", "Past"]].map(([cls, lbl]) => (
                <div key={lbl} className="dh-legend-item"><div className={`dh-legend-dot ${cls}`} style={{ border: "1px solid currentColor" }} />{lbl}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}