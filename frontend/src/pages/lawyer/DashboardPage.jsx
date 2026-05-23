import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { reservationApi } from "../../api/reservation.api";
import { paymentApi } from "../../api/payment.api";
import { lawyerApi } from "../../api/lawyer.api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PIE_COLORS = ["#1e7e34", "#3b9e4e", "#6abe7a", "#f59e0b", "#b42318"];

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day;
  const start = new Date(today);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount || 0);
}

const PLAN_LABELS = { basic: "Basic", pro: "Pro", elite: "Elite" };
const PLAN_COLORS = { basic: "bg-surface-container-high text-on-surface-variant", pro: "bg-primary-container text-on-primary-container", elite: "bg-secondary-fixed text-on-secondary-fixed" };

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

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [weekData, setWeekData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [recentReviews, setRecentReviews] = useState([]);
  const [completedTodayCount, setCompletedTodayCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    Promise.all([
      lawyerApi.getMyProfile(token).catch(() => null),
      reservationApi.getReservations("completed", 100, token).catch(() => []),
      reservationApi.getReservations("pending", 100, token).catch(() => []),
      paymentApi.getMySubscription().catch(() => null),
    ])
      .then(([profile, completedRes, pendingRes, sub]) => {
        const uid = profile?.id || user?.id;
        setUserId(uid);

        setCompletedTodayCount(
          completedRes.filter((r) => {
            const rd = new Date(r.reservation_date);
            const today = new Date();
            return rd.toDateString() === today.toDateString();
          }).length
        );
        setPendingCount(pendingRes.length);
        setSubscription(sub);

        const { start, end } = getWeekRange();
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          weekDays.push(d);
        }

        const weekMap = weekDays.map((d) => {
          const dateStr = formatDateStr(d);
          const count = completedRes.filter((r) => {
            const rd = new Date(r.reservation_date);
            return formatDateStr(rd) === dateStr;
          }).length;
          return { day: DAY_NAMES[d.getDay()], count, fullDate: dateStr };
        });
        setWeekData(weekMap);

        if (uid) {
          return lawyerApi.getLawyerReviews(uid, 100);
        }
        return [];
      })
      .then((reviews) => {
        if (!reviews) reviews = [];
        setRecentReviews(
          [...reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4),
        );
        setTotalReviews(reviews.length);

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          setAvgRating(sum / reviews.length);

          const dist = {};
          for (let i = 1; i <= 5; i++) dist[i] = 0;
          reviews.forEach((r) => {
            if (dist[r.rating] !== undefined) dist[r.rating]++;
          });
          setRatingData(
            [5, 4, 3, 2, 1].map((stars) => ({
              name: `${stars} Star`,
              value: dist[stars],
              stars,
            }))
          );
        } else {
          setAvgRating(0);
          setRatingData([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-on-surface-variant text-sm font-medium">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalWeekReservations = weekData.reduce((acc, d) => acc + d.count, 0);
  const ratingSum = ratingData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-10 max-w-7xl mx-auto space-y-10 overflow-y-auto">
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Welcome back, Counselor</h2>
              <p className="text-on-surface-variant text-lg">
                You have{" "}
                <span className="text-secondary font-semibold">
                  {completedTodayCount} consultation{completedTodayCount !== 1 ? "s" : ""} today
                </span>
                {pendingCount > 0 && (
                  <span>
                    {" "}and{" "}
                    <span className="text-error font-semibold">{pendingCount} pending</span>
                  </span>
                )}.
              </p>
            </div>
            <Link
              to="/lawyer/reservations"
              className="px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Reservations
            </Link>
          </section>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Weekly Reservations Chart */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 custom-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Weekly Reservations</p>
                  <h3 className="text-2xl font-bold mt-1 text-on-surface">{totalWeekReservations} this week</h3>
                </div>
              </div>
              {weekData.length > 0 ? (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekData} barCategoryGap="20%">
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(13,28,46,0.08)" }}
                        labelStyle={{ fontWeight: 700, color: "#0d1c2e" }}
                        itemStyle={{ fontSize: 13 }}
                        formatter={(value) => [`${value} reservation${value !== 1 ? "s" : ""}`, "Completed"]}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                        {weekData.map((entry, i) => (
                          <Cell key={i} fill={entry.count > 0 ? "#1e3a5f" : "#e2e8f0"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-outline text-sm">No completed reservations this week</p>
                </div>
              )}
            </div>

            {/* Rating Distribution Doughnut */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-8 custom-shadow">
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-4">Rating Distribution</p>
              {ratingData.length > 0 && ratingSum > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="h-52 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                          stroke="none"
                        >
                          {ratingData.map((entry, i) => (
                            <Cell key={i} fill={PIE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(13,28,46,0.08)" }}
                          formatter={(value, name) => [`${value} review${value !== 1 ? "s" : ""}`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-3xl font-bold text-on-surface">{avgRating > 0 ? avgRating.toFixed(1) : "--"}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: `'FILL' ${s <= Math.round(avgRating) ? 1 : 0}` }}>
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-outline mt-1">{totalReviews} total reviews</p>
                  <div className="w-full mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars, i) => {
                      const item = ratingData.find((d) => d.stars === stars);
                      const count = item?.value || 0;
                      const pct = ratingSum > 0 ? (count / ratingSum) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-12 text-right text-on-surface-variant font-medium">{stars} star</span>
                          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i] }} />
                          </div>
                          <span className="w-8 text-right text-on-surface-variant">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-outline block mb-2">reviews</span>
                    <p className="text-outline text-sm">No reviews yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Plan */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-8 custom-shadow">
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-4">Subscription Plan</p>
              {subscription ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-on-surface">{PLAN_LABELS[subscription.plan_type] || subscription.plan_type}</p>
                      <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${PLAN_COLORS[subscription.plan_type] || "bg-surface-container-high text-on-surface-variant"}`}>
                        {subscription.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Started</p>
                      <p className="text-sm font-semibold text-on-surface mt-0.5">
                        {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                      </p>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Expires</p>
                      <p className="text-sm font-semibold text-on-surface mt-0.5">
                        {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/lawyer/subscription"
                    className="block w-full text-center py-3 border border-outline-variant text-sm font-bold rounded-lg text-on-surface hover:bg-surface-container-low transition-all"
                  >
                    Manage Plan
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-outline block mb-2">credit_card_off</span>
                  <p className="text-outline text-sm mb-4">No active subscription</p>
                  <Link
                    to="/lawyer/subscription"
                    className="inline-block px-6 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Subscribe Now
                  </Link>
                </div>
              )}
            </div>

            {/* Earnings Overview */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 custom-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Earnings Overview</p>
                  <h3 className="text-2xl font-bold mt-1 text-on-surface">--</h3>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-surface-container-low text-xs rounded-lg font-medium cursor-pointer">Monthly</button>
                  <button className="px-3 py-1 text-xs text-on-surface-variant rounded-lg font-medium cursor-pointer">Quarterly</button>
                </div>
              </div>
              <div className="h-48 flex items-end gap-3 px-4">
                {weekData.map((d, i) => (
                  <div key={i} className="w-full flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-lg transition-all ${d.count > 0 ? "bg-primary/40 hover:bg-primary/60" : "bg-surface-container-low"}`}
                      style={{ height: d.count > 0 ? `${Math.max(d.count * 40, 16)}px` : "12px" }}
                    />
                    <span className="text-[10px] text-outline">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          {recentReviews.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Recent Reviews</p>
                  <h3 className="text-2xl font-bold mt-1 text-on-surface">Latest Feedback</h3>
                </div>
                <Link
                  to="/lawyer/reviews"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentReviews.map((review) => (
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
                          src={imageUrl(review.client_image_url) || "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><rect width="112" height="112" fill="#e0e0e0"/><path fill="#bdbdbd" d="M56 56c12.4 0 22.5-10.1 22.5-22.5S68.4 11 56 11 33.5 21.1 33.5 33.5 43.6 56 56 56zm0 11.2C40.3 67.2 11 76.5 11 95v6h90v-6c0-18.5-29.3-27.8-45-27.8z"/></svg>`)}
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
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
