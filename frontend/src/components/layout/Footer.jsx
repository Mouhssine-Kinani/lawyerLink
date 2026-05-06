import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0f1f5c] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">LawyerLink</h2>
            <p className="text-sm text-blue-200 leading-relaxed">
              Connecting citizens with top-tier legal representation through
              innovative AI matching technology. Modernizing justice, one case
              at a time.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              Platform
            </h3>
            <ul className="space-y-2">
              {["Find Lawyers", "AI Matching", "For Attorneys", "Pricing"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-sm text-blue-200 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Contact Support",
                "Legal Disclaimer",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              Newsletter
            </h3>
            <p className="text-sm text-blue-200">
              Weekly legal insights and platform updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 text-sm px-3 py-2 rounded-l-md bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:border-white"
              />
              <button className="bg-[#1a2b6b] hover:bg-blue-600 transition-colors px-4 py-2 rounded-r-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Divider + Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-blue-300">
            © 2024 LawyerLink SaaS. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-blue-300">
            {/* Globe / Bank / Shield icons */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
