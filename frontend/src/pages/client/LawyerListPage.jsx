import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function LawyerListPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="w-80 glass-sidebar sticky top-[73px] h-[calc(100vh-73px)] border-r border-surface-container-low p-8 hidden lg:block overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-headline font-bold text-lg text-on-surface">Filters</h2>
            <button className="text-xs font-label font-semibold text-secondary tracking-widest uppercase">Clear All</button>
          </div>
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Legal Specialty</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary">Corporate Law</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary">Intellectual Property</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary">Family Law</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary">Criminal Defense</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Jurisdiction / City</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">location_on</span>
                <input className="w-full bg-surface-container-high border-none rounded-lg py-2.5 pl-10 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all" placeholder="e.g. New York, NY" type="text" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Hourly Rate</label>
              <div className="flex items-center gap-3">
                <input className="w-full bg-surface-container-high border-none rounded-lg py-2 px-3 text-sm" placeholder="Min" type="number" />
                <span className="text-outline-variant">—</span>
                <input className="w-full bg-surface-container-high border-none rounded-lg py-2 px-3 text-sm" placeholder="Max" type="number" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Minimum Rating</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="text-primary focus:ring-primary" name="rating" type="radio" />
                  <span className="flex text-on-tertiary-container">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 0"}}>star</span>
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">4.0+</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Language</label>
              <select className="w-full bg-surface-container-high border-none rounded-lg py-2.5 text-sm focus:ring-1 focus:ring-primary/30">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Mandarin</option>
              </select>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-8 md:p-12">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-xs font-medium text-outline-variant mb-4">
                <a className="hover:text-primary transition-colors" href="#">Directory</a>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-primary">Legal Experts</span>
              </nav>
              <h1 className="font-headline font-bold text-4xl text-on-surface tracking-tight mb-2">Available Lawyers</h1>
              <p className="text-on-surface-variant text-lg">Found 1,284 verified legal professionals matching your criteria.</p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low p-1 rounded-lg">
              <button className="px-4 py-2 text-sm font-semibold text-primary bg-surface-container-lowest rounded shadow-sm">Highest Rated</button>
              <button className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Lowest Price</button>
              <button className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Most Experienced</button>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
              <div className="status-pillar bg-tertiary"></div>
              <div className="flex items-start gap-5 mb-6">
                <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt="Professional portrait of a male lawyer in a blue suit" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRCKxGzp6_RP2TueZfgTzC250PEJid_LvtCfiwDTdVUM27Qqu6fboagZtErjdkJMVR9DEu93pX9K8tkoTZj5yaEuiDrZqgpoUXsNr2iDTXuujVfkDXDAlEsV4VQySBHwmkqtbIAWicgch0ZY7-8AqmccIRHveoNzEoum82VsdmbTpdk9tmg3WOkFNwoPtnMAr9jJsx0vO4_uAb2ZBCJ5hhtM7Zlz6O7g7TDjEMzueNPkKC4TINRo6WCMxqM_SR96AUAwgjGgc3e6Ou" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Julian Sterling, Esq.</h3>
                    <div className="flex items-center gap-1 text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-sm font-bold">4.9</span>
                    </div>
                  </div>
                  <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">Corporate &amp; Venture Capital</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">Harvard Law '12. Specializing in Series A funding and tech-sector acquisitions.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                <div>
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Experience</span>
                  <span className="text-sm font-semibold text-on-surface">12 Years</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                  <span className="text-sm font-semibold text-primary">$450 / hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-primary">NY</div>
                  <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-primary">DE</div>
                </div>
                <button className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg">View Profile</button>
              </div>
            </div>
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
              <div className="flex items-start gap-5 mb-6">
                <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt="Professional portrait of a female lawyer in business attire" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYuUYsNycerWuKUp4MmLw_hVvhB4JEiDRUyTZIPkzqSC38InmblOtZMxS_z9fbu97lj668_Suaiv3a_lMhbPDKofWwOEE5i3H27nsgaJEQFgKYebN7kpcoMa7Ctq9Gf1iKa8dC9dToNUud-FbV0u3_DQoFMcY06I1r9dibSytUM_Va72vS8MJgh8zua1BoIg96bmhR8XZN7jWMcst5j3pRFp6_xsGUbDjYedCl-58qK_cHb_hBpspantd01l_2fOQHrP5pXONlv-v8" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Sarah McAllister</h3>
                    <div className="flex items-center gap-1 text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-sm font-bold">5.0</span>
                    </div>
                  </div>
                  <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">Intellectual Property</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">Protecting global brands and emerging patents for Fortune 500 companies.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                <div>
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Experience</span>
                  <span className="text-sm font-semibold text-on-surface">8 Years</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                  <span className="text-sm font-semibold text-primary">$380 / hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold text-primary">CA BAR</span>
                  <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold text-primary">USPTO</span>
                </div>
                <button className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg">View Profile</button>
              </div>
            </div>
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
              <div className="flex items-start gap-5 mb-6">
                <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt="Portrait of an experienced male legal professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiDOOSRikWKLdQPzFC9BLwFCIXIUlsAa0QPKjCY4ZN11X9Q9dH7ksVQImn6VVQ3l4TU6RityjlsQXzlAaZPHDhLy7PoLGSL134WXktHPrUMX3WQhDaadHVVoG_CKyh2P_g-0KxEBB7ya5MUjbrnDzbmktmS5WrFXlfmvE22z-BG5y34nYYoOpOTk84qOp5f7ePDbUu8vq95wZ1FJy7UqAR2PwpaJrQmiKdUNmygGs6l9nXVKLInmYhNuZwRXBkHuz102ksoXs8260T" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">David Chen, J.D.</h3>
                    <div className="flex items-center gap-1 text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-sm font-bold">4.8</span>
                    </div>
                  </div>
                  <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">Immigration &amp; Global Mobility</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">Expert in H1-B, EB-5 visas and complex corporate immigration pathways.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                <div>
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Experience</span>
                  <span className="text-sm font-semibold text-on-surface">15 Years</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                  <span className="text-sm font-semibold text-primary">$325 / hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Fluent:</span>
                  <span className="text-[10px] font-bold text-primary">Mandarin</span>
                </div>
                <button className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg">View Profile</button>
              </div>
            </div>
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
              <div className="flex items-start gap-5 mb-6">
                <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt="Portrait of a female professional lawyer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR7gw7yoy1-I2YknYUXT8aH0N7csQmjXnorwzmoseMmeVGH4l6HY-YoG4A5cbDNPyp_j0pyzOGzbzpMzhZXDak9gS6t5Zt_jSyoyZLFl8REHqzDBUvYcrnYJki5ci7fvNKR9nW0Cs0jAiBBd2jYdKyuc9jnJHESgntKFrsJcLERdg4vhzawzEqDG5a5Y8FF76ZRiDIQxWArL_-mtyu01iyt2hAn_4zIjMN1Pe8jonzDQh1si4jbiovXi6OjVTgf67A_JBp_5bOmn8M" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Elena Rodriguez</h3>
                    <div className="flex items-center gap-1 text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-sm font-bold">4.7</span>
                    </div>
                  </div>
                  <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">Real Estate &amp; Property Law</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">Commercial leasing, zoning disputes, and high-value residential closings.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                <div>
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Experience</span>
                  <span className="text-sm font-semibold text-on-surface">10 Years</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                  <span className="text-sm font-semibold text-primary">$400 / hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary">Florida Bar</span>
                </div>
                <button className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg">View Profile</button>
              </div>
            </div>
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
              <div className="flex items-start gap-5 mb-6">
                <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt="Corporate headshot of a male lawyer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7iZsu-Dt4z9_6SarD5qEC4JjcOGtx_9AmIqxJxvwC_WzBAnh-siSkYYvLAh7zZHULxmoKQhfe9_e0PtRCKyaMTVcKpsBmQlbHL3YEyeqzKtkp9ybZl0wx6FROC1PJwMaYB5mJulRzWUHKDT_QBWuoxquZHbjcFRMftQRX78KIIVebUN-e6LLAfePrNLe9JCAO9FMPNBpL_wBtbhqYleLEBS4QKqfgaJfPs_ickAe0WOm985LGloo1mejO9ZnlHwux8-n4OcwQMjBb" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Marcus Thorne</h3>
                    <div className="flex items-center gap-1 text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-sm font-bold">4.9</span>
                    </div>
                  </div>
                  <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">Criminal Defense</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">Aggressive defense strategy for white-collar crimes and civil litigation.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                <div>
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Experience</span>
                  <span className="text-sm font-semibold text-on-surface">18 Years</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                  <span className="text-sm font-semibold text-primary">$550 / hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold text-primary">Trial Expert</span>
                </div>
                <button className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg">View Profile</button>
              </div>
            </div>
            <div className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
              <div className="flex items-start gap-5 mb-6">
                <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt="Portrait of a young female lawyer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQpk2HMbVWTApacNHxTFpFRhTNeSLHPsFKl-qxrp4Pxxtk5PhB8BFLAVbGpt2nTqxlgKEaZ2-fSaiEVYfxKHUa4aTS7GMqFCTO0gQvWH71-7FuKel3C5_5eYTLDF-LU-MQzxtPd0GkTTGblrLvbGuub1OFn5QU3xQTuR4KUh9IxccNyYfjKKAM_0Lp9gODZm4Q2zrTlWrRKmt6OvXp4A3Hc3HlMmDjGpsak-ugKfG9F-rFGFUWCtf9F8PahKJ-rvxIIleCKzqXKALc" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Sofia Vance</h3>
                    <div className="flex items-center gap-1 text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-sm font-bold">4.6</span>
                    </div>
                  </div>
                  <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">Family &amp; Estate Planning</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">Compassionate counsel for divorce mediation and complex trust management.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                <div>
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Experience</span>
                  <span className="text-sm font-semibold text-on-surface">6 Years</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                  <span className="text-sm font-semibold text-primary">$290 / hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold text-primary">TX BAR</span>
                </div>
                <button className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg">View Profile</button>
              </div>
            </div>
          </div>
          <div className="mt-20 flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface font-medium hover:bg-surface-container-low">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface font-medium hover:bg-surface-container-low">3</button>
              <span className="px-2 text-outline">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface font-medium hover:bg-surface-container-low">42</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
