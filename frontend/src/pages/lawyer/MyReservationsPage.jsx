import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { reservationApi } from "../../api/reservation.api";

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

function formatReservationDate(dateStr) {
  if (!dateStr) return { date: "", time: "" };
  const [datePart, timePart] = dateStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const hour = Number(timePart.split(":")[0]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dateLabel = `${months[month - 1]} ${day}, ${year}`;

  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const start = `${String(displayHour).padStart(2, "0")}:00 ${ampm}`;

  const endHour = hour + 1;
  const endAmpm = endHour >= 12 ? "PM" : "AM";
  const endDisplay = endHour % 12 || 12;
  const end = `${String(endDisplay).padStart(2, "0")}:00 ${endAmpm}`;

  return { date: dateLabel, time: `${start} - ${end}` };
}

export default function LawyerMyReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadReservations() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeFilter === "All" ? null : activeFilter === "Confirmed" ? "accepted" : activeFilter.toLowerCase();
      const data = await reservationApi.getReservationsWithClients(statusParam, 100, token);
      setReservations(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, [activeFilter, token]);

  async function handleAction(id, status) {
    setActionLoading(id);
    try {
      await reservationApi.updateReservation(id, { status }, token);
      await loadReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const displayed = reservations.filter((r) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Confirmed") return r.status === "accepted";
    return r.status === activeFilter.toLowerCase();
  }).filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${r.client_first_name || ""} ${r.client_last_name || ""}`.toLowerCase();
    const email = (r.client_email || "").toLowerCase();
    const phone = (r.client_phone || "").toLowerCase();
    const notes = (r.notes || "").toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || notes.includes(q);
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-10 py-12 max-w-7xl w-full mx-auto space-y-10 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">My Reservations</h1>
            <span className="text-sm text-on-surface-variant font-medium">{reservations.length} total</span>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center bg-surface-container-high rounded-xl px-4 py-2 w-full md:max-w-md focus-within:bg-surface-container-lowest transition-all duration-300 ring-1 ring-transparent focus-within:ring-primary/20">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline"
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex p-1 bg-surface-container-low rounded-xl">
              {["All", "Pending", "Confirmed", "Completed", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    activeFilter === f
                      ? "bg-surface-container-lowest shadow-sm text-primary"
                      : "text-on-surface-variant hover:text-primary font-semibold"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && displayed.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-outline">event_busy</span>
              <p className="text-on-surface-variant mt-4 text-lg font-medium">No reservations found</p>
            </div>
          )}

          {/* Reservations List */}
          {!loading && displayed.length > 0 && (
            <div className="space-y-6">
              {displayed.map((r) => {
                const fmt = formatReservationDate(r.reservation_date);
                const fullName = [r.client_first_name, r.client_last_name].filter(Boolean).join(" ") || "Client";

                return (
                  <div
                    key={r.id}
                    className={`bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(13,28,46,0.04)] overflow-hidden transition-transform hover:scale-[1.005] border-l-4 ${
                      r.status === "pending" ? "border-secondary" :
                      r.status === "accepted" ? "border-tertiary" :
                      r.status === "completed" ? "border-outline" :
                      r.status === "rejected" ? "border-error" :
                      "border-outline"
                    }`}
                  >
                    <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Client Info */}
                      <div className="flex items-center gap-5 min-w-[300px]">
                        <img
                          className="w-16 h-16 rounded-full object-cover"
                          src={imageUrl(r.client_image_url) || PLACEHOLDER_AVATAR}
                          alt={fullName}
                        />
                        <div>
                          <h3 className="text-lg font-bold text-on-surface leading-tight">{fullName}</h3>
                          <p className="text-sm text-on-surface-variant">{r.client_email || ""}</p>
                          {r.client_phone && (
                            <div className="flex gap-3 mt-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">call</span>
                                {r.client_phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1">Appointment</p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            {fmt.date}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">{fmt.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1">Case Summary</p>
                          <p className="text-sm font-medium leading-relaxed italic">
                            &ldquo;{r.notes || "No notes provided"}&rdquo;
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              r.status === "accepted" ? "bg-tertiary-fixed text-on-tertiary-fixed" :
                              r.status === "pending" ? "bg-secondary-fixed text-on-secondary-fixed" :
                              r.status === "completed" ? "bg-surface-container-high text-on-surface-variant" :
                              r.status === "rejected" ? "bg-error-container text-on-error-container" :
                              "bg-surface-container-high text-on-surface-variant"
                            }`}>
                              {r.status === "accepted" ? "Confirmed" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex lg:flex-col gap-2 min-w-[140px]">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(r.id, "accepted")}
                              disabled={actionLoading === r.id}
                              className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoading === r.id ? "..." : "Accept"}
                            </button>
                            <button
                              onClick={() => handleAction(r.id, "rejected")}
                              disabled={actionLoading === r.id}
                              className="flex-1 bg-surface-container-low text-on-surface-variant py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoading === r.id ? "..." : "Reject"}
                            </button>
                          </>
                        )}
                        {r.status === "accepted" && (
                          <button
                            onClick={() => handleAction(r.id, "completed")}
                            disabled={actionLoading === r.id}
                            className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === r.id ? "..." : "Mark Completed"}
                          </button>
                        )}
                        {(r.status === "completed" || r.status === "rejected" || r.status === "cancelled") && (
                          <span className="text-[10px] text-center text-outline font-semibold py-2">
                            {r.status === "completed" ? "Completed" : r.status === "rejected" ? "Rejected" : "Cancelled"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="px-10 py-8 bg-surface-container-lowest text-on-surface-variant border-t border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
            <p className="text-xs font-medium tracking-wide">&copy; 2024 LawyerLink SaaS. All rights reserved.</p>
            <div className="flex gap-6">
              {["Terms of Service", "Privacy Policy", "Contact Support", "Legal Disclaimer"].map((link) => (
                <a key={link} className="text-xs font-bold uppercase tracking-widest hover:text-primary" href="#">{link}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
