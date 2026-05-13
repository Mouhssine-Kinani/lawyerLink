import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { adminApi } from "../../api/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getReservations(statusFilter || null)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-8 lg:p-12 flex items-center justify-center">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-error">error</span>
              <p className="text-on-surface-variant">Failed to load reservations</p>
              <p className="text-sm text-outline">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white primary-gradient"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">Reservations</h1>
              <p className="text-on-surface-variant body-lg">
                View all client bookings and their statuses.
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </header>

          <div className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Lawyer</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Firm</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-outline italic">
                        No reservations found.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">#{r.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-on-surface">
                            {r.client_first_name} {r.client_last_name}
                          </div>
                          <div className="text-xs text-on-surface-variant">{r.client_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-on-surface">
                            {r.lawyer_first_name} {r.lawyer_last_name}
                          </div>
                          <div className="text-xs text-on-surface-variant">{r.lawyer_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{r.lawyer_firm || "\u2014"}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {new Date(r.reservation_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">
                          {r.notes || "\u2014"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}