import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";

const COLLAPSE_KEY = "egjt.sidebar.collapsed";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return sessionStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
  });
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"); } catch { /* ignore */ }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => {
    if (isMobile) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={toggle} collapsed={collapsed} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}