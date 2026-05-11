import Navbar from "../../components/layout/Navbar";

export default function LawyerListPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-12 py-12 max-w-7xl mx-auto space-y-12">
        <section className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-headline font-bold text-on-background mb-2 tracking-tight">Find Your Lawyer</h2>
            <p className="text-on-surface-variant text-lg">Browse verified legal professionals tailored to your needs.</p>
          </div>
          <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all">
            <span className="material-symbols-outlined text-primary">filter_alt</span>
            <span className="text-sm font-bold text-primary">Filters</span>
          </button>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group bg-surface-container-lowest rounded-2xl overflow-hidden editorial-shadow transition-transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-outline">person</span>
                </div>
                <div className="absolute top-4 right-4 bg-surface-container-lowest/90 px-3 py-1 rounded-full text-xs font-bold text-on-tertiary-fixed-variant border border-on-tertiary-container/20">
                  {i === 1 ? "Partner" : i === 2 ? "Elite" : "Verified"}
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-on-tertiary-container">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 0"}}>star</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">4.{9 - i} (124 reviews)</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Lawyer Name {i}</h3>
                <p className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">Specialty Area</p>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Brief description of expertise and experience in this legal field.</p>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="text-lg font-bold text-on-surface">${(350 + i * 50)}<span className="text-sm font-normal text-on-surface-variant">/hr</span></span>
                  <button className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">Book Profile</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-outline font-medium">© 2024 LawyerLink SaaS. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-outline hover:text-secondary transition-colors" href="#"><span className="material-symbols-outlined text-lg">language</span></a>
            <a className="text-outline hover:text-secondary transition-colors" href="#"><span className="material-symbols-outlined text-lg">mail</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
