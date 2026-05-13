import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { reservationApi } from "../../api/reservation.api";
import { lawyerApi } from "../../api/lawyer.api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112">
      <rect width="112" height="112" fill="#e0e0e0"/>
      <path fill="#bdbdbd" d="M56 56c12.4 0 22.5-10.1 22.5-22.5S68.4 11 56 11 33.5 21.1 33.5 33.5 43.6 56 56 56zm0 11.2C40.3 67.2 11 76.5 11 95v6h90v-6c0-18.5-29.3-27.8-45-27.8z"/>
    </svg>`,
  );

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

function formatReservationDate(dateStr) {
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

function getStatusStyle(status) {
  switch (status) {
    case "pending":
      return {
        border: "border-l-4 border-secondary",
        badge: "bg-secondary-fixed text-on-secondary-fixed",
        label: "Pending",
      };
    case "accepted":
      return {
        border: "border-l-4 border-tertiary",
        badge: "bg-tertiary-fixed text-on-tertiary-fixed",
        label: "Confirmed",
      };
    case "completed":
      return {
        border: "border-l-4 border-outline",
        badge: "bg-surface-container-high text-on-surface-variant",
        label: "Completed",
      };
    case "rejected":
      return {
        border: "border-l-4 border-error",
        badge: "bg-error-container text-on-error-container",
        label: "Rejected",
      };
    case "cancelled":
      return {
        border: "border-l-4 border-outline",
        badge: "bg-surface-container-high text-on-surface-variant",
        label: "Cancelled",
      };
    default:
      return {
        border: "border-l-4 border-secondary",
        badge: "bg-secondary-fixed text-on-secondary-fixed",
        label: status,
      };
  }
}

const STATUS_FILTER_MAP = {
  All: null,
  Pending: "pending",
  Confirmed: "accepted",
  Completed: "completed",
};

const FILTERS = ["All", "Pending", "Confirmed", "Completed"];

export default function MyReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [lawyers, setLawyers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelling, setCancelling] = useState(null);

  async function loadReservations() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const statusParam = STATUS_FILTER_MAP[activeFilter];
      const data = await reservationApi.getReservations(statusParam, 50, token);
      setReservations(data);

      const lawyerIds = [...new Set(data.map((r) => r.lawyer_id))];
      const results = await Promise.all(
        lawyerIds.map((id) => lawyerApi.getLawyerById(id).catch(() => null)),
      );
      const map = {};
      lawyerIds.forEach((id, i) => {
        if (results[i]) map[id] = results[i];
      });
      setLawyers(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, [activeFilter, token]);

  async function handleCancel(reservationId) {
    if (!window.confirm("Cancel this reservation?")) return;
    setCancelling(reservationId);
    try {
      await reservationApi.cancelReservation(reservationId, token);
      await loadReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(null);
    }
  }

  const displayed = reservations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const lawyer = lawyers[r.lawyer_id];
    const name = lawyer
      ? `${lawyer.first_name || ""} ${lawyer.last_name || ""}`.toLowerCase()
      : "";
    const firm = (lawyer?.firm || "").toLowerCase();
    const notes = (r.notes || "").toLowerCase();
    return name.includes(q) || firm.includes(q) || notes.includes(q);
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
            <Link
              to="/client/lawyers"
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md"
            >
              Book New Consultation
            </Link>
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
                placeholder="Search lawyers, firms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex p-1 bg-surface-container-low rounded-xl">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
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
              <p className="text-on-surface-variant mt-4 text-lg font-medium">
                No reservations found
              </p>
              <Link
                to="/client/lawyers"
                className="mt-4 inline-block bg-primary text-on-primary px-6 py-3 rounded-lg text-sm font-bold"
              >
                Find a Lawyer
              </Link>
            </div>
          )}

          {/* Reservation Cards */}
          {!loading && displayed.length > 0 && (
            <div className="space-y-6">
              {displayed.map((r) => {
                const lawyer = lawyers[r.lawyer_id];
                const fmt = formatReservationDate(r.reservation_date);
                const style = getStatusStyle(r.status);

                return (
                  <div
                    key={r.id}
                    className={`bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(13,28,46,0.04)] overflow-hidden transition-transform hover:scale-[1.005] ${style.border}`}
                  >
                    <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Lawyer Info */}
                      <div className="flex items-center gap-5 min-w-[300px]">
                        <img
                          className="w-16 h-16 rounded-full object-cover"
                          src={imageUrl(lawyer?.image_url) || PLACEHOLDER_AVATAR}
                          alt={lawyer ? `${lawyer.first_name} ${lawyer.last_name}` : "Lawyer"}
                        />
                        <div>
                          <h3 className="text-lg font-bold text-on-surface leading-tight">
                            {lawyer
                              ? `${lawyer.first_name || ""} ${lawyer.last_name || ""}`
                              : "Loading..."}
                          </h3>
                          <p className="text-sm text-on-surface-variant">{lawyer?.firm || ""}</p>
                          <div className="flex gap-3 mt-1">
                            {lawyer?.city && (
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {lawyer.city}
                                {lawyer.region ? `, ${lawyer.region}` : ""}
                              </span>
                            )}
                            {lawyer?.rating_avg != null && (
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-tertiary flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">star</span>
                                {lawyer.rating_avg.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1">
                            Appointment
                          </p>
                          <p className="text-sm font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            {fmt.date}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">{fmt.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1">
                            Notes
                          </p>
                          <p className="text-sm font-medium leading-relaxed italic">
                            {r.notes ? `"${r.notes}"` : "No notes provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1">
                            Status
                          </p>
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${style.badge}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 min-w-[140px]">
                        {r.status === "pending" && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            disabled={cancelling === r.id}
                            className="flex-1 bg-error text-on-error py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {cancelling === r.id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                        {r.status === "completed" && (
                          <Link
                            to={`/client/reviews?lawyerId=${r.lawyer_id}`}
                            className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors text-center"
                          >
                            Leave Review
                          </Link>
                        )}
                        <Link
                          to={`/client/lawyers/${r.lawyer_id}`}
                          className="flex-1 bg-surface-container-low text-on-surface-variant py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high transition-colors text-center"
                        >
                          View Profile
                        </Link>
                        {lawyer?.hourly_rate && (
                          <span className="text-[10px] text-center text-outline font-semibold">
                            ${lawyer.hourly_rate}/hr
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && displayed.length > 0 && (
            <div className="pt-8 border-t border-outline-variant flex items-center justify-between">
              <p className="text-sm text-on-surface-variant font-medium">
                Showing {displayed.length} of {reservations.length} reservation
                {reservations.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button
                  disabled
                  className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="px-4 py-2 rounded-lg bg-surface-container-low text-primary font-bold text-sm">
                  1
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-10 py-8 bg-surface-container-lowest text-on-surface-variant border-t border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
            <p className="text-xs font-medium tracking-wide">
              &copy; 2024 LawyerLink SaaS. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Terms of Service", "Privacy Policy", "Contact Support", "Legal Disclaimer"].map(
                (link) => (
                  <a
                    key={link}
                    className="text-xs font-bold uppercase tracking-widest hover:text-primary"
                    href="#"
                  >
                    {link}
                  </a>
                ),
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
