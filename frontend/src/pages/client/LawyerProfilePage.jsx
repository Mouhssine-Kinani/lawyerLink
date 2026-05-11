import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function LawyerProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12 lg:py-20">
        {/* Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Identity & Contact */}
          <div className="lg:col-span-4 space-y-10">
            <div className="relative group">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-container shadow-xl">
                <img
                  className="w-full h-full object-cover"
                  alt="Professional portrait of a male lawyer in a blue suit"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQmLeXZtaEQHOZIC_J-bwLSTLl72IXpN-wj9pEz-mZB6qPMk_GTe5QxXVeEsuMrm6KemYFxw218vnPFuJLDYVDU8tq0y0_PMU9SO9klk6jxbd15Ncw_J2WlGEUbCnh5C04fKC4fZTEzTT6iliI5oaLCg474YnMMrvbNkEvOxNCVUEKj6-KGU1BaAGCL5y11mAyiLTjHHe4ZkgF17bRuyuLXeuteWpB_BWzDXSMsmDT_P0g8zxoDsSA0KgHF-gnwrLnx-Yl0VygSj_9"
                />
              </div>
              {/* Verification Badge */}
              <div className="absolute -bottom-4 -right-4 bg-surface-container-lowest p-3 rounded-xl shadow-2xl flex items-center gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Verified Expert</span>
              </div>
            </div>

            <section className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Jonathan Sterling, Esq.</h1>
                <p className="text-secondary font-medium uppercase tracking-widest text-xs">Senior Litigation Partner</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">Win Rate</span>
                  <span className="text-xl font-bold text-primary">94%</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">Experience</span>
                  <span className="text-xl font-bold text-primary">15+ Yrs</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-surface-container-high text-on-primary-fixed-variant text-xs font-semibold rounded-full">Corporate Law</span>
                <span className="px-3 py-1 bg-surface-container-high text-on-primary-fixed-variant text-xs font-semibold rounded-full">Intellectual Property</span>
                <span className="px-3 py-1 bg-surface-container-high text-on-primary-fixed-variant text-xs font-semibold rounded-full">Mergers &amp; Acquisitions</span>
              </div>
            </section>

            <div className="bg-primary text-on-primary p-8 rounded-xl shadow-2xl shadow-primary/30 space-y-6">
              <h3 className="text-lg font-bold">Schedule Consultation</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-primary-container">mail</span>
                  <span className="text-sm">j.sterling@sterlinglaw.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-primary-container">call</span>
                  <span className="text-sm">+1 (555) 012-3456</span>
                </div>
              </div>
              <Link
                to="/client/reservations/new"
                className="w-full block text-center py-4 bg-surface-container-lowest text-primary font-bold rounded-lg hover:bg-surface-container-low transition-colors"
              >
                Book Discovery Call
              </Link>
            </div>
          </div>

          {/* Right Column: Details & Experience */}
          <div className="lg:col-span-8 space-y-20">
            {/* Bio Section */}
            <section className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight text-primary leading-tight">
                Championing Corporate Integrity Through Precise Legal Advocacy.
              </h2>
              <div className="prose prose-lg text-on-surface-variant max-w-none space-y-6 leading-relaxed">
                <p>Jonathan Sterling is a distinguished litigator with over 15 years of experience navigating the complexities of high-stakes corporate disputes. His approach combines rigorous analytical precision with an editorial clarity that ensures every case is presented with undeniable authority.</p>
                <p>Having represented Fortune 500 companies and emerging tech giants alike, Jonathan focuses on Intellectual Property protection and strategic Mergers &amp; Acquisitions. He is widely recognized for his ability to translate dense legal frameworks into actionable business strategies.</p>
              </div>
            </section>

            {/* Professional Experience Timeline */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Professional Journey</h3>
                <div className="h-px flex-1 bg-outline-variant/30 ml-8"></div>
              </div>
              <div className="space-y-12">
                <div className="relative pl-8 border-l-2 border-surface-container-high">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-surface"></div>
                  <span className="text-xs font-bold text-secondary mb-2 block uppercase tracking-tighter">2018 &mdash; Present</span>
                  <h4 className="text-xl font-bold text-on-surface">Sterling &amp; Partners LLP</h4>
                  <p className="text-on-surface-variant mt-2 leading-relaxed">Senior Managing Partner. Spearheading the Corporate Litigation department and overseeing cross-border IP disputes in 12 jurisdictions.</p>
                </div>
                <div className="relative pl-8 border-l-2 border-surface-container-high">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-outline-variant border-4 border-surface"></div>
                  <span className="text-xs font-bold text-secondary mb-2 block uppercase tracking-tighter">2012 &mdash; 2018</span>
                  <h4 className="text-xl font-bold text-on-surface">Vanguard Global Legal</h4>
                  <p className="text-on-surface-variant mt-2 leading-relaxed">Lead Associate Counsel. Specialized in antitrust regulations and multi-billion dollar technology acquisition audits.</p>
                </div>
              </div>
            </section>

            {/* Education & Pricing Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Education */}
              <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Education</h3>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-bold text-on-surface">Harvard Law School</h5>
                    <p className="text-sm text-on-surface-variant">Juris Doctor (J.D.), cum laude</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface">Yale University</h5>
                    <p className="text-sm text-on-surface-variant">B.A. in Political Science</p>
                  </div>
                </div>
              </div>
              {/* Pricing */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Consultation &amp; Fees</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-sm text-on-surface-variant">Initial Consultation (30m)</span>
                    <span className="font-bold text-primary">$250</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-sm text-on-surface-variant">Hourly Retainer Rate</span>
                    <span className="font-bold text-primary">$450</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-on-surface-variant">Case Review Deposit</span>
                    <span className="font-bold text-primary">$1,500</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Robust Reviews Section */}
        <section className="mt-32 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Client Testimonials</h3>
              <h2 className="text-4xl font-bold text-primary">Voices of Excellence</h2>
            </div>
            <div className="flex items-center gap-6 bg-surface-container-low px-8 py-4 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline">Overall Rating</div>
              </div>
              <div className="h-10 w-px bg-outline-variant/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">124</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline">Verified Reviews</div>
              </div>
            </div>
          </div>

          {/* Reviews Masonry-like Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review Card 1 */}
            <div
              className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between"
              style={{ borderLeft: "4px solid #f59e0b" }}
            >
              <div className="space-y-4">
                <div className="flex text-on-tertiary-container gap-1">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">&ldquo;Jonathan handled our merger with absolute precision. His attention to detail and ability to predict potential legal hurdles saved us months of negotiation.&rdquo;</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Client profile avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgmWrB3MXtpLAt44vi5bRyt0usaZGUQ8bkernHVv_qkouJXpbmFQnTDhAFnZvZzBGWLNlBAWGO55r5VMFUl4w9oyo5sFkj5EMeu5HtXtBMIY8n9ZyFjnW-GvgNHuYJzTGQj0XJXry423OPIE8m16r1d2gyMUiM7n-4HOQbiJn4DubckK9PJ12MsdtD_R1t9Al6uwSvtLpqjbLrlMTXFH9w9nwwZWwaI0S8gpDL2fFz4wyJTWbHpBqjL5JXcunH1CErN2NO3CThvCf2"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Marcus Thorne</p>
                  <p className="text-[10px] uppercase font-bold text-outline">CEO, Aetheric Tech</p>
                </div>
              </div>
            </div>

            {/* Review Card 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-on-tertiary-container gap-1">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">&ldquo;The most professional legal counsel I've worked with in 20 years. Jonathan doesn't just provide legal advice; he provides strategic clarity.&rdquo;</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Client profile avatar female"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKO0wOpwhCrRp46CXQkpCklHQwSLqQQnXumCeQX0qK2mx20C5bkCWRpz54V0ubgor8YWK3MhYEpgWUSTvH2fS44qHqJOqluM5qGe5okFGCPBNSGoUorhwgJh7cpnlCzQes2xRpN_TJwtWIxXniwDnNrPkDEkjqgIbEv6_9BVNayarHQ0nxF5zCs4Rix5cyampXj7hO1COBCJIm_NLZLbka93xGMm3vi9-w_Ag_q9jARgfkR6hQ923rQGC4xubLJCJfOeBWjP5hRUlI"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Elena Rodriguez</p>
                  <p className="text-[10px] uppercase font-bold text-outline">General Counsel, NexaCorp</p>
                </div>
              </div>
            </div>

            {/* Review Card 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-on-tertiary-container gap-1">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg">star</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">&ldquo;Knowledgeable, responsive, and authoritative. He was instrumental in defending our patent portfolio against aggressive litigation.&rdquo;</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-bold text-sm">DW</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">David Wu</p>
                  <p className="text-[10px] uppercase font-bold text-outline">VP Operations, Stellar Systems</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="px-12 py-4 border border-outline text-sm font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-low transition-colors rounded-lg">
              View All Reviews
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
