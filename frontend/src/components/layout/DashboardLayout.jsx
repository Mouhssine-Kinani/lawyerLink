import Sidebar from "./Sidebar";

/**
 * DashboardLayout — wraps all authenticated dashboard pages.
 * Sidebar is fixed on the left; the content area scrolls independently.
 *
 * Props:
 *   user     — passed down to Sidebar  { name, role }
 *   children — the page content
 *
 * Usage:
 *   <Route element={<DashboardLayout user={currentUser} />}>
 *     <Route path="/client/dashboard" element={<ClientDashboard />} />
 *     <Route path="/client/reservations" element={<MyReservationsPage />} />
 *     ...
 *   </Route>
 */
export default function DashboardLayout({ user, children }) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] flex">
      {/* Fixed sidebar — 240px wide */}
      <Sidebar user={user} />

      {/* Content area — pushed right by sidebar width */}
      <div className="flex-1 ml-60 min-h-screen flex flex-col">
        <main className="flex-1 p-8">{children}</main>

        {/* Optional slim dashboard footer */}
        <footer className="px-8 py-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© 2024 LawyerLink. All rights reserved.</span>
            <div className="flex items-center gap-4">
              {["Privacy Policy", "Terms of Service", "Contact", "FAQ"].map(
                (l) => (
                  <a
                    key={l}
                    href="#"
                    className="hover:text-gray-600 transition-colors"
                  >
                    {l}
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
