import { formatCalendarDayLabel } from "../utils/helpers";

export default function AnalyticsPage({ bookings, calendarRooms }) {
  const totalRevenue = bookings.filter((b) => b.payment === "paid").reduce((s, b) => s + b.amount, 0);
  const revenueByDay = Object.entries(
    bookings.reduce((acc, b) => {
      if (!b?.date) return acc;
      const dayLabel = formatCalendarDayLabel(b.date).split(" ")[0];
      acc[dayLabel] = (acc[dayLabel] || 0) + Number(b.amount || 0);
      return acc;
    }, {})
  );
  const topRoom = Object.entries(
    bookings.reduce((acc, b) => {
      if (!b?.room) return acc;
      acc[b.room] = (acc[b.room] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <div className="dh-stats">
        {[
          { icon: "\u{1F4C5}", bg: "rgba(240,123,43,0.12)", badge: <span className="dh-badge-up">&uarr; 12%</span>, num: bookings.length, label: "Total Bookings" },
          { icon: "\u{1F4B0}", bg: "rgba(34,197,94,0.12)", badge: <span className="dh-badge-up">&uarr; 8%</span>, num: totalRevenue.toLocaleString(), label: "Total Revenue (Ksh)", numStyle: { fontSize: 22 } },
          { icon: "\u{1F3DB}\uFE0F", bg: "rgba(59,130,246,0.12)", num: "78%", label: "Private Office Utilisation" },
          { icon: "\u2B50", bg: "rgba(124,58,237,0.12)", num: "10am", label: "Peak Booking Hour" },
        ].map((s, i) => (
          <div key={i} className="dh-stat">
            <div className="dh-stat-top"><div className="dh-stat-icon" style={{ background: s.bg }}>{s.icon}</div>{s.badge}</div>
            <div className="dh-stat-num" style={s.numStyle}>{s.num}</div>
            <div className="dh-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dh-grid2">
        <div className="dh-panel">
          <div className="dh-panel-hd"><div className="dh-panel-title">Revenue by Day</div></div>
          <div style={{ padding: "20px 20px 10px" }}>
            {revenueByDay.length === 0 ? (
              <div className="dh-empty">No revenue data from bookings yet</div>
            ) : (
              <div className="dh-bars" style={{ height: 140 }}>
                {revenueByDay.map(([d, v]) => (
                  <div key={d} className="dh-bar-grp">
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Ksh {(v / 1000).toFixed(0)}k</div>
                    <div className="dh-bar" style={{ height: `${Math.max(8, v / 1000)}%`, background: `rgba(240,123,43,${0.3 + v / 300000})` }} />
                    <div className="dh-bar-lbl">{d}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="dh-panel">
          <div className="dh-panel-hd"><div className="dh-panel-title">Bookings by Room</div></div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {calendarRooms.map((room, i) => {
              const count = bookings.filter((b) => b.room === room).length;
              const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
              const colors = ["#F07B2B", "#3B82F6", "#22C55E"];
              return (
                <div key={room}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{room}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{count} bookings ({pct}%)</span>
                  </div>
                  <div className="dh-bar-bg" style={{ width: "100%" }}><div className="dh-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} /></div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ background: "rgba(240,123,43,0.08)", border: "1px solid rgba(240,123,43,0.15)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#F07B2B", fontWeight: 700, marginBottom: 4 }}>{"\u{1F4A1}"} Insight</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                {topRoom ? `${topRoom[0]} currently leads with ${topRoom[1]} booking${topRoom[1] === 1 ? "" : "s"}.` : "No booking volume insight yet. Create or fetch bookings to populate this panel."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}