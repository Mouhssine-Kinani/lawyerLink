import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { adminApi } from "../../api/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
              <p className="text-on-surface-variant">Failed to load dashboard data</p>
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
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Admin Dashboard</h1>
            <p className="text-on-surface-variant body-lg max-w-2xl">
              Monitor platform growth, legal professionals, and revenue in real-time.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">group</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Total Clients</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">{formatNumber(stats.total_clients)}</h2>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">gavel</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Total Lawyers</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">{formatNumber(stats.total_lawyers)}</h2>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">payments</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Total Revenue</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">{formatCurrency(stats.total_revenue)}</h2>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl custom-shadow">
            <h3 className="text-lg font-bold text-on-surface mb-6">Revenue Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">subscriptions</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Subscription Revenue</p>
                  <p className="text-xl font-bold text-on-surface">{formatCurrency(stats.total_subscription_revenue)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Boost Revenue</p>
                  <p className="text-xl font-bold text-on-surface">{formatCurrency(stats.total_boost_revenue)}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
