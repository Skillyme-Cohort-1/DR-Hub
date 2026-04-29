const BADGE_STYLES = {
  confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`rounded border px-3 py-1 text-xs ${BADGE_STYLES[status.toLowerCase()] || "border-slate-600 text-slate-400"}`}
    >
      {status}
    </span>
  );
}