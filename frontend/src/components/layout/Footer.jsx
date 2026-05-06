import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-primary font-headline text-2xl font-bold mb-6 block">
              LawyerLink
            </Link>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Connecting citizens with top-tier legal representation through innovative AI matching technology. Modernizing justice, one case at a time.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-widest">Platform</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li>
                <Link to="/client/lawyers" className="hover:text-secondary transition-colors">
                  Find Lawyers
                </Link>
              </li>
              <li>
                <Link to="/client/chat" className="hover:text-secondary transition-colors">
                  AI Matching
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  For Attorneys
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-widest">Support</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Legal Disclaimer
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-widest">Newsletter</h5>
            <p className="text-sm text-on-surface-variant mb-4">Weekly legal insights and platform updates.</p>
            <div className="flex gap-2">
              <input
                className="bg-surface-container-high border-none rounded-lg text-sm px-4 py-2 w-full focus:ring-1 focus:ring-secondary/30"
                placeholder="Email"
                type="email"
              />
              <button className="bg-primary px-4 py-2 rounded-lg text-on-primary">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-outline font-medium">© 2024 LawyerLink SaaS. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-outline hover:text-secondary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">language</span>
            </a>
            <a className="text-outline hover:text-secondary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">mail</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
