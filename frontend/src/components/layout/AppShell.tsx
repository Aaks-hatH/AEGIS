import {
  Activity,
  Ambulance,
  BarChart3,
  FileClock,
  LayoutDashboard,
  LogOut,
  Settings,
  Users
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Badge, StatusDot } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Command Center", icon: LayoutDashboard, permission: "analytics:read" },
  { to: "/queue", label: "Live Queue", icon: Activity, permission: "queue:read" },
  { to: "/ambulances", label: "Ambulances", icon: Ambulance, permission: "ambulances:read" },
  { to: "/patients", label: "Patients", icon: Users, permission: "patients:read" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, permission: "analytics:read" },
  { to: "/audit", label: "Audit Log", icon: FileClock, permission: "audit:read" },
  { to: "/settings", label: "Settings", icon: Settings, permission: "settings:read" }
];

const pageTitles: Record<string, string> = {
  "/": "Command Center",
  "/queue": "Live Queue",
  "/ambulances": "Ambulances",
  "/patients": "Patients",
  "/analytics": "Analytics",
  "/audit": "Audit Log",
  "/settings": "Settings"
};

function pageTitle(pathname: string) {
  if (pathname.startsWith("/patients/")) return "Patient Detail";
  return pageTitles[pathname] ?? "AEGIS";
}

export function AppShell() {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.08),transparent_28%),hsl(var(--background))]">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-slate-800/80 bg-slate-950/90 p-4 backdrop-blur-xl lg:block">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 font-black text-white">A</div>
          <div>
            <div className="text-base font-black tracking-tight text-slate-100">AEGIS</div>
            <div className="text-[10px] uppercase tracking-[.22em] text-slate-500">Command Layer</div>
          </div>
        </Link>

        <div className="my-4 h-px bg-slate-800" />

        <nav className="grid gap-0.5">
          {nav.filter((i) => can(i.permission)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-sky-500 bg-sky-500/8 text-sky-400"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-800 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <StatusDot status="live" />
            ACUITY Online
          </div>
        </div>
      </aside>

      <main className="lg:pl-56">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-slate-500">
                {user?.department || "Emergency Department"}
              </div>
              <div className="text-lg font-black text-slate-100">{pageTitle(pathname)}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-600/20 text-sm font-bold text-sky-400">
                  {initial}
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-slate-200">{user?.name}</div>
                  <Badge className="mt-0.5 border-slate-700 bg-slate-800/50 text-[10px] text-slate-400">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <button
                className="btn btn-secondary grid h-9 w-9 place-items-center p-0"
                aria-label="Sign out"
                onClick={() => logout().then(() => navigate("/login"))}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-5 lg:p-8">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
