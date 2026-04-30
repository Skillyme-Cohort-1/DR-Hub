import { useToast } from "../context/ToastContext";

const PAGE_TITLES = {
  overview: "Dashboard Overview",
  bookings: "Bookings",
  calendar: "Schedule Calendar",
  clients: "Clients",
  "client-details": "Client Details",
  users: "Users",
  leads: "Lead Pipeline",
  notifications: "Notifications",
  analytics: "Analytics",
  rooms: "Rooms",
  "room-details": "Room Details",
  "booking-details": "Booking Details",
  attendances: "Attendances",
};

export default function Topbar({
  isMobile,
  mobileMenuOpen,
  sidebarCollapsed,
  toggleSidebar,
  activeNav,
  pendingCount,
  bookings,
  theme,
  toggleTheme,
  logout,
}) {
  const addToast = useToast();

  const exportCsv = () => {
    const headers = ["ID", "Client", "Room", "Date", "Slot", "Amount", "Status"];
    const rows = bookings.map((b) => [b.id, b.name, b.room, b.date, b.slot, b.amount, b.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drhub-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Bookings exported to CSV!", "green", "\u{1F4CA}");
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const chipDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="dh-topbar">
      <div className="dh-topbar-left">
        <button
          type="button"
          className="dh-menu-toggle"
          onClick={toggleSidebar}
          aria-expanded={isMobile ? mobileMenuOpen : !sidebarCollapsed}
          aria-controls="admin-sidebar-nav"
          title={
            isMobile
              ? mobileMenuOpen ? "Close menu" : "Open menu"
              : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isMobile ? (mobileMenuOpen ? "\u2715" : "\u2630") : sidebarCollapsed ? "\u2192" : "\u2190"}
        </button>
        <div className="dh-topbar-titles">
          <h1>{PAGE_TITLES[activeNav] || "Dashboard"}</h1>
          <p>DR Hub Admin &middot; {dateStr}</p>
        </div>
      </div>
      <div className="dh-topbar-right">
        <div className="dh-chip">{"\u{1F4C5}"} {chipDate}</div>
        <div
          className="dh-notif"
          onClick={() => addToast(`${pendingCount} bookings need your approval`, "orange", "\u{1F514}")}
        >
          {"\u{1F514}"}<span className="dh-notif-dot" />
        </div>
        <button
          onClick={toggleTheme}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: "1px solid var(--border-input)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}"}
        </button>
        <button className="dh-btn-primary" style={{ background: "#22C55E" }} onClick={exportCsv}>
          {"\u{1F4CA}"} Export
        </button>
        <button className="dh-btn-primary" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}