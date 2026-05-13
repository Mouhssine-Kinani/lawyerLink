import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { lawyerApi } from "../../api/lawyer.api";
import { clientApi } from "../../api/client.api";

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
  const navigate = useNavigate();
  const [lawyerImage, setLawyerImage] = useState(null);
  const [clientImage, setClientImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      if (user?.role === "lawyer") {
        lawyerApi
          .getMyProfile(token)
          .then((data) => setLawyerImage(data.image_url))
          .catch(() => {});
      } else if (user?.role === "client") {
        clientApi
          .getMyProfile(token)
          .then((data) => setClientImage(data.image_url))
          .catch(() => {});
      }
    }
  }, [isAuthenticated, user?.role, token]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(() => {
      lawyerApi
        .searchLawyers(searchQuery.trim(), 8)
        .then((data) => {
          setSearchResults(data || []);
          setShowSearchResults(data?.length > 0);
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false));
    }, 300);
  }, [searchQuery]);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
  };

  function handleSelectLawyer(lawyerId) {
    setShowSearchResults(false);
    setSearchQuery("");
    if (user?.role === "lawyer" && user?.id == lawyerId) {
      navigate("/lawyer/profile");
    } else {
      navigate(`/client/lawyers/${lawyerId}`);
    }
  }

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
          {isAuthenticated && (
            <div className="hidden md:flex gap-6 text-sm font-medium">
              {user?.role === "admin" ? (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `hover:text-secondary transition-colors ${
                      isActive ? "text-secondary" : "text-on-surface"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              ) : (
                <>
                  {user?.role === "lawyer" && (
                    <NavLink
                      to="/lawyer/dashboard"
                      className={({ isActive }) =>
                        `hover:text-secondary transition-colors ${
                          isActive ? "text-secondary" : "text-on-surface"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                  )}
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
                  ) }
                </>
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
                <div className="relative w-full max-w-xl" ref={searchRef}>
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Search lawyers by name, firm, or specialty..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchResults(true);
                    }}
                  />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden z-50">
                      {searchResults.map((lawyer) => (
                        <button
                          key={lawyer.user_id}
                          onClick={() => handleSelectLawyer(lawyer.user_id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0">
                            {lawyer.image_url ? (
                              <img className="w-full h-full object-cover" alt="" src={imageUrl(lawyer.image_url)} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-bold text-xs">
                                {(lawyer.first_name?.[0] || "") + (lawyer.last_name?.[0] || "")}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {lawyer.first_name} {lawyer.last_name}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate">{lawyer.firm || "Legal Professional"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {user?.role === "client" && (
                <div className="relative w-full max-w-xl" ref={searchRef}>
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl pl-12 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Search lawyers by name, firm, or specialty..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchResults(true);
                    }}
                  />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden z-50">
                      {searchResults.map((lawyer) => (
                        <button
                          key={lawyer.user_id}
                          onClick={() => handleSelectLawyer(lawyer.user_id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0">
                            {lawyer.image_url ? (
                              <img className="w-full h-full object-cover" alt="" src={imageUrl(lawyer.image_url)} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-bold text-xs">
                                {(lawyer.first_name?.[0] || "") + (lawyer.last_name?.[0] || "")}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {lawyer.first_name} {lawyer.last_name}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate">{lawyer.firm || "Legal Professional"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(user?.role === "lawyer" || user?.role === "admin") && (
                <Link
                  to={user?.role === "admin" ? "/admin/dashboard" : "/lawyer/profile"}
                  className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant/20 hover:border-primary/40 transition-all flex-shrink-0"
                  title={user?.role === "admin" ? "Admin Dashboard" : "Edit Profile"}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Profile"
                    src={imageUrl(lawyerImage) || PLACEHOLDER_AVATAR}
                  />
                </Link>
              )}
              {user?.role === "client" && (
                <Link
                  to="/client/profile"
                  className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant/20 hover:border-primary/40 transition-all flex-shrink-0"
                  title="My Profile"
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Profile"
                    src={imageUrl(clientImage) || PLACEHOLDER_AVATAR}
                  />
                </Link>
              )}
              <span className="text-sm font-medium text-on-surface-variant">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white primary-gradient shadow-lg shadow-primary/20 cursor-pointer"
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
