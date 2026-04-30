import { MAIN_NAV_ITEMS, MGMT_NAV_ITEMS, getInitials } from "../utils/helpers";

export default function Sidebar({
  isMobile,
  sidebarCollapsed,
  mobileMenuOpen,
  activeNav,
  pickNav,
  closeMobileMenu,
  pendingCount,
  newLeadsCount,
  user,
}) {
  const sidebarClass = [
    "dh-sidebar",
    !isMobile && sidebarCollapsed ? "dh-sidebar--collapsed" : "",
    isMobile && mobileMenuOpen ? "dh-sidebar--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={`dh-sidebar-backdrop ${isMobile && mobileMenuOpen ? "dh-sidebar-backdrop--visible" : ""}`}
        aria-hidden="true"
        onClick={closeMobileMenu}
      />
      <aside className={sidebarClass} aria-label="Main navigation">
        <div className="dh-logo">
          <div className="dh-logo-the">The</div>
          <div className="dh-logo-dr">
            DR<span>hub</span>
          </div>
          <div className="dh-logo-badge">Admin Panel</div>
        </div>
        <nav id="admin-sidebar-nav" className="dh-nav">
          <div className="dh-nav-label">Main</div>
          {MAIN_NAV_ITEMS.map((n) => {
            const count =
              n.id === "bookings" ? pendingCount : 0;
            return (
              <button
                key={n.id}
                type="button"
                className={`dh-nav-item ${activeNav === n.id ? "active" : ""}`}
                onClick={() => pickNav(n.id)}
              >
                <span className="dh-nav-ico" aria-hidden>{n.icon}</span>
                <span className="dh-nav-text">{n.label}</span>
                {count > 0 && <span className="dh-nav-count">{count}</span>}
              </button>
            );
          })}
          <div className="dh-nav-label">Management</div>
          {MGMT_NAV_ITEMS.map((n) => {
            const count =
              n.id === "leads"
                ? newLeadsCount
                : n.id === "notifications"
                  ? pendingCount
                  : 0;
            return (
              <button
                key={n.id}
                type="button"
                className={`dh-nav-item ${activeNav === n.id ? "active" : ""}`}
                onClick={() => pickNav(n.id)}
              >
                <span className="dh-nav-ico" aria-hidden>{n.icon}</span>
                <span className="dh-nav-text">{n.label}</span>
                {count > 0 && <span className="dh-nav-count">{count}</span>}
              </button>
            );
          })}
        </nav>
        <div className="dh-user">
          <div className="dh-av">{getInitials(user?.name || "Admin")}</div>
          <div className="dh-user-info">
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.name || "Administrator"}</div>
            <div style={{ fontSize: 10, color: "#888" }}>{user?.role || "ADMIN"}</div>
          </div>
        </div>
      </aside>
    </>
  );
}