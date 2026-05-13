import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { adminApi } from "../../api/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

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
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardStats(),
      adminApi.getDashboardCharts(),
    ])
      .then(([statsData, chartsData]) => {
        setStats(statsData);
        setCharts(chartsData);
      })
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

          {/* Subscription Revenue Chart */}
          <div className="bg-surface-container-lowest p-8 rounded-xl custom-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Subscription Revenue</h3>
              <p className="text-sm font-semibold text-on-surface-variant">{formatCurrency(stats.total_subscription_revenue)} total</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts?.subscription_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant, #e0e0e0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-outline, #a0a0a0)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-outline, #a0a0a0)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(val) => [formatCurrency(val), "Revenue"]}
                />
                <Bar dataKey="value" fill="var(--color-primary, #2563eb)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Boost Revenue Chart */}
          <div className="bg-surface-container-lowest p-8 rounded-xl custom-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Boost Revenue</h3>
              <p className="text-sm font-semibold text-on-surface-variant">{formatCurrency(stats.total_boost_revenue)} total</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts?.boost_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant, #e0e0e0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-outline, #a0a0a0)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-outline, #a0a0a0)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(val) => [formatCurrency(val), "Revenue"]}
                />
                <Bar dataKey="value" fill="var(--color-secondary, #7c3aed)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reservations Chart */}
          <div className="bg-surface-container-lowest p-8 rounded-xl custom-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Reservations</h3>
              <p className="text-sm font-semibold text-on-surface-variant">{formatNumber(stats.total_reservations)} total</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={charts?.reservations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant, #e0e0e0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-outline, #a0a0a0)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-outline, #a0a0a0)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(val) => [formatNumber(val), "Reservations"]}
                />
                <Line type="monotone" dataKey="value" stroke="var(--color-tertiary, #0891b2)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
