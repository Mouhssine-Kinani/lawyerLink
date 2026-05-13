import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { reviewApi } from "../../api/review.api";
import { lawyerApi } from "../../api/lawyer.api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112">
      <rect width="112" height="112" fill="#e0e0e0"/>
      <path fill="#bdbdbd" d="M56 56c12.4 0 22.5-10.1 22.5-22.5S68.4 11 56 11 33.5 21.1 33.5 33.5 43.6 56 56 56zm0 11.2C40.3 67.2 11 76.5 11 95v6h90v-6c0-18.5-29.3-27.8-45-27.8z"/>
    </svg>`,
  );

function renderStars(rating) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span
        key={i}
        className={`material-symbols-outlined text-lg ${i < rating ? "text-on-tertiary-container" : "text-outline-variant"}`}
        style={{ fontVariationSettings: `'FILL' ${i < rating ? 1 : 0}` }}
      >
        star
      </span>,
    );
  }
  return stars;
}

export default function MyReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [lawyers, setLawyers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function loadReviews() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reviewApi.getMyReviews(token);
      const sorted = (data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setReviews(sorted);

      const lawyerIds = [...new Set((data || []).map((r) => r.lawyer_id))];
      const results = await Promise.all(
        lawyerIds.map((id) => lawyerApi.getLawyerById(id).catch(() => null)),
      );
      const map = {};
      lawyerIds.forEach((id, i) => {
        if (results[i]) map[id] = results[i];
      });
      setLawyers(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [token]);

  async function handleDelete(reviewId) {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone. Are you sure you want to delete this review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b42318",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      background: "#fafcff",
      backdrop: "rgba(0,0,0,0.4)",
      customClass: {
        title: "text-on-surface text-lg font-bold",
        htmlContainer: "text-on-surface-variant text-sm",
        confirmButton: "px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg",
        cancelButton: "px-6 py-2.5 rounded-lg text-sm font-bold",
        popup: "rounded-2xl ambient-shadow",
      },
    });
    if (!result.isConfirmed) return;
    setDeleting(reviewId);
    try {
      await reviewApi.deleteReview(reviewId, token);
      await loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 md:ml-0 px-6 md:px-16 py-12">
          {/* Header */}
          <header className="mb-16">
            <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2">My Reviews</h2>
            <p className="text-on-surface-variant text-lg max-w-2xl">
              Manage the feedback you&apos;ve shared regarding your legal consultations. Your honest perspective helps maintain the standard of the LawyerLink network.
            </p>
          </header>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Review Feed */}
          {!loading && reviews.length > 0 && (
            <div className="space-y-12">
              {reviews.map((review) => {
                const lawyer = lawyers[review.lawyer_id];
                const fullName = lawyer
                  ? [lawyer.first_name, lawyer.last_name].filter(Boolean).join(" ") || "Legal Professional"
                  : "Loading...";

                return (
                  <article
                    key={review.id}
                    className="bg-surface-container-lowest rounded-xl ambient-shadow p-8 flex flex-col md:flex-row gap-8 relative border-l-4 border-tertiary group"
                  >
                    {/* Lawyer Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        className="w-20 h-20 rounded-lg object-cover ring-4 ring-surface-container-low"
                        src={imageUrl(lawyer?.image_url) || PLACEHOLDER_AVATAR}
                        alt={fullName}
                      />
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary">{fullName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant px-2 py-0.5 bg-surface-container-high rounded">
                              Completed
                            </span>
                            <span className="text-on-surface-variant text-sm font-medium">
                              Review submitted on {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full">
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        </div>
                      </div>

                      <div className="bg-surface-container-low p-6 rounded-lg italic text-on-surface leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </div>

                      <div className="flex items-center justify-between text-on-surface-variant text-xs">
                        <span className="font-medium italic">Submitted on {formatDate(review.created_at)}</span>
                        <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/client/reviews?lawyerId=${review.lawyer_id}`}
                            className="flex items-center gap-1.5 hover:text-primary font-bold uppercase tracking-widest"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deleting === review.id}
                            className="flex items-center gap-1.5 hover:text-error font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            {deleting === review.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl">rate_review</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">No Reviews Yet</h3>
              <p className="text-on-surface-variant max-w-sm mb-8">
                Once you complete a consultation, you can leave a review here to help others and give feedback to your attorney.
              </p>
              <Link
                to="/client/lawyers"
                className="bg-primary text-on-primary px-8 py-3 rounded-md font-bold tracking-tight hover:brightness-110 transition-all"
              >
                Explore Lawyers
              </Link>
            </div>
          )}
        </main>

        <footer className="md:ml-0 py-12 px-6 md:px-16 border-t border-surface-container-low">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-on-surface-variant text-sm font-medium">&copy; 2024 LawyerLink SaaS. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-8">
              {["Terms of Service", "Privacy Policy", "Contact Support", "Legal Disclaimer"].map((link) => (
                <a key={link} className="text-xs font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors" href="#">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
