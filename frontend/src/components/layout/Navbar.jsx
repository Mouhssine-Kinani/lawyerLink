import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { lawyerApi } from "../../api/lawyer.api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112">
    <rect width="112" height="112" fill="#e0e0e0"/>
    <path fill="#bdbdbd" d="M56 56c12.4 0 22.5-10.1 22.5-22.5S68.4 11 56 11 33.5 21.1 33.5 33.5 43.6 56 56 56zm0 11.2C40.3 67.2 11 76.5 11 95v6h90v-6c0-18.5-29.3-27.8-45-27.8z"/>
  </svg>`,
  );

export default function Navbar() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const [lawyerImage, setLawyerImage] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === "lawyer" && token) {
      lawyerApi
        .getMyProfile(token)
        .then((data) => setLawyerImage(data.image_url))
        .catch(() => {});
    }
  }, [isAuthenticated, user?.role, token]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-outline-variant/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-primary font-headline text-2xl font-bold tracking-tight"
          >
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
              {user?.role === "lawyer" && (
                <Link
                  to="/lawyer/profile"
                  className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant/20 hover:border-primary/40 transition-all flex-shrink-0"
                  title="Edit Profile"
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Profile"
                    src={imageUrl(lawyerImage) || PLACEHOLDER_AVATAR}
                  />
                </Link>
              )}
              <span className="text-sm font-medium text-on-surface-variant">
                {user?.email}
              </span>
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
