import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import { lawyerApi } from "../../api/lawyer.api";
import { reviewApi } from "../../api/review.api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

export default function ReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lawyerId = searchParams.get("lawyerId");
  const { token } = useAuth();

  const [lawyer, setLawyer] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  useEffect(() => {
    if (!lawyerId || !token) return;
    setLoading(true);
    setError(null);

    Promise.all([
      lawyerApi.getLawyerById(lawyerId).catch(() => null),
      reviewApi.canReviewLawyer(lawyerId, token),
      reviewApi.getMyReviewForLawyer(lawyerId, token),
    ])
      .then(([lawyerData, canData, myReview]) => {
        setLawyer(lawyerData);
        setCanReview(canData?.can_review ?? false);

        if (myReview) {
          setExistingReview(myReview);
          setRating(myReview.rating);
          setComment(myReview.comment || "");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lawyerId, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token || rating === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      if (existingReview) {
        await reviewApi.updateReview(
          existingReview.id,
          { rating, comment, is_anonymous: anonymous },
          token,
        );
      } else {
        await reviewApi.createReview(
          { lawyer_id: Number(lawyerId), rating, comment, is_anonymous: anonymous },
          token,
        );
      }
      navigate(`/client/lawyers/${lawyerId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lawyerId || !lawyer) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-on-surface-variant">Lawyer not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const fullName = [lawyer.first_name, lawyer.last_name].filter(Boolean).join(" ") || "Legal Professional";
  const profileImg = imageUrl(lawyer.image_url) ||
    "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112">
        <rect width="112" height="112" fill="#e0e0e0"/>
        <path fill="#bdbdbd" d="M56 56c12.4 0 22.5-10.1 22.5-22.5S68.4 11 56 11 33.5 21.1 33.5 33.5 43.6 56 56 56zm0 11.2C40.3 67.2 11 76.5 11 95v6h90v-6c0-18.5-29.3-27.8-45-27.8z"/>
      </svg>`,
    );

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-tertiary-fixed-dim"></span>
              <span className="font-label text-xs font-bold tracking-widest uppercase text-tertiary">
                Session Completed
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-6">
              {existingReview ? "Update your review" : "How was your experience?"}
              {!existingReview && ` with ${fullName}?`}
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Your feedback ensures the highest standards of legal representation within the LawyerLink network. Share your perspective on the consultation.
            </p>
          </div>
        </div>

        {!canReview && !existingReview && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">lock</span>
            <p className="text-on-surface-variant text-lg font-medium">
              You need at least one completed consultation with this lawyer before you can leave a review.
            </p>
          </div>
        )}

        {(canReview || existingReview) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 space-y-8">
              <div className="relative group">
                <div className="absolute -left-1 top-8 bottom-8 w-1 bg-tertiary rounded-full z-10"></div>
                <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-8 flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-surface-container-low">
                    <img
                      className="w-full h-full object-cover"
                      alt={fullName}
                      src={profileImg}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-1">{fullName}</h3>
                  <p className="text-sm font-medium text-secondary mb-6">{lawyer.firm || "Legal Professional"}</p>
                  <div className="w-full pt-6 border-t border-surface-container-low flex justify-around">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter opacity-50">Specialty</span>
                      <span className="text-sm font-semibold text-on-surface">{lawyer.specialties ? JSON.parse(lawyer.specialties)[0] || "General" : "General"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter opacity-50">Rating</span>
                      <span className="text-sm font-semibold text-on-surface">{lawyer.rating_avg ? lawyer.rating_avg.toFixed(1) : "New"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-8">
                <h4 className="font-bold text-sm text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Review Standards
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-xs leading-relaxed text-on-surface-variant">
                    <span className="text-primary font-bold">•</span>
                    Be specific about the clarity of the legal advice provided.
                  </li>
                  <li className="flex gap-3 text-xs leading-relaxed text-on-surface-variant">
                    <span className="text-primary font-bold">•</span>
                    Comment on the professionalism and punctuality of the expert.
                  </li>
                  <li className="flex gap-3 text-xs leading-relaxed text-on-surface-variant">
                    <span className="text-primary font-bold">•</span>
                    Your review helps other clients make informed decisions.
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-8 md:p-12 relative overflow-hidden">
                <form className="space-y-12" onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <label className="block font-label text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                      Overall Satisfaction
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="group transition-transform active:scale-95 focus:outline-none cursor-pointer"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star === rating ? 0 : star)}
                          >
                            <span
                              className="material-symbols-outlined text-4xl transition-colors"
                              style={{
                                fontVariationSettings: `'FILL' ${star <= (hoverRating || rating) ? 1 : 0}`,
                                color: star <= (hoverRating || rating) ? "#f59e0b" : undefined,
                              }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <span className="text-sm font-semibold text-on-surface-variant italic">
                          {ratingLabels[rating]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <label className="block font-label text-sm font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="review_text">
                        Detailed Feedback
                      </label>
                      <span className="text-[10px] font-bold text-on-surface-variant/40">REQUIRED</span>
                    </div>
                    <textarea
                      className="w-full bg-surface-container-low border-none rounded-lg p-6 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-300 resize-none leading-relaxed"
                      id="review_text"
                      placeholder="Describe your experience, the lawyer's expertise, and if your objectives were met..."
                      rows={8}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined">error</span>
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                      <input
                        className="rounded border-surface-container-high text-primary focus:ring-primary/20 h-5 w-5 cursor-pointer"
                        id="anonymous"
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                      />
                      <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="anonymous">
                        Post review anonymously
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || rating === 0 || !comment.trim()}
                      className="w-full md:w-auto px-10 py-4 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>

              <p className="mt-8 text-center text-xs text-on-surface-variant/60 max-w-lg mx-auto leading-relaxed">
                By submitting this review, you agree to our Terms of Service and acknowledge that your feedback will be used to improve our services. We never share sensitive case details publicly.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
