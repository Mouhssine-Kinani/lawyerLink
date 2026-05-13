import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { lawyerApi } from "../../api/lawyer.api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

function parseSpecialties(specialties) {
  if (!specialties) return [];
  try {
    const parsed = JSON.parse(specialties);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return specialties.split(",").map((s) => s.trim()).filter(Boolean);
}

const PLACEHOLDER_AVATAR = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112">
    <rect width="112" height="112" fill="#e0e0e0"/>
    <path fill="#bdbdbd" d="M56 56c12.4 0 22.5-10.1 22.5-22.5S68.4 11 56 11 33.5 21.1 33.5 33.5 43.6 56 56 56zm0 11.2C40.3 67.2 11 76.5 11 95v6h90v-6c0-18.5-29.3-27.8-45-27.8z"/>
  </svg>`
);

export default function LawyerListPage() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");

  // Filter state
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [language, setLanguage] = useState("");
  const [specialtyOptions, setSpecialtyOptions] = useState([]);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState("");

  const specialtyRef = useRef(null);

  useEffect(() => {
    lawyerApi.getSpecialties().then(setSpecialtyOptions).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (specialtyRef.current && !specialtyRef.current.contains(e.target)) {
        setShowSpecialtyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredSpecialties = specialtyOptions.filter((s) =>
    s.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  const cityOptions = [...new Set(lawyers.map((l) => l.city).filter(Boolean))].sort();

  const fetchLawyers = () => {
    setLoading(true);
    const params = { sort_by: sortBy, limit: 20 };

    if (selectedSpecialties.length > 0) {
      params.specialty = selectedSpecialties.join(",");
    }
    if (cityFilter.trim()) params.city = cityFilter.trim();
    if (minRate) params.min_rate = minRate;
    if (maxRate) params.max_rate = maxRate;
    if (minRating) params.min_rating = minRating;

    lawyerApi.getLawyers(params)
      .then((data) => {
        setLawyers(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch lawyers:", err);
        setLawyers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLawyers();
  }, [sortBy]);

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(specialty)) {
        return prev.filter((s) => s !== specialty);
      }
      return [...prev, specialty];
    });
  };

  const handleApplyFilters = () => {
    setShowSpecialtyDropdown(false);
    setSpecialtySearch("");
    fetchLawyers();
  };

  const handleClearFilters = () => {
    setSelectedSpecialties([]);
    setCityFilter("");
    setMinRate("");
    setMaxRate("");
    setMinRating("");
    setLanguage("");
    setShowSpecialtyDropdown(false);
    setSpecialtySearch("");
    setSortBy("rating");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="w-80 glass-sidebar sticky top-[73px] h-[calc(100vh-73px)] border-r border-surface-container-low p-8 hidden lg:block overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-headline font-bold text-lg text-on-surface">Filters</h2>
            <button onClick={handleClearFilters} className="text-xs font-label font-semibold text-secondary tracking-widest uppercase">Clear All</button>
          </div>
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Legal Specialty</label>
              <div className="relative" ref={specialtyRef}>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {selectedSpecialties.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {s}
                      <button
                        type="button"
                        onClick={() => handleSpecialtyChange(s)}
                        className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                  <input
                    value={specialtySearch}
                    onChange={(e) => {
                      setSpecialtySearch(e.target.value);
                      setShowSpecialtyDropdown(true);
                    }}
                    onFocus={() => setShowSpecialtyDropdown(true)}
                    className="w-full bg-surface-container-high border-none rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                    placeholder={selectedSpecialties.length === 0 ? "Search specialties..." : "Type to filter..."}
                    type="text"
                  />
                </div>
                {showSpecialtyDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredSpecialties.length > 0 ? (
                      filteredSpecialties.map((spec) => (
                        <label
                          key={spec}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface-container-low transition-colors"
                        >
                          <input
                            checked={selectedSpecialties.includes(spec)}
                            onChange={() => handleSpecialtyChange(spec)}
                            className="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4"
                            type="checkbox"
                          />
                          <span className="text-sm text-on-surface-variant">{spec}</span>
                        </label>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-sm text-on-surface-variant/50 text-center">No specialties match</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Jurisdiction / City</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">location_on</span>
                <input
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  list="city-suggestions"
                  className="w-full bg-surface-container-high border-none rounded-lg py-2.5 pl-10 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="Type or select a city"
                  type="text"
                />
                <datalist id="city-suggestions">
                  {cityOptions.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Hourly Rate</label>
              <div className="flex items-center gap-3">
                <input
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-lg py-2 px-3 text-sm"
                  placeholder="Min"
                  type="number"
                />
                <span className="text-outline-variant">—</span>
                <input
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-lg py-2 px-3 text-sm"
                  placeholder="Max"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Minimum Rating</label>
              <div className="flex flex-col gap-2">
                {[4, 3, 2, 1].map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={minRating === String(r)}
                      onChange={() => setMinRating(minRating === String(r) ? "" : String(r))}
                      className="text-primary focus:ring-primary"
                      name="rating"
                      type="radio"
                    />
                    <span className="flex text-on-tertiary-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${star <= r ? 1 : 0}` }}>star</span>
                      ))}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">{r}.0+</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg py-2.5 text-sm focus:ring-1 focus:ring-primary/30"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Mandarin">Mandarin</option>
              </select>
            </div>
            <button
              onClick={handleApplyFilters}
              className="w-full py-3 bg-primary text-on-primary font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
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
              <p className="text-on-surface-variant text-lg">
                {loading ? "Loading..." : `Found ${lawyers.length} verified legal professional${lawyers.length !== 1 ? "s" : ""} matching your criteria.`}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setSortBy("rating")}
                className={`px-4 py-2 text-sm font-semibold ${sortBy === "rating" ? "text-primary bg-surface-container-lowest rounded shadow-sm" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
              >
                Highest Rated
              </button>
              <button
                onClick={() => setSortBy("rate")}
                className={`px-4 py-2 text-sm ${sortBy === "rate" ? "font-semibold text-primary bg-surface-container-lowest rounded shadow-sm" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
              >
                Lowest Price
              </button>
              <button
                onClick={() => setSortBy("experience")}
                className={`px-4 py-2 text-sm ${sortBy === "experience" ? "font-semibold text-primary bg-surface-container-lowest rounded shadow-sm" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
              >
                Most Experienced
              </button>
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-on-surface-variant text-sm font-medium">Loading lawyers...</p>
              </div>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-32">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">gavel</span>
              <p className="text-on-surface-variant text-lg mb-2">No lawyers found</p>
              <p className="text-outline text-sm">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {lawyers.map((lawyer) => {
                const specialties = parseSpecialties(lawyer.specialties);
                const fullName = [lawyer.first_name, lawyer.last_name].filter(Boolean).join(" ") || "Legal Professional";
                const imgSrc = imageUrl(lawyer.image_url) || PLACEHOLDER_AVATAR;

                return (
                  <div key={lawyer.user_id} className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(13,28,46,0.04)] hover:shadow-xl transition-all border border-transparent hover:border-primary/10 overflow-hidden">
                    <div className="status-pillar bg-tertiary"></div>
                    <div className="flex items-start gap-5 mb-6">
                      <img className="w-20 h-20 rounded-lg object-cover bg-surface-container-high" alt={`Portrait of ${fullName}`} src={imgSrc} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{fullName}</h3>
                          <div className="flex items-center gap-1 text-on-tertiary-container">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-sm font-bold">{lawyer.rating_avg ? lawyer.rating_avg.toFixed(1) : "0.0"}</span>
                          </div>
                        </div>
                        <p className="text-xs font-label font-semibold text-secondary tracking-wider uppercase mb-2">{lawyer.firm || "Legal Professional"}</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{specialties.length > 0 ? specialties.slice(0, 3).join(", ") : "Legal services"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-surface-container-low">
                      <div>
                        <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Rating</span>
                        <span className="text-sm font-semibold text-on-surface">{lawyer.rating_avg ? lawyer.rating_avg.toFixed(1) : "N/A"}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Hourly Rate</span>
                        <span className="text-sm font-semibold text-primary">{lawyer.hourly_rate ? `$${lawyer.hourly_rate} / hr` : "Contact"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {lawyer.city && (
                          <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-primary">
                            {lawyer.city.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/client/lawyers/${lawyer.user_id}`}
                        className="px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-lg inline-block"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {lawyers.length > 0 && (
            <div className="mt-20 flex flex-col items-center gap-8">
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
                <span className="px-2 text-outline">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
