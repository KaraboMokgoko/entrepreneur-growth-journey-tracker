import { NavLink } from "react-router-dom";
import {
  BarChart3, Building2, ClipboardList, ListChecks, Handshake, Flag,
  Users, ShieldCheck, UserCog, Settings, LayoutDashboard, BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { NAV_BY_ROLE, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import { cn } from "@/lib/utils";

const ICONS = {
  BarChart3, Building2, ClipboardList, ListChecks, Handshake, Flag,
  Users, ShieldCheck, UserCog, Settings, LayoutDashboard, BookOpen,
};

export default function Sidebar({ open, onClose, collapsed, isMobile }) {
  const { user } = useAuth();
  const role = user?.role || "user";
  const items = NAV_BY_ROLE[role] || [];

  // Mobile: render as overlay drawer
  if (isMobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-40 lg:hidden">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
          <SidebarContent items={items} role={role} user={user} onNavigate={onClose} />
        </aside>
      </div>
    );
  }

  // Desktop: docked, collapsible rail
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-white transition-[width] duration-200 shrink-0",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <SidebarContent items={items} role={role} user={user} collapsed={collapsed} />
    </aside>
  );
}

function SidebarContent({ items, role, user, collapsed, onNavigate }) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || BarChart3;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  collapsed && "justify-center px-0"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className={cn("border-t p-3", collapsed && "px-0")}>
        {!collapsed ? (
          <div className="text-xs">
            <p className="font-medium truncate">{user?.full_name || user?.email || "User"}</p>
            <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[role] || ""}`}>
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-700">
              {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}