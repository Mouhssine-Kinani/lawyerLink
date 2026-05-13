import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { adminApi } from "../../api/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PAGE_SIZE = 15;

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container-low transition-colors"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
            p === page
              ? "primary-gradient text-white"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container-low transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export default function UsersPage() {
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clientTotal, setClientTotal] = useState(0);
  const [lawyerTotal, setLawyerTotal] = useState(0);
  const [clientPage, setClientPage] = useState(1);
  const [lawyerPage, setLawyerPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminApi.getClients((clientPage - 1) * PAGE_SIZE, PAGE_SIZE),
      adminApi.getLawyers((lawyerPage - 1) * PAGE_SIZE, PAGE_SIZE),
    ])
      .then(([clientData, lawyerData]) => {
        setClients(clientData.items || []);
        setClientTotal(clientData.total || 0);
        setLawyers(lawyerData.items || []);
        setLawyerTotal(lawyerData.total || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientPage, lawyerPage]);

  const clientTotalPages = Math.ceil(clientTotal / PAGE_SIZE);
  const lawyerTotalPages = Math.ceil(lawyerTotal / PAGE_SIZE);

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
              <p className="text-on-surface-variant">Failed to load users</p>
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
        <main className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Users</h1>
            <p className="text-on-surface-variant body-lg max-w-2xl">
              Manage all clients and lawyers registered on the platform.
            </p>
          </header>

          {/* Clients Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">group</span>
                Clients
                <span className="text-sm font-normal text-on-surface-variant">({clientTotal} total)</span>
              </h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/10">
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Phone</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">City</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Region</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-outline italic">No clients found.</td>
                      </tr>
                    ) : (
                      clients.map((c) => (
                        <tr key={c.user_id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                            {c.first_name} {c.last_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{c.email}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{c.phone || "\u2014"}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{c.city || "\u2014"}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{c.region || "\u2014"}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={clientPage} totalPages={clientTotalPages} onPageChange={setClientPage} />
          </section>

          {/* Lawyers Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">gavel</span>
                Lawyers
                <span className="text-sm font-normal text-on-surface-variant">({lawyerTotal} total)</span>
              </h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/10">
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Firm</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Specialties</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Rating</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {lawyers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-outline italic">No lawyers found.</td>
                      </tr>
                    ) : (
                      lawyers.map((l) => (
                        <tr key={l.user_id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                            {l.first_name} {l.last_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{l.email}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{l.firm || "\u2014"}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{l.specialties || "\u2014"}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold">
                              <span className="material-symbols-outlined text-amber-500 text-[16px]">star</span>
                              {l.rating_avg ? l.rating_avg.toFixed(1) : "\u2014"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                l.is_active
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {l.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={lawyerPage} totalPages={lawyerTotalPages} onPageChange={setLawyerPage} />
          </section>
        </main>
      </div>
    </div>
  );
}
