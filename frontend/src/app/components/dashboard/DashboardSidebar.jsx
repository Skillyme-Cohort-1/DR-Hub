import {
  Calendar,
  CheckCircle,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";

const SECTIONS = [
  { id: "metrics", label: "Metrics", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "checkins", label: "Check-ins", icon: CheckCircle },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "profile", label: "Profile", icon: UserCircle2 },
];

export function DashboardSidebar({ activeSection, onSelect, open, onClose }) {
  const selectSection = (sectionId) => {
    onSelect(sectionId);
    onClose();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 top-16 z-40 w-72 border-r border-white/10 bg-[#0B1526] transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <nav className="space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#E87722]/20 to-[#E87722]/10 text-white shadow-sm shadow-[#E87722]/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#E87722]" />
                  )}
                  <Icon className={`h-5 w-5 transition-transform ${active ? "text-[#E87722]" : "group-hover:scale-110"}`} />
                  <span>{section.label}</span>
                  {active && <ChevronRight className="ml-auto h-4 w-4 text-[#E87722]" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu overlay"
        />
      )}
    </>
  );
}