import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-outline-variant/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-primary font-headline text-2xl font-bold tracking-tight">
            LawyerLink
          </Link>
          {isAuthenticated && user?.role !== "admin" && (
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <NavLink
                to="/client/lawyers"
                className={({ isActive }) =>
                  `hover:text-secondary transition-colors ${
                    isActive ? "text-secondary" : "text-on-surface"
                  }`
                }
              >
                Find Lawyers
              </NavLink>
              {user?.role !== "lawyer" && (
                <NavLink
                  to="/client/chat"
                  className={({ isActive }) =>
                    `hover:text-secondary transition-colors ${
                      isActive ? "text-secondary" : "text-on-surface"
                    }`
                  }
                >
                  AI Assistant
                </NavLink>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-on-surface hover:text-secondary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="gradient-cta px-6 py-2.5 rounded-xl text-sm font-semibold text-on-primary shadow-lg hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user?.role === "lawyer" && (
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                    search
                  </span>
                  <input
                    className="pl-11 pr-4 py-2.5 bg-surface-container-low border-none rounded-full w-80 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Search cases, clients..."
                    type="text"
                  />
                </div>
              )}
              {user?.role === "client" && (
                <div className="relative w-full max-w-xl">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Search for cases, documents, or counsel..."
                    type="text"
                  />
                </div>
              )}
              <span className="text-sm font-medium text-on-surface-variant">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white primary-gradient shadow-lg shadow-primary/20"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
