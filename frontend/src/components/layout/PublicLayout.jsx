import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * PublicLayout — wraps all public-facing pages (landing, lawyer list,
 * lawyer profile, booking, login, register, etc.)
 *
 * Usage:
 *   <Route element={<PublicLayout />}>
 *     <Route path="/" element={<HomePage />} />
 *     <Route path="/lawyers" element={<LawyerListPage />} />
 *     ...
 *   </Route>
 */
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* pt-16 offsets the fixed navbar height */}
      <main className="flex-1 pt-16">{children}</main>

      <Footer />
    </div>
  );
}
