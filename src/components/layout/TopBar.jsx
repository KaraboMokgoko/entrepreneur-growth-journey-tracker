import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";

export default function TopBar({ onToggleSidebar, collapsed }) {
  const { user, logout } = useAuth();
  const role = user?.role || "user";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 border-b bg-white/90 backdrop-blur">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle menu" className="shrink-0">
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">SC</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">Growth Journey Tracker</p>
          <p className="text-[11px] text-muted-foreground leading-tight truncate hidden sm:block">Simply Complex Africa</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-tight truncate max-w-[160px]">{user?.full_name || user?.email || "User"}</p>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[role] || ""}`}>
            {ROLE_LABELS[role] || role}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout(true)} aria-label="Log out">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}