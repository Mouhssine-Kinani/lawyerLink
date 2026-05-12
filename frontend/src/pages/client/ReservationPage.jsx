import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function ReservationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-24">
        {/* Multi-step Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-4">Book Your Consultation</h1>
          <p className="text-lg text-on-surface-variant">Review the professional details and select a preferred time for your initial legal strategy session.</p>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-sm font-semibold text-primary">Schedule</span>
            </div>
            <div className="w-12 h-px bg-outline-variant"></div>
            <div className="flex items-center gap-2 opacity-40">
              <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm font-semibold text-on-surface-variant">Review</span>
            </div>
            <div className="w-12 h-px bg-outline-variant"></div>
            <div className="flex items-center gap-2 opacity-40">
              <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-sm font-semibold text-on-surface-variant">Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Lawyer Summary */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm ring-1 ring-on-surface/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-surface-container-low mb-6">
                  <img
                    className="w-full h-full object-cover"
                    alt="Professional male lawyer headshot smiling"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2k0YgNpWlu4Es6LixbSIEYSlYdi80Ox_JdhHKNyYg0SzxaWLJ4odMUopAwyal_Q5ceDUuGdOgSBtxSVGQJAoCBAqBr7wES0ek_XNqgwycmgB5leFOxLZbVZfTy8TwxjFbUgTHeJeSpCH8UySo-8y0oDwblG5OWFEoYYi5kvXzyfF5FdUI8sqOokcsxXu2knyquV_8f94UfZRVSBbvfoPXhhg30LXD9g6NmVOO70UcQMJlE8vR0TI88xzHts5q-MMYcJOQLP0kfNDN"
                  />
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-1">Marcus Thorne, Esq.</h2>
                <span className="text-sm font-semibold text-secondary mb-4">Corporate Law Specialist</span>
                <div className="flex items-center gap-1 text-on-tertiary-container mb-6">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="ml-2 text-sm font-bold text-on-surface">4.9 (124 reviews)</span>
                </div>
                <div className="w-full text-left space-y-4 pt-6 border-t border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">work</span>
                    <span className="text-sm text-on-surface-variant">15 Years Experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                    <span className="text-sm text-on-surface-variant">New York, NY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                    <span className="text-sm text-on-surface-variant">30 Min Consultation</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-surface-container-low p-6 rounded-xl"
              style={{ borderLeft: "4px solid #f59e0b" }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed-variant mb-3">Notice</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Initial sessions focus on merit assessment and preliminary strategy. Please have all relevant contracts ready for review.
              </p>
            </div>
          </aside>

          {/* Right Column: Interactive Selection */}
          <div className="lg:col-span-8 space-y-8">
            {/* Calendar Section */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm ring-1 ring-on-surface/5 overflow-hidden">
              <div className="p-8 border-b border-surface-container-low flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Select Date</h3>
                  <p className="text-sm text-on-surface-variant">Available dates for November 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="text-sm font-bold w-32 text-center">November 2024</span>
                  <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Sun</div>
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Mon</div>
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Tue</div>
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Wed</div>
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Thu</div>
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Fri</div>
                  <div className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                  <div className="h-14"></div><div className="h-14"></div><div className="h-14"></div><div className="h-14"></div><div className="h-14"></div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface-variant/30">1</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface-variant/30">2</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface-variant/30">3</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">4</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">5</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium bg-primary text-white rounded-xl shadow-lg shadow-primary/20">6</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">7</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">8</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">9</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">10</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">11</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">12</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">13</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">14</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">15</div>
                  <div className="h-14 flex items-center justify-center text-sm font-medium text-on-surface cursor-pointer hover:bg-primary/5 rounded-xl transition-all">16</div>
                </div>
              </div>
            </div>

            {/* Time Slot Grid */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm ring-1 ring-on-surface/5 p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-on-surface">Available Times</h3>
                <p className="text-sm text-on-surface-variant">Wednesday, Nov 6</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="py-4 text-sm font-bold border border-surface-container-high hover:border-primary hover:text-primary rounded-lg transition-all">09:00 AM</button>
                <button className="py-4 text-sm font-bold border border-surface-container-high hover:border-primary hover:text-primary rounded-lg transition-all">10:30 AM</button>
                <button className="py-4 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20">01:00 PM</button>
                <button className="py-4 text-sm font-bold border border-surface-container-high hover:border-primary hover:text-primary rounded-lg transition-all">02:30 PM</button>
                <button className="py-4 text-sm font-bold border border-surface-container-high hover:border-primary hover:text-primary rounded-lg transition-all">04:00 PM</button>
                <button className="py-4 text-sm font-bold border border-surface-container-high opacity-30 cursor-not-allowed rounded-lg bg-surface-container-low" disabled>05:30 PM</button>
              </div>
            </div>

            {/* Notes Form */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm ring-1 ring-on-surface/5 p-8">
              <h3 className="text-xl font-bold text-on-surface mb-6">Brief Case Summary</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">Subject</label>
                  <input
                    className="w-full bg-surface-container-low border-0 focus:ring-1 focus:ring-primary rounded-lg py-4 px-5 text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="e.g. Contract Review for Tech Startup"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">Additional Notes</label>
                  <textarea
                    className="w-full bg-surface-container-low border-0 focus:ring-1 focus:ring-primary rounded-lg py-4 px-5 text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="Describe the core legal issue you wish to discuss..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex items-center justify-between pt-8">
              <Link
                to="/client/lawyers"
                className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Search
              </Link>
              <button className="px-12 py-4 text-lg font-bold text-white bg-gradient-to-br from-primary to-primary-container rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
