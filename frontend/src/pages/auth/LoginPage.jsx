import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] bg-surface-container-high/30 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-10 left-[-5%] w-[30%] h-[30%] bg-secondary-fixed/20 rounded-full blur-[80px] -z-10"></div>

        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Editorial Section */}
          <div className="hidden lg:flex flex-col flex-1 gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary text-xs font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs">verified</span> Secure Legal Network
              </div>
              <h1 className="text-5xl font-bold text-on-surface leading-[1.1] tracking-tight">
                Advancing the <br /> <span className="text-secondary">Digital Jurist.</span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-md">
                Join the premium legal workspace designed for precision, clarity, and authority. Connect with verified professionals in a secure environment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-surface-container-lowest border border-white shadow-sm">
                <span className="material-symbols-outlined text-secondary mb-3">security</span>
                <h3 className="text-sm font-bold text-on-surface">Encrypted Data</h3>
                <p className="text-xs text-on-surface-variant mt-1">Socio-legal compliance with top-tier security.</p>
              </div>
              <div className="p-6 rounded-xl bg-surface-container-lowest border border-white shadow-sm">
                <span className="material-symbols-outlined text-secondary mb-3">history_edu</span>
                <h3 className="text-sm font-bold text-on-surface">Verified Credentials</h3>
                <p className="text-xs text-on-surface-variant mt-1">Automatic bar association validation.</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-[520px] bg-white/80 backdrop-blur-[20px] rounded-3xl p-8 md:p-12 relative shadow-[0_20px_40px_rgba(13,28,46,0.06)]">
            <div className="absolute left-0 top-12 bottom-12 w-1 bg-tertiary rounded-r-full"></div>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-on-surface">Welcome back</h2>
              <p className="text-on-surface-variant text-sm mt-2">Sign in to your LawyerLink account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-high border-none focus:ring-1 focus:ring-primary/30 focus:bg-white transition-all text-sm outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-high border-none focus:ring-1 focus:ring-primary/30 focus:bg-white transition-all text-sm outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-right">
                  <a className="text-xs text-secondary font-semibold hover:underline" href="/forgot-password">Forgot password?</a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Sign In"
                )}
              </button>

              <p className="text-center text-sm text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-secondary font-bold">Create one</Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
