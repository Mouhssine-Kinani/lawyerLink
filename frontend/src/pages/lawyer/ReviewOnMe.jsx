import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../hooks/useAuth";
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
        className={`material-symbols-outlined text-lg ${i < rating ? "text-tertiary" : "text-outline-variant"}`}
        style={{ fontVariationSettings: `'FILL' ${i < rating ? 1 : 0}` }}
      >
        star
      </span>,
    );
  }
  return stars;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function ReviewOnMe() {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !user?.id) return;
    setLoading(true);
    setError(null);

    lawyerApi.getLawyerReviews(user.id, 100)
      .then((data) => {
        const sorted = (data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setReviews(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, user?.id]);

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 md:ml-0 px-6 md:px-16 py-12">
          <header className="mb-16">
            <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Reviews Received</h2>
            <p className="text-on-surface-variant text-lg max-w-2xl">
              Feedback from clients who have completed consultations with you.
            </p>
          </header>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-surface-container-lowest rounded-xl ambient-shadow p-8 flex flex-col gap-6 border-l-4 border-tertiary"
                >
                  <div className="flex items-center gap-4">
                    {review.is_anonymous ? (
                      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-outline text-2xl">visibility_off</span>
                      </div>
                    ) : (
                      <img
                        className="w-14 h-14 rounded-full object-cover ring-4 ring-surface-container-low flex-shrink-0"
                        src={imageUrl(review.client_image_url) || PLACEHOLDER_AVATAR}
                        alt={review.is_anonymous ? "Anonymous" : `${review.client_first_name || ""} ${review.client_last_name || ""}`}
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-primary truncate">
                        {review.is_anonymous ? "Anonymous Client" : [review.client_first_name, review.client_last_name].filter(Boolean).join(" ") || "Client"}
                      </h3>
                      <div className="flex gap-0.5 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-6 rounded-lg italic text-on-surface leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </div>

                  <div className="text-xs text-on-surface-variant font-medium">
                    {formatDate(review.created_at)}
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl">reviews</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">No Reviews Yet</h3>
              <p className="text-on-surface-variant max-w-sm">
                Reviews from clients will appear here once they complete consultations with you.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
