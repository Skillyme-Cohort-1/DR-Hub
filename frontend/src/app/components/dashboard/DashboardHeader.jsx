import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function DashboardHeader({ profileForm, onLogout, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F1A2E]/90 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 p-0 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">DR Hub</h1>
            <p className="text-xs text-slate-400/70">Client Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{profileForm.name || "User"}</p>
              <p className="text-xs text-slate-400/70">{profileForm.occupation || profileForm.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E87722] to-[#d46a1a] text-sm font-bold text-white shadow-lg">
              {getInitials(profileForm.name)}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}