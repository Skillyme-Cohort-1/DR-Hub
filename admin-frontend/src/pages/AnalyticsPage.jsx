import { formatCalendarDayLabel } from "../utils/helpers";

export default function AnalyticsPage({ bookings, calendarRooms, users = [] }) {
  const totalRevenue = bookings.filter((b) => b.payment === "paid").reduce((s, b) => s + b.amount, 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  
  const revenueByDay = Object.entries(
    bookings.reduce((acc, b) => {
      if (!b?.date) return acc;
      const dayLabel = formatCalendarDayLabel(b.date).split(" ")[0];
      acc[dayLabel] = (acc[dayLabel] || 0) + Number(b.amount || 0);
      return acc;
    }, {})
  ).sort((a, b) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.indexOf(a[0]) - days.indexOf(b[0]);
  });
  
  const topRoom = Object.entries(
    bookings.reduce((acc, b) => {
      if (!b?.room) return acc;
      acc[b.room] = (acc[b.room] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];
  
  const memberUserOptions = users?.filter((u) => String(u.role || "").toUpperCase() === "MEMBER") || [];
  const bookingStatuses = ['pending', 'confirmed', 'rejected', 'completed'];
  const statusColors = { pending: '#F59E0B', confirmed: '#22C55E', rejected: '#EF4444', completed: '#3B82F6' };
  const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', completed: 'Completed' };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueByDay.map(r => r[1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Stats Cards */}
      <div className="dh-stats">
        <div className="dh-stat">
          <div className="dh-stat-num">{bookings.length}</div>
          <div className="dh-stat-label">Total Bookings</div>
        </div>
        <div className="dh-stat">
          <div className="dh-stat-num">Ksh {totalRevenue.toLocaleString()}</div>
          <div className="dh-stat-label">Total Revenue</div>
        </div>
        <div className="dh-stat">
          <div className="dh-stat-num" style={{ color: '#F59E0B' }}>{pendingCount}</div>
          <div className="dh-stat-label">Pending Approvals</div>
        </div>
        <div className="dh-stat">
          <div className="dh-stat-num" style={{ color: '#22C55E' }}>{confirmedCount}</div>
          <div className="dh-stat-label">Confirmed Bookings</div>
        </div>
      </div>

      {/* Revenue Trend - Line Chart */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div className="dh-panel-title">Revenue Trend</div>
          <div className="dh-panel-sub">Daily revenue in Ksh</div>
        </div>
        <div style={{ padding: '20px' }}>
          {revenueByDay.length === 0 ? (
            <div className="dh-empty">No revenue data available yet</div>
          ) : (
            <div>
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: '180px', marginBottom: '12px' }}>
                {(() => {
                  const points = revenueByDay.map((item, idx) => {
                    const x = (idx / (revenueByDay.length - 1 || 1)) * 100;
                    const y = 100 - ((item[1] / maxRevenue) * 80);
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <>
                      <polyline points={points} fill="none" stroke="#F07B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {revenueByDay.map((item, idx) => {
                        const x = (idx / (revenueByDay.length - 1 || 1)) * 100;
                        const y = 100 - ((item[1] / maxRevenue) * 80);
                        return <circle key={idx} cx={x} cy={y} r="2" fill="#F07B2B" />;
                      })}
                    </>
                  );
                })()}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                {revenueByDay.map((item, i) => (
                  <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                    <div>{item[0]}</div>
                    <div style={{ fontWeight: 'bold', color: '#F07B2B', fontSize: '10px' }}>Ksh {(item[1] / 1000).toFixed(0)}k</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bookings by Room */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div className="dh-panel-title">Bookings by Room</div>
        </div>
        <div style={{ padding: '20px' }}>
          {calendarRooms?.length === 0 ? (
            <div className="dh-empty">No room data available</div>
          ) : (
            calendarRooms.map((room, idx) => {
              const count = bookings.filter(b => b.room === room).length;
              const percentage = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
              const colors = ["#F07B2B", "#3B82F6", "#22C55E", "#8B5CF6", "#EC4899"];
              return (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{room}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{count} ({percentage}%)</span>
                  </div>
                  <div className="dh-bar-bg" style={{ width: '100%' }}>
                    <div className="dh-bar-fill" style={{ width: `${percentage}%`, background: colors[idx % colors.length], height: '8px', borderRadius: '20px' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ backgroundColor: 'rgba(240,123,43,0.08)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#F07B2B', fontWeight: 'bold', marginBottom: '4px' }}>💡 Insight</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {topRoom ? `${topRoom[0]} leads with ${topRoom[1]} booking${topRoom[1] !== 1 ? 's' : ''}.` : 'No booking data available yet.'}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div className="dh-panel-title">Booking Status</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {bookingStatuses.map(status => {
              const count = bookings.filter(b => b.status === status).length;
              const total = bookings.length;
              const percentage = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} style={{ textAlign: 'center', flex: 1, minWidth: '100px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: statusColors[status] }}>{count}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{statusLabels[status]}</div>
                  <div style={{ marginTop: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, backgroundColor: statusColors[status], height: '6px', borderRadius: '10px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member vs Non-Member */}
      <div className="dh-panel">
        <div className="dh-panel-hd">
          <div className="dh-panel-title">Member vs Non-Member</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3B82F6' }}>{memberUserOptions.length}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>👥 Members</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F07B2B' }}>{bookings.length - memberUserOptions.length}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>📝 Non-Members</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}