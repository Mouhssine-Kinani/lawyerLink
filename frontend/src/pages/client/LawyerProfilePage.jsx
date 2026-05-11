import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
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

function renderStars(rating) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  for (let i = 0; i < 5; i++) {
    const fill = i < full ? 1 : (i === full && hasHalf ? 1 : 0);
    stars.push(
      <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${fill}` }}>star</span>
    );
  }
  return stars;
}

const PLACEHOLDER_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRCKxGzp6_RP2TueZfgTzC250PEJid_LvtCfiwDTdVUM27Qqu6fboagZtErjdkJMVR9DEu93pX9K8tkoTZj5yaEuiDrZqgpoUXsNr2iDTXuujVfkDXDAlEsV4VQySBHwmkqtbIAWicgch0ZY7-8AqmccIRHveoNzEoum82VsdmbTpdk9tmg3WOkFNwoPtnMAr9jJsx0vO4_uAb2ZBCJ5hhtM7Zlz6O7g7TDjEMzueNPkKC4TINRo6WCMxqM_SR96AUAwgjGgc3e6Ou",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYuUYsNycerWuKUp4MmLw_hVvhB4JEiDRUyTZIPkzqSC38InmblOtZMxS_z9fbu97lj668_Suaiv3a_lMhbPDKofWwOEE5i3H27nsgaJEQFgKYebN7kpcoMa7Ctq9Gf1iKa8dC9dToNUud-FbV0u3_DQoFMcY06I1r9dibSytUM_Va72vS8MJgh8zua1BoIg96bmhR8XZN7jWMcst5j3pRFp6_xsGUbDjYedCl-58qK_cHb_hBpspantd01l_2fOQHrP5pXONlv-v8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiDOOSRikWKLdQPzFC9BLwFCIXIUlsAa0QPKjCY4ZN11X9Q9dH7ksVQImn6VVQ3l4TU6RityjlsQXzlAaZPHDhLy7PoLGSL134WXktHPrUMX3WQhDaadHVVoG_CKyh2P_g-0KxEBB7ya5MUjbrnDzbmktmS5WrFXlfmvE22z-BG5y34nYYoOpOTk84qOp5f7ePDbUu8vq95wZ1FJy7UqAR2PwpaJrQmiKdUNmygGs6l9nXVKLInmYhNuZwRXBkHuz102ksoXs8260T",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAR7gw7yoy1-I2YknYUXT8aH0N7csQmjXnorwzmoseMmeVGH4l6HY-YoG4A5cbDNPyp_j0pyzOGzbzpMzhZXDak9gS6t5Zt_jSyoyZLFl8REHqzDBUvYcrnYJki5ci7fvNKR9nW0Cs0jAiBBd2jYdKyuc9jnJHESgntKFrsJcLERdg4vhzawzEqDG5a5Y8FF76ZRiDIQxWArL_-mtyu01iyt2hAn_4zIjMN1Pe8jonzDQh1si4jbiovXi6OjVTgf67A_JBp_5bOmn8M",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB7iZsu-Dt4z9_6SarD5qEC4JjcOGtx_9AmIqxJxvwC_WzBAnh-siSkYYvLAh7zZHULxmoKQhfe9_e0PtRCKyaMTVcKpsBmQlbHL3YEyeqzKtkp9ybZl0wx6FROC1PJwMaYB5mJulRzWUHKDT_QBWuoxquZHbjcFRMftQRX78KIIVebUN-e6LLAfePrNLe9JCAO9FMPNBpL_wBtbhqYleLEBS4QKqfgaJfPs_ickAe0WOm985LGloo1mejO9ZnlHwux8-n4OcwQMjBb",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBQpk2HMbVWTApacNHxTFpFRhTNeSLHPsFKl-qxrp4Pxxtk5PhB8BFLAVbGpt2nTqxlgKEaZ2-fSaiEVYfxKHUa4aTS7GMqFCTO0gQvWH71-7FuKel3C5_5eYTLDF-LU-MQzxtPd0GkTTGblrLvbGuub1OFn5QU3xQTuR4KUh9IxccNyYfjKKAM_0Lp9gODZm4Q2zrTlWrRKmt6OvXp4A3Hc3HlMmDjGpsak-ugKfG9F-rFGFUWCtf9F8PahKJ-rvxIIleCKzqXKALc",
];

export default function LawyerProfilePage() {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      lawyerApi.getLawyerById(id),
      lawyerApi.getLawyerReviews(id),
    ])
      .then(([lawyerData, reviewsData]) => {
        setLawyer(lawyerData);
        setReviews(reviewsData || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-outline">error_outline</span>
            <p className="text-on-surface-variant">{error || "Lawyer not found"}</p>
            <Link to="/client/lawyers" className="text-primary font-semibold underline">Back to lawyers</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const specialties = parseSpecialties(lawyer.specialties);
  const ratingPercent = lawyer.rating_avg ? Math.round(lawyer.rating_avg * 20) : null;
  const fullName = [lawyer.first_name, lawyer.last_name].filter(Boolean).join(" ") || "Legal Professional";
  const profileImg = imageUrl(lawyer.image_url) || PLACEHOLDER_IMAGES[(lawyer.user_id || 0) % PLACEHOLDER_IMAGES.length];
  const email = lawyer.email || "N/A";
  const totalRating = lawyer.rating_avg || 0;
  const reviewCount = lawyer.rating_count || reviews.length || 0;

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
                  alt={`Portrait of ${fullName}`}
                  src={profileImg}
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
                <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">{fullName}</h1>
                <p className="text-secondary font-medium uppercase tracking-widest text-xs">{lawyer.firm || "Legal Professional"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">Rating</span>
                  <span className="text-xl font-bold text-primary">{totalRating > 0 ? totalRating.toFixed(1) : "--"}</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">Reviews</span>
                  <span className="text-xl font-bold text-primary">{reviewCount}</span>
                </div>
              </div>
            </section>

            {specialties.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-surface-container-high text-on-primary-fixed-variant text-xs font-semibold rounded-full">{spec}</span>
                  ))}
                </div>
              </section>
            )}

            <div className="bg-primary text-on-primary p-8 rounded-xl shadow-2xl shadow-primary/30 space-y-6">
              <h3 className="text-lg font-bold">Schedule Consultation</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-primary-container">mail</span>
                  <span className="text-sm">{email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-primary-container">call</span>
                  <span className="text-sm">{lawyer.phone || "+1 (555) 000-0000"}</span>
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
                Championing Legal Excellence Through Dedicated Advocacy.
              </h2>
              <div className="prose prose-lg text-on-surface-variant max-w-none space-y-6 leading-relaxed">
                <p>{fullName} is a dedicated legal professional committed to providing exceptional legal services. With a focus on {specialties.length > 0 ? specialties.slice(0, 2).join(" and ") : "various practice areas"}, every case is approached with precision and care.</p>
                <p>Admitted to the bar and ready to assist with your legal needs, {lawyer.first_name || "the attorney"} brings expertise and dedication to every client engagement.</p>
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
                  <span className="text-xs font-bold text-secondary mb-2 block uppercase tracking-tighter">Present</span>
                  <h4 className="text-xl font-bold text-on-surface">{lawyer.firm || "Independent Practice"}</h4>
                  <p className="text-on-surface-variant mt-2 leading-relaxed">Serving clients with dedication and legal expertise across multiple practice areas.</p>
                </div>
                <div className="relative pl-8 border-l-2 border-surface-container-high">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-outline-variant border-4 border-surface"></div>
                  <span className="text-xs font-bold text-secondary mb-2 block uppercase tracking-tighter">Bar Admission</span>
                  <h4 className="text-xl font-bold text-on-surface">Licensed Attorney</h4>
                  <p className="text-on-surface-variant mt-2 leading-relaxed">Fully licensed and authorized to practice law, committed to upholding the highest standards of legal ethics.</p>
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
                    <h5 className="font-bold text-on-surface">Juris Doctor (J.D.)</h5>
                    <p className="text-sm text-on-surface-variant">Accredited Law School</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface">Bachelor of Arts</h5>
                    <p className="text-sm text-on-surface-variant">University</p>
                  </div>
                </div>
              </div>
              {/* Pricing */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Consultation &amp; Fees</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-sm text-on-surface-variant">Hourly Rate</span>
                    <span className="font-bold text-primary">{lawyer.hourly_rate ? `$${lawyer.hourly_rate}` : "Contact for rates"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-sm text-on-surface-variant">Initial Consultation</span>
                    <span className="font-bold text-primary">{lawyer.hourly_rate ? `$${Math.round(lawyer.hourly_rate * 0.5)}` : "Inquire"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-on-surface-variant">Case Review</span>
                    <span className="font-bold text-primary">{lawyer.hourly_rate ? `$${Math.round(lawyer.hourly_rate * 2)}` : "Inquire"}</span>
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
                <div className="text-3xl font-bold text-primary">{totalRating > 0 ? totalRating.toFixed(1) : "--"}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline">Overall Rating</div>
              </div>
              <div className="h-10 w-px bg-outline-variant/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{reviewCount}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline">Verified Reviews</div>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between"
                  style={{ borderLeft: `4px solid ${review.rating >= 4 ? "#f59e0b" : "#9ca3af"}` }}
                >
                  <div className="space-y-4">
                    <div className="flex text-on-tertiary-container gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">&ldquo;{review.comment || "Excellent legal service."}&rdquo;</p>
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                      {review.client_image_url ? (
                        <img className="w-full h-full object-cover" alt="Client avatar" src={imageUrl(review.client_image_url)} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-bold text-sm">
                          {((review.client_first_name?.[0] || "") + (review.client_last_name?.[0] || "")) || "C"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{[review.client_first_name, review.client_last_name].filter(Boolean).join(" ") || "Client"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-outline mb-4 block">reviews</span>
              <p className="text-on-surface-variant">No reviews yet. Be the first to leave a review!</p>
            </div>
          )}

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
