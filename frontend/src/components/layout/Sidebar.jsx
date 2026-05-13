import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navConfig = {
  admin: [
    { path: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/admin/users", icon: "person", label: "Users" },
    { path: "/admin/lawyers/approval", icon: "gavel", label: "Lawyer Approval" },
    { path: "/admin/reservations", icon: "event_available", label: "Reservations" },
  ],
  lawyer: [
    { path: "/lawyer/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/lawyer/reservations", icon: "event_available", label: "Reservations" },
    { path: "/lawyer/profile", icon: "person", label: "Profile" },
    { path: "/lawyer/subscription", icon: "payments", label: "Subscription" },
    { path: "/lawyer/boost", icon: "trending_up", label: "Boost" },
  ],
  client: [
    { path: "/client/lawyers", icon: "gavel", label: "Find Lawyers" },
    { path: "/client/chat", icon: "smart_toy", label: "AI Assistant" },
    { path: "/client/reservations", icon: "event_available", label: "Reservations" },
    { path: "/client/my-reviews", icon: "star", label: "My Reviews" },
  ],
};

export default function Sidebar({ children }) {
  const { user } = useAuth();
  const role = user?.role || "client";
  const navItems = navConfig[role] || navConfig.client;

  const getUserName = () => {
    if (!user) return "Guest";
    return user.email?.split("@")[0] || "User";
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "Admin";
      case "lawyer":
        return "Legal Professional";
      case "client":
        return "Premium Client";
      default:
        return "User";
    }
  };

  return (
    <aside className="w-72 glass-sidebar border-r border-outline-variant/30 flex flex-col z-20 h-screen sticky top-0">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined">gavel</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">LawyerLink</h1>
        </div>
        <p className="text-xs font-semibold text-outline tracking-widest pl-1">Legal Workspace</p>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-surface-container text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
        {children && (
          <div className="pt-4 border-t border-outline-variant/20">
            {children}
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">
            {getUserName().charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold">{getUserName()}</p>
            <p className="text-[10px] text-outline uppercase font-semibold">{getRoleLabel()}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
