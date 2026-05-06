import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  Sparkles,
  Users,
  UserCheck,
  FileText,
  User,
  Settings,
  Zap,
  CreditCard,
  Briefcase,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Navbar configs per role
// ─────────────────────────────────────────────────────────────
const NAV = {
  client: [
    { label: "Dashboard", to: "/client/dashboard", icon: LayoutDashboard },
    { label: "Conversations", to: "/client/chat", icon: MessageSquare },
    { label: "Reservations", to: "/client/reservations", icon: CalendarDays },
    { label: "Recommendations", to: "/client/recommendations", icon: Sparkles },
    { label: "Profile", to: "/client/profile", icon: User },
    { label: "Settings", to: "/client/settings", icon: Settings },
  ],
  lawyer: [
    { label: "Dashboard", to: "/lawyer/dashboard", icon: LayoutDashboard },
    { label: "Cases", to: "/lawyer/cases", icon: Briefcase },
    { label: "Reservations", to: "/lawyer/reservations", icon: CalendarDays },
    { label: "Messages", to: "/lawyer/messages", icon: MessageSquare },
    { label: "Documents", to: "/lawyer/documents", icon: FileText },
    { label: "Profile", to: "/lawyer/profile/edit", icon: User },
    { label: "Subscription", to: "/lawyer/subscription", icon: CreditCard },
    { label: "Boost Profile", to: "/lawyer/boost", icon: Zap },
    { label: "Settings", to: "/lawyer/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Cases", to: "/admin/cases", icon: Briefcase },
    { label: "Reservations", to: "/admin/reservations", icon: CalendarDays },
    { label: "Messages", to: "/admin/messages", icon: MessageSquare },
    { label: "Documents", to: "/admin/documents", icon: FileText },
    { label: "Lawyers", to: "/admin/lawyers", icon: UserCheck },
    { label: "Users", to: "/admin/users", icon: Users },
    { label: "Profile", to: "/admin/profile", icon: User },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
};

const ROLE_SUBTITLE = {
  client: "Legal Marketplace",
  lawyer: "Legal Workspace",
  admin: "Legal Workspace",
};

/**
 * Sidebar
 *
 * Props:
 *   user — { name: string, role: 'client' | 'lawyer' | 'admin', avatarUrl?: string }
 *
 * The role prop controls which nav items are shown.
 * This comes from your auth store (see auth.store.js).
 */
export default function Sidebar({ user = { name: "Guest", role: "client" } }) {
  const location = useLocation();
  const role = user?.role ?? "client";
  const navItems = NAV[role] ?? NAV.client;

  const initials =
    user.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#1a2b6b] flex items-center justify-center flex-shrink-0">
            {/* Simple abstract "LL" mark */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="1"
                y="4"
                width="6"
                height="8"
                rx="1"
                fill="white"
                opacity="0.9"
              />
              <rect
                x="9"
                y="1"
                width="6"
                height="11"
                rx="1"
                fill="white"
                opacity="0.6"
              />
            </svg>
          </div>
          <div>
            <p className="text-[#1a2b6b] font-bold text-base leading-none">
              LawyerLink
            </p>
            <p className="text-[10px] text-gray-400 tracking-wide mt-0.5 uppercase">
              {ROLE_SUBTITLE[role]}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
        {navItems.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[#1a2b6b] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#1a2b6b]"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-white" : "text-gray-400"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Storage widget — admin only (matches screenshot) */}
      {role === "admin" && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mb-1.5">
            Storage Status
          </p>
          <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-amber-500 rounded-full" />
          </div>
          <p className="text-[10px] text-amber-600 mt-1">
            75% of Legal Archive used.
          </p>
        </div>
      )}

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 capitalize truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
