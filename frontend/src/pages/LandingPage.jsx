import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
 
export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body">
      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary-container to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-tertiary-fixed-variant text-xs font-bold tracking-wider uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
              Powered by Legal AI
            </span>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-on-surface leading-[1.1] mb-8 -tracking-[0.02em]">
              Find the Right <span className="text-secondary">Lawyer</span> for Your Case.
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-12 max-w-xl">
              Experience the next generation of legal consultation. Our proprietary AI matches your specific legal needs with elite attorneys in seconds, ensuring precision, trust, and authority.
            </p>
            {/* Search Box (Bento Style) */}
            <div className="bg-surface-container-lowest shadow-[0_20px_40px_rgba(13,28,46,0.06)] rounded-2xl p-2 flex flex-col md:flex-row items-stretch gap-2 border border-outline-variant/10">
              <div className="flex-1 flex items-center px-4 py-3 gap-3 border-r border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary">gavel</span>
                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-sm placeholder:text-outline" placeholder="Specialty (e.g. Corporate)" type="text" />
              </div>
              <div className="flex-1 flex items-center px-4 py-3 gap-3 border-r border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-sm placeholder:text-outline" placeholder="City" type="text" />
              </div>
              <div className="flex-1 flex items-center px-4 py-3 gap-3">
                <span className="material-symbols-outlined text-secondary">translate</span>
                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-sm placeholder:text-outline" placeholder="Language" type="text" />
              </div>
              <button className="bg-gradient-to-br from-primary to-primary-container px-8 py-4 rounded-xl text-on-primary font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                Search <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(13,28,46,0.06)]">
              <img alt="Professional Lawyer" className="w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1rjbPv9HQXFipXT7tsuOH1CXhmLjKMsvcGIGRjOujZdiCzUn3VhbB9AswjlvVs2OGcWONO7lKFSlnlukeEVBq1BwjbR1guGB7_eT4NezgPUIkcMwpRLa_1PZn0nCr62gJb9USki7wuijijSl7Xn-12-0wlvn4GpjYb2VHwQZWRfJc37EeJGzxHiU__uJpiUzGf5Ro6CUuIyRXPY0DJnWibEukjxkJIj_6lb5HbDg4iO-jmFyKA4nvB_F-B2edhiALCRGiykqy76mC" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-[20px] p-6 rounded-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">JD</div>
                  <div>
                    <h4 className="font-bold text-on-surface">Jonathan Doe</h4>
                    <p className="text-xs text-on-surface-variant font-medium">Intellectual Property Specialist</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-on-tertiary-container/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">Precision-Matched Legal Representation</h2>
            <div className="w-20 h-1 bg-on-tertiary-container mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-[120px] font-bold text-on-surface/5 absolute -top-16 left-0 select-none">01</div>
              <div className="relative z-10 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest shadow-[0_20px_40px_rgba(13,28,46,0.06)] flex items-center justify-center text-secondary mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-4">Submit Your Case</h3>
                <p className="text-on-surface-variant leading-relaxed">Provide high-level details about your legal situation via our secure, encrypted intake portal.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative">
              <div className="text-[120px] font-bold text-on-surface/5 absolute -top-16 left-0 select-none">02</div>
              <div className="relative z-10 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest shadow-[0_20px_40px_rgba(13,28,46,0.06)] flex items-center justify-center text-secondary mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-4">AI Matching</h3>
                <p className="text-on-surface-variant leading-relaxed">Our JuristAI analyzes track records, win rates, and specialties to find your perfect legal match.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <div className="text-[120px] font-bold text-on-surface/5 absolute -top-16 left-0 select-none">03</div>
              <div className="relative z-10 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest shadow-[0_20px_40px_rgba(13,28,46,0.06)] flex items-center justify-center text-secondary mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-4">Secure Consultation</h3>
                <p className="text-on-surface-variant leading-relaxed">Review profiles and book a consultation instantly with your selected elite attorney.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Elite Attorneys */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-headline font-bold text-on-surface mb-4 tracking-tight">Featured Elite Attorneys</h2>
              <p className="text-on-surface-variant max-w-lg">The top 1% of legal practitioners across multiple jurisdictions, vetted for excellence and ethics.</p>
            </div>
            <a className="text-secondary font-bold flex items-center gap-2 hover:underline" href="/client/lawyers">
              View All Attorneys <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Attorney Card 1 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(13,28,46,0.06)] transition-transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img alt="Attorney" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkqlWYoBJob_K_X2ZqQ_cnhDr36gl6P96CNgAor0MaR0M2cG9xhimQ9Mxhec-17Z1EmModvAh5uEH8ZOgzQAUp7yYu0KycGLZgcJfB8WdzvOkCau3vwhxR62M00gjSyPPWk2diV9f-dBrmXxuC1kWPrGydk9q-Yb2nXmb35Xax5bTVDzcnXJ_PwNOK-q7_edIQX-_cJ5uGQK8ObhMwBIfQmbjLcZ_XdDEZnX7WIInxW2_qq3Gr5iDaGuAj9j37Y9lJu-taGyWINxT-" />
                <div className="absolute top-4 right-4 bg-surface-container-lowest/90 px-3 py-1 rounded-full text-xs font-bold text-on-tertiary-fixed-variant border border-on-tertiary-container/20">Partner</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-on-tertiary-container">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">4.9 (124 reviews)</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Sarah Jenkins</h3>
                <p className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">Family Law & Mediation</p>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Over 15 years of experience in complex family litigation and high-asset divorce settlements.</p>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="text-lg font-bold text-on-surface">$350<span className="text-sm font-normal text-on-surface-variant">/hr</span></span>
                  <button className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">Book Profile</button>
                </div>
              </div>
            </div>
            {/* Attorney Card 2 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(13,28,46,0.06)] transition-transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img alt="Attorney" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9170ynfSQMBoabIXKI77BEsAJD62h55lkybtu-TzFcrcj5y5LyvHP35f3bilXcgvVc6RCDh0R3GvYtBUR4OLQPBHVO7Fb-QcuasDnOGaQ4GwekRSF3o3CurlRzoRqsbx7eFXG-mUOcaVnCH-DhloG14y458p380KJnsoe68lwBxZLQq-_8-V-35PP4l1ySwTXTiCDqzvOhvfKu4tdlJq62gsi_HczrbwC_QdkW3Nt0aa3Q_nuNOdDHr0oSB6FIvq4PveU1dj2_9bM" />
                <div className="absolute top-4 right-4 bg-surface-container-lowest/90 px-3 py-1 rounded-full text-xs font-bold text-on-tertiary-fixed-variant border border-on-tertiary-container/20">Elite</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-on-tertiary-container">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">5.0 (89 reviews)</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Marcus Thorne</h3>
                <p className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">Corporate Mergers</p>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Specializing in cross-border acquisitions and venture capital structures for Series A-E startups.</p>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="text-lg font-bold text-on-surface">$550<span className="text-sm font-normal text-on-surface-variant">/hr</span></span>
                  <button className="text-sm font-bold text-primary group-hover:text-secondary transition-colors cursor-pointer">Book Profile</button>
                </div>
              </div>
            </div>
            {/* Attorney Card 2 */}
            <div className="group bg-surface-container-lowest rounded-2xl p-6 custom-shadow hover:shadow-lg transition-all">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-surface-container-low mb-5">
                <img alt="Attorney Marcus Thorne" className="w-full h-full object-cover" src="/images/lawyer2.jpg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Marcus Thorne</h3>
                <p className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">Corporate Mergers</p>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Specializing in cross-border acquisitions and venture capital structures for Series A-E startups.</p>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="text-lg font-bold text-on-surface">$550<span className="text-sm font-normal text-on-surface-variant">/hr</span></span>
                  <button className="text-sm font-bold text-primary group-hover:text-secondary transition-colors cursor-pointer">Book Profile</button>
                </div>
              </div>
            </div>
            {/* Attorney Card 3 */}
            <div className="group bg-surface-container-lowest rounded-2xl p-6 custom-shadow hover:shadow-lg transition-all">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-surface-container-low mb-5">
                <img alt="Attorney Elena Rodriguez" className="w-full h-full object-cover" src="/images/lawyer3.jpg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Elena Rodriguez</h3>
                <p className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">Criminal Defense</p>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Former federal prosecutor offering aggressive defense for white-collar crimes and civil rights.</p>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="text-lg font-bold text-on-surface">$425<span className="text-sm font-normal text-on-surface-variant">/hr</span></span>
                  <button className="text-sm font-bold text-primary group-hover:text-secondary transition-colors cursor-pointer">Book Profile</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Success Stories */}
      <section className="py-24 bg-primary text-on-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-20">
          <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 0" }}>format_quote</span>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-headline font-bold mb-16">Client Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white/5 backdrop-blur p-12 rounded-2xl border border-white/10">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold">JD</div>
                <div>
                  <p className="text-lg leading-relaxed italic mb-6">
                    "The AI matching was surprisingly accurate. Within minutes of posting my complex real estate dispute, LawyerLink connected me with a specialized attorney who had handled three similar cases in my city. The outcome was better than I could have imagined."
                  </p>
                  <h4 className="font-bold">James Davidson</h4>
                  <p className="text-sm opacity-60">CEO, Nexus Real Estate</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <p className="text-sm leading-relaxed mb-6 opacity-80 italic">
                "Professional, fast, and secure. Finding a lawyer for our family estate planning felt overwhelming until we used LawyerLink. Highly recommended."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-on-tertiary-container/20"></div>
                <div>
                  <h4 className="font-bold text-sm">Maria S.</h4>
                  <p className="text-xs opacity-60">Small Business Owner</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <p className="text-sm leading-relaxed mb-6 opacity-80 italic">
                "The transparency in pricing is a game-changer for the legal industry. I knew exactly what I was paying before our first call."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-on-tertiary-container/20"></div>
                <div>
                  <h4 className="font-bold text-sm">Robert Chen</h4>
                  <p className="text-xs opacity-60">Tech Entrepreneur</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 bg-white/5 backdrop-blur p-10 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">98% Success Rate</h3>
                <p className="opacity-70">Of our clients find their match on the first consultation.</p>
              </div>
              <Link to="/register" className="px-8 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-secondary hover:text-white transition-all">Start Your Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div>
              <span className="text-primary font-headline text-2xl font-bold mb-6 block">LawyerLink</span>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Connecting citizens with top-tier legal representation through innovative AI matching technology. Modernizing justice, one case at a time.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-widest">Platform</h5>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a className="hover:text-secondary transition-colors" href="/client/lawyers">Find Lawyers</a></li>
                <li><a className="hover:text-secondary transition-colors" href="/client/chat">AI Matching</a></li>
                <li><a className="hover:text-secondary transition-colors" href="/register">For Attorneys</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-widest">Support</h5>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a className="hover:text-secondary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Contact Support</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Legal Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-widest">Newsletter</h5>
              <p className="text-sm text-on-surface-variant mb-4">Weekly legal insights and platform updates.</p>
              <div className="flex gap-2">
                <input className="bg-surface-container-high border-none rounded-lg text-sm px-4 py-2 w-full focus:ring-1 focus:ring-secondary/30" placeholder="Email" type="email" />
                <button className="bg-primary px-4 py-2 rounded-lg text-on-primary cursor-pointer">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-outline font-medium">&copy; 2024 LawyerLink SaaS. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-outline hover:text-secondary transition-colors" href="#"><span className="material-symbols-outlined text-lg">public</span></a>
              <a className="text-outline hover:text-secondary transition-colors" href="#"><span className="material-symbols-outlined text-lg">mail</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
