import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { paymentApi } from "../../api/payment.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Entry Level",
    desc: "For solo practitioners getting started.",
    price: 0,
    features: ["Up to 5 active cases", "Standard legal templates", "Basic client portal"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Professional",
    desc: "For growing firms ready to scale.",
    price: 299,
    recommended: true,
    features: ["Unlimited active cases", "AI Document Analysis (50/mo)", "Priority support line", "Custom firm branding"],
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Enterprise",
    desc: "For full-scale legal operations.",
    price: 499,
    features: ["Full firm API access", "Unlimited AI interactions", "Dedicated Account Manager", "Multi-office sync"],
  },
];

const BOOSTS = [
  {
    level: 1,
    name: "The Sprint",
    desc: "Ideal for weekly case surges.",
    price: 149,
    duration: "7 days",
    features: ["Top 3 Search Placement", "Local Geo-Targeting"],
  },
  {
    level: 2,
    name: "The Catalyst",
    desc: "Build consistent practice momentum.",
    price: 269,
    duration: "14 days",
    recommended: true,
    features: ["Priority Search Ranking", "AI-Driven Lead Matching", "Custom Practice Tags"],
  },
  {
    level: 3,
    name: "The Authority",
    desc: "Long-term market dominance.",
    price: 499,
    duration: "30 days",
    features: ["Global Network Access", "24/7 Placement Lock", "Performance Audit Report"],
  },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subData, historyData] = await Promise.all([
        paymentApi.getMySubscription(),
        paymentApi.getPaymentHistory(),
      ]);
      setSubscription(subData);
      setHistory(historyData);
    } catch (err) {
      setError("Failed to load subscription data. Please try again.");
      console.error("Error fetching subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (type, planOrLevel = null) => {
    try {
      setProcessing(`${type}_${planOrLevel || "pro"}`);
      setError(null);
      let intent;
      if (type === "subscription") {
        intent = await paymentApi.createSubscriptionIntent(planOrLevel);
      } else {
        intent = await paymentApi.createBoostIntent(planOrLevel);
      }

      await paymentApi.simulateSuccess(
        intent.transaction_id,
        type,
        type === "boost" ? planOrLevel : 1,
        type === "subscription" ? planOrLevel : "pro"
      );

      await fetchData();
    } catch (err) {
      const label = type === "subscription" ? "Plan" : "Boost";
      setError(`Failed to purchase ${label}. Please try again.`);
      console.error(`Error purchasing ${type}:`, err);
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      setProcessing("cancel");
      await paymentApi.cancelSubscription();
      await fetchData();
    } catch (err) {
      setError("Failed to cancel subscription.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-12 lg:px-24">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-16">
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
              Membership & Billing
            </span>
            <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-4">
              Elevate your legal practice.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
              Choose the tier that fits your firm&apos;s scale. Seamlessly manage
              your subscriptions, payment methods, and historical records.
            </p>
          </div>

          {error && (
            <div className="max-w-6xl mx-auto mb-8 p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto material-symbols-outlined hover:opacity-70 cursor-pointer">
                close
              </button>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-start">
            {PLANS.map((plan) => {
              const isActive = subscription?.plan_type === plan.id;
              const showRecommended = plan.recommended && !subscription;

              return (
                <div
                  key={plan.id}
                  className={`bg-surface-container-lowest p-8 rounded-xl shadow-sm border relative overflow-hidden group ${
                    showRecommended
                      ? "border-2 border-primary shadow-2xl transform md:-translate-y-4"
                      : isActive
                      ? "border-2 border-emerald-400 shadow-lg"
                      : "border-outline-variant/10"
                  }`}
                >
                  {showRecommended && (
                    <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-4 py-1 rounded-bl-lg uppercase tracking-widest">
                      Recommended
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-lg uppercase tracking-widest">
                      Current
                    </div>
                  )}
                  <div className="mb-8">
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      plan.id === "elite" ? "text-on-tertiary-container" : "text-secondary"
                    }`}>
                      {plan.tagline}
                    </span>
                    <h2 className={`text-2xl font-bold mt-2 ${plan.id === "pro" ? "text-3xl" : ""}`}>
                      {plan.name}
                    </h2>
                    <p className="text-sm text-outline mt-1">{plan.desc}</p>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className={`font-bold text-on-surface ${plan.id === "pro" ? "text-5xl" : "text-4xl"}`}>
                        MAD {plan.price}
                      </span>
                      <span className="text-on-surface-variant font-medium">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isActive ? (
                    <div className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-md flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Active Plan
                    </div>
                  ) : plan.id === "basic" ? (
                    <div className="w-full py-3 border border-outline-variant text-on-surface font-semibold rounded-md text-center opacity-60 cursor-not-allowed">
                      Free
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchase("subscription", plan.id)}
                      disabled={processing === `subscription_${plan.id}`}
                      className="w-full py-3 primary-gradient text-white font-bold rounded-md shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      {processing === `subscription_${plan.id}` ? "Processing..." : "Upgrade Now"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Subscription Details */}
          {subscription && (
            <div className="max-w-6xl mx-auto mb-20">
              <h3 className="text-xl font-bold mb-6">Current Plan Details</h3>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">stars</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold capitalize">{subscription.plan_type || "Pro"} Subscription</p>
                    <p className="text-sm text-outline">
                      Renews on {formatDate(subscription.end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    {subscription.status}
                  </span>
                  <button
                    onClick={handleCancel}
                    disabled={processing === "cancel"}
                    className="text-error text-sm font-bold hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {processing === "cancel" ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Boost Visibility Section */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-wider mb-4">
                Marketing Engine
              </span>
              <h3 className="text-2xl font-bold text-on-surface tracking-tight mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">flash_on</span>
                Boost Your Visibility
              </h3>
              <p className="text-on-surface-variant max-w-2xl leading-relaxed">
                Strategic visibility tools designed to place your expertise in front
                of high-intent clients exactly when they need legal counsel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {BOOSTS.map((boost) => {
                const showRecommended = boost.recommended;

                return (
                  <div
                    key={boost.level}
                    className={`group relative bg-surface-container-lowest p-8 rounded-xl transition-all border ${
                      showRecommended
                        ? "shadow-[0_20px_40px_rgba(13,28,46,0.06)] border-2 border-primary/10 transform md:-translate-y-4"
                        : "shadow-sm border-outline-variant/10 hover:shadow-xl"
                    }`}
                  >
                    {showRecommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                        Most Professional Choice
                      </div>
                    )}
                    {!subscription && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
                        <span className="text-xs font-bold text-outline uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
                          Requires Pro Plan
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-secondary">rocket_launch</span>
                      <h4 className="text-lg font-bold">{boost.name}</h4>
                    </div>
                    <p className="text-outline text-sm mb-6">{boost.desc}</p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-bold text-on-surface">MAD {boost.price}</span>
                      <span className="text-outline text-sm">/ {boost.duration}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {boost.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium">
                          <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePurchase("boost", boost.level)}
                      disabled={processing === `boost_${boost.level}` || !subscription}
                      className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                        showRecommended
                          ? "primary-gradient text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02]"
                          : "border border-outline-variant text-primary hover:bg-primary hover:text-on-primary"
                      }`}
                    >
                      {!subscription
                        ? "Requires Pro Plan"
                        : processing === `boost_${boost.level}`
                        ? "Processing..."
                        : "Activate Boost"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">analytics</span>
                Performance Metrics
              </h3>
              <span className="text-xs font-semibold text-outline uppercase tracking-widest">
                Period: Last 30 Days
              </span>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="font-bold text-on-surface">Ad Reach Momentum</h4>
                    <p className="text-xs text-outline">Impressions across the legal network</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-outline uppercase">Total Reach</p>
                      <p className="text-xl font-bold">12,482</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-secondary uppercase">Growth</p>
                      <p className="text-xl font-bold text-secondary">+14.2%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3 h-40">
                  {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                    <div key={i} className="w-full bg-surface-container-high rounded-t-lg relative h-full flex items-end">
                      <div
                        className="w-full bg-secondary rounded-t-lg opacity-80 transition-all group-hover:opacity-100"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="material-symbols-outlined text-secondary mb-2">visibility</span>
                      <h4 className="font-bold text-sm">Profile Views</h4>
                    </div>
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">+8%</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">2,104</div>
                    <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: "65%" }} />
                    </div>
                    <p className="text-[10px] text-outline font-medium mt-2">Active view rate vs. last month</p>
                  </div>
                </div>
                <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="material-symbols-outlined text-on-tertiary-container mb-2">hub</span>
                      <h4 className="font-bold text-sm">Lead Conversion</h4>
                    </div>
                    <span className="text-xs font-bold text-on-tertiary-container bg-on-tertiary-container/10 px-2 py-1 rounded">High</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">42 <span className="text-lg text-outline">leads</span></div>
                    <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "42%" }} />
                    </div>
                    <p className="text-[10px] text-outline font-medium mt-2">12.5% increase in lead quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="max-w-6xl mx-auto mb-24">
            <h3 className="text-xl font-bold mb-6">Payment Methods</h3>
            <div className="space-y-4 max-w-md">
              <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-surface-container rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Visa ending in 4242</p>
                    <p className="text-xs text-outline">Expires 12/26</p>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Primary</span>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-surface-container rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Mastercard ending in 8831</p>
                    <p className="text-xs text-outline">Expires 05/25</p>
                  </div>
                </div>
                <button className="material-symbols-outlined text-outline hover:text-error text-[20px] transition-colors cursor-pointer">delete</button>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/10 flex items-center justify-center gap-2 text-outline hover:border-secondary hover:text-secondary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="font-medium text-sm">Add New Method</span>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="max-w-6xl mx-auto mb-24">
            <h3 className="text-xl font-bold mb-6">Billing History</h3>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
              {history.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/10">
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Transaction ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">#{item.id}</td>
                        <td className="px-6 py-4 text-sm font-medium capitalize">{item.type}</td>
                        <td className="px-6 py-4 text-sm font-bold text-on-surface">
                          MAD {Number(item.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "success"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-10 text-center text-outline italic">
                  <span className="material-symbols-outlined text-3xl mb-2 block">receipt_long</span>
                  No transactions found. Purchase a plan or boost to see your billing history.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
