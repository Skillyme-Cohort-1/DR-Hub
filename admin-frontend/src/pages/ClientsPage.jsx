import { useState } from "react";
import Avatar from "../components/Avatar";
import { getInitials } from "../utils/helpers";

export default function ClientsPage({ users, usersLoading, usersError, onSelectClient }) {
  const [search, setSearch] = useState("");

  const members = users
    .filter((u) => String(u.role || "").toUpperCase() === "MEMBER")
    .filter((u) => {
      const q = search.toLowerCase();
      return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    });

  return (
    <div className="dh-panel">
      <div className="dh-panel-hd">
        <div className="dh-panel-title">Member Clients</div>
        <input className="dh-search" placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {usersError && <div style={{ padding: "12px 20px", color: "#ffb4b4" }}>{usersError}</div>}
      <div className="dh-table-wrap">
        <table className="dh-table">
          <thead><tr><th>Client</th><th>Email</th><th>Phone</th><th>Gender</th><th>Occupation</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {!usersLoading && members.length === 0 && (
              <tr><td colSpan={7}><div className="dh-empty">No member clients found</div></td></tr>
            )}
            {members.map((u) => (
              <tr key={u.id} onClick={() => onSelectClient(u)}>
                <td>
                  <div className="dh-client-cell">
                    <Avatar initials={getInitials(u.name || "Member")} color="#6c63ff" size={34} />
                    <div><div className="dh-cname">{u.name || "-"}</div><div className="dh-ctype">Member</div></div>
                  </div>
                </td>
                <td>{u.email || "-"}</td>
                <td>{u.phoneNumber || "-"}</td>
                <td>{u.gender || "-"}</td>
                <td>{u.occupation || "-"}</td>
                <td>
                  <span className={`dh-status ${String(u.status || "").toLowerCase() === "active" ? "s-confirmed" : "s-pending"}`}>
                    {u.status || "UNKNOWN"}
                  </span>
                </td>
                <td style={{ color: "#888", fontSize: 11 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}