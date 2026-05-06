import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Platform Oversight</h1>
            <p className="text-on-surface-variant body-lg max-w-2xl">
              Monitor systemic performance, legal professional onboarding, and AI verification protocols in real-time.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">group</span>
                <span className="text-xs font-bold px-2 py-1 bg-surface-container-low text-secondary rounded group-hover:bg-primary-container group-hover:text-on-primary">+12%</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Total Users</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">42,891</h2>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">gavel</span>
                <span className="text-xs font-bold px-2 py-1 bg-surface-container-low text-secondary rounded group-hover:bg-primary-container group-hover:text-on-primary">+4.2%</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Active Lawyers</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">3,120</h2>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">payments</span>
                <span className="text-xs font-bold px-2 py-1 bg-surface-container-low text-secondary rounded group-hover:bg-primary-container group-hover:text-on-primary">+28%</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Revenue</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">$1.4M</h2>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-on-primary">calendar_month</span>
                <span className="text-xs font-bold px-2 py-1 bg-surface-container-low text-secondary rounded group-hover:bg-primary-container group-hover:text-on-primary">+15%</span>
              </div>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant group-hover:text-on-primary-container">Reservations</p>
                <h2 className="text-3xl font-bold text-on-surface group-hover:text-on-primary">12,402</h2>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
