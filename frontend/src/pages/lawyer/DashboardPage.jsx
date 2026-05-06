import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <Navbar />
        <main className="flex-1 p-10 max-w-7xl mx-auto space-y-10 overflow-y-auto">
          <section className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-headline font-bold text-on-background mb-2">Welcome back, Counselor</h2>
              <p className="text-on-surface-variant text-lg">You have <span className="text-secondary font-semibold">4 consultations today</span>.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-tertiary/10 text-on-tertiary-fixed-variant rounded-full text-xs font-bold uppercase tracking-wider">Premium Account</span>
            </div>
          </section>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 bg-surface-container-lowest rounded-xl p-8 custom-shadow flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Earnings Overview</p>
                  <h3 className="text-2xl font-bold mt-1">$42,850.00</h3>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-surface-container-low text-xs rounded-lg font-medium">Monthly</button>
                  <button className="px-3 py-1 text-xs text-on-surface-variant rounded-lg font-medium">Quarterly</button>
                </div>
              </div>
              <div className="h-48 flex items-end gap-3 px-4">
                <div className="w-full bg-surface-container-low rounded-t-lg transition-all hover:bg-primary/20 h-24"></div>
                <div className="w-full bg-surface-container-low rounded-t-lg transition-all hover:bg-primary/20 h-32"></div>
                <div className="w-full bg-surface-container-low rounded-t-lg transition-all hover:bg-primary/20 h-28"></div>
                <div className="w-full bg-primary/40 rounded-t-lg transition-all h-40"></div>
                <div className="w-full bg-surface-container-low rounded-t-lg transition-all hover:bg-primary/20 h-36"></div>
                <div className="w-full bg-primary rounded-t-lg h-48 shadow-lg shadow-primary/20"></div>
              </div>
            </div>
            <div className="col-span-4 bg-primary-container text-on-primary rounded-xl p-8 custom-shadow flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-label font-bold text-on-primary-container uppercase tracking-widest">Rating Summary</p>
                <div className="flex items-center gap-2 mt-4">
                  <h3 className="text-5xl font-bold tracking-tighter">4.9</h3>
                  <div className="flex flex-col">
                    <div className="flex text-on-tertiary-container">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    </div>
                    <span className="text-[10px] text-on-primary-container font-medium">124 Reviews</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3 relative z-10">
                <div className="flex justify-between items-center text-xs">
                  <span>Communication</span>
                  <span className="font-bold">5.0</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-on-tertiary-container w-full"></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Expertise</span>
                  <span className="font-bold">4.8</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-on-tertiary-container w-[96%]"></div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
