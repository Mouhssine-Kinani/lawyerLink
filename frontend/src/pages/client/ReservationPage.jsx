import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { lawyerApi } from "../../api/lawyer.api";
import { reservationApi } from "../../api/reservation.api";
import { AuthContext } from "../../context/AuthContext";

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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReservationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const lawyerId = searchParams.get("lawyerId");

  const [lawyer, setLawyer] = useState(null);
  const [lawyerLoading, setLawyerLoading] = useState(true);
  const [lawyerError, setLawyerError] = useState(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState(null);

  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [existingReservation, setExistingReservation] = useState(null);
  const redirectTimer = useRef(null);

  useEffect(() => {
    if (!lawyerId) {
      setLawyerError("No lawyer specified");
      setLawyerLoading(false);
      return;
    }
    setLawyerLoading(true);
    setLawyerError(null);
    lawyerApi.getLawyerById(lawyerId)
      .then((data) => setLawyer(data))
      .catch((err) => setLawyerError(err.message))
      .finally(() => setLawyerLoading(false));
  }, [lawyerId]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      setSelectedSlot(null);
      return;
    }
    setAvailLoading(true);
    setAvailError(null);
    setSelectedSlot(null);
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    reservationApi.getLawyerAvailability(lawyerId, dateStr)
      .then((data) => setAvailability(data))
      .catch((err) => setAvailError(err.message))
      .finally(() => setAvailLoading(false));
  }, [selectedDate, lawyerId]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!lawyerId) return;
    lawyerApi.getLawyerMonthAvailability(lawyerId, calYear, calMonth + 1)
      .then((data) => setFullyBookedDates(data.fully_booked_dates || []))
      .catch(() => {});
  }, [calYear, calMonth, lawyerId]);

  useEffect(() => {
    if (success && lawyerId) {
      redirectTimer.current = setTimeout(() => {
        navigate(`/client/lawyers/${lawyerId}`);
      }, 3000);
    }
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [success, lawyerId, navigate]);

  useEffect(() => {
    if (!lawyerId || !token) return;
    reservationApi.getReservations(null, 50, token)
      .then((reservations) => {
        const existing = (reservations || []).find(
          (r) => r.lawyer_id === parseInt(lawyerId, 10) &&
                (r.status === "pending" || r.status === "accepted")
        );
        setExistingReservation(existing || null);
      })
      .catch(() => {});
  }, [lawyerId, token]);

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function isPastDate(year, month, day) {
    const d = new Date(year, month, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  }

  function formatDateLabel(date) {
    if (!date) return "";
    return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  async function handleSubmit() {
    if (!selectedDate || !selectedSlot || !lawyerId) return;
    setSubmitting(true);
    setSubmitError(null);

    // Combine date + time
    const [timeStr, ampm] = selectedSlot.split(" ");
    const [h] = timeStr.split(":");
    let hour = parseInt(h, 10);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, 0, 0, 0);

    // Format date in local time (no UTC conversion) to match backend's naive datetime
    const year = slotDate.getFullYear();
    const month = String(slotDate.getMonth() + 1).padStart(2, "0");
    const day = String(slotDate.getDate()).padStart(2, "0");
    const hours = String(slotDate.getHours()).padStart(2, "0");
    const mins = String(slotDate.getMinutes()).padStart(2, "0");
    const localDateStr = `${year}-${month}-${day}T${hours}:${mins}:00`;

    const fullNotes = [subject, notes].filter(Boolean).join("\n");

    try {
      if (!token) {
        throw new Error("You must be logged in to make a reservation");
      }
      await reservationApi.createReservation(
        {
          lawyer_id: parseInt(lawyerId, 10),
          reservation_date: localDateStr,
          notes: fullNotes || null,
        },
        token
      );
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!lawyerId) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-outline">error_outline</span>
            <p className="text-on-surface-variant">No lawyer selected</p>
            <Link to="/client/lawyers" className="text-primary font-semibold underline">Browse lawyers</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (lawyerLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading lawyer details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (lawyerError) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-outline">error_outline</span>
            <p className="text-on-surface-variant">{lawyerError}</p>
            <Link to="/client/lawyers" className="text-primary font-semibold underline">Browse lawyers</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/95 text-white px-6 py-4 shadow-2xl shadow-primary/30 flex items-center justify-center gap-4">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-bold">Consultation request submitted successfully! Redirecting to lawyer profile...</span>
        </div>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-3xl font-bold text-on-surface">Request Sent!</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Your consultation request with <strong>{lawyer.first_name} {lawyer.last_name}</strong> has been submitted. The lawyer will review and respond shortly.
            </p>
            <p className="text-sm text-on-surface-variant/70">Status: <span className="font-semibold text-primary uppercase">Pending</span></p>
            <div className="flex gap-4 justify-center pt-4">
              <Link to="/client/reservations" className="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors">
                View My Reservations
              </Link>
              <Link to={`/client/lawyers/${lawyerId}`} className="px-8 py-4 border border-outline text-sm font-bold rounded-lg hover:bg-surface-container-low transition-colors">
                Back to Profile
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const specialties = parseSpecialties(lawyer.specialties);
  const fullName = [lawyer.first_name, lawyer.last_name].filter(Boolean).join(" ") || "Legal Professional";
  const profileImg = imageUrl(lawyer.image_url);
  const totalRating = lawyer.rating_avg || 0;
  const reviewCount = lawyer.rating_count || 0;

  const daysCount = daysInMonth(calYear, calMonth);
  const startDay = firstDayOfMonth(calYear, calMonth);
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysCount; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-24">
        {/* Multi-step Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-4">Book Your Consultation</h1>
          <p className="text-lg text-on-surface-variant">Select a preferred date and time for your initial legal strategy session.</p>
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
                  {profileImg ? (
                    <img className="w-full h-full object-cover" alt={fullName} src={profileImg} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-bold text-2xl">
                      {(lawyer.first_name?.[0] || "") + (lawyer.last_name?.[0] || "") || "L"}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-1">{fullName}</h2>
                <span className="text-sm font-semibold text-secondary mb-4">{lawyer.firm || "Legal Professional"}</span>
                <div className="flex items-center gap-1 text-on-tertiary-container mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${i <= Math.round(totalRating) ? 1 : 0}` }}>star</span>
                  ))}
                  <span className="ml-2 text-sm font-bold text-on-surface">{totalRating > 0 ? totalRating.toFixed(1) : "--"} ({reviewCount} reviews)</span>
                </div>
                <div className="w-full text-left space-y-4 pt-6 border-t border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">work</span>
                    <span className="text-sm text-on-surface-variant">{specialties.slice(0, 2).join(", ") || "Legal Professional"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                    <span className="text-sm text-on-surface-variant">{lawyer.city || "N/A"}{lawyer.region ? `, ${lawyer.region}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                    <span className="text-sm text-on-surface-variant">1 Hour Consultation</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl" style={{ borderLeft: "4px solid #f59e0b" }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed-variant mb-3">Notice</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your request will be sent to the lawyer for review. You will be notified once they accept or decline.
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
                  <p className="text-sm text-on-surface-variant">Available dates for {MONTHS[calMonth]} {calYear}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="text-sm font-bold w-32 text-center">{MONTHS[calMonth]} {calYear}</span>
                  <button onClick={nextMonth} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-bold text-on-surface-variant/50 uppercase">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${i}`} className="h-14" />;
                    }
                    const dateObj = new Date(calYear, calMonth, day);
                    const isPast = isPastDate(calYear, calMonth, day);
                    const isSelected = selectedDate && dateObj.toDateString() === selectedDate.toDateString();
                    const isToday = dateObj.toDateString() === today.toDateString();
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isFull = !isPast && !isSelected && fullyBookedDates.includes(dateStr);

                    let classes = "h-14 flex items-center justify-center text-sm font-medium rounded-xl transition-all ";
                    if (isPast) {
                      classes += "text-on-surface-variant/30 cursor-not-allowed";
                    } else if (isSelected) {
                      classes += "bg-primary text-white shadow-lg shadow-primary/20";
                    } else if (isFull) {
                      classes += "bg-error-container/20 text-error cursor-not-allowed line-through decoration-error/40";
                    } else {
                      classes += "text-on-surface cursor-pointer hover:bg-primary/5";
                    }

                    return (
                      <div
                        key={day}
                        className={classes}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(dateObj);
                          }
                        }}
                      >
                        {day}
                        {isToday && !isSelected && (
                          <span className="absolute w-1 h-1 rounded-full bg-primary mt-5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Slot Grid */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm ring-1 ring-on-surface/5 p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-on-surface">Available Times</h3>
                <p className="text-sm text-on-surface-variant">
                  {selectedDate ? formatDateLabel(selectedDate) : "Select a date above"}
                </p>
              </div>

              {!selectedDate && (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-3xl text-outline mb-2">calendar_month</span>
                  <p className="text-on-surface-variant text-sm">Choose a date to see available time slots</p>
                </div>
              )}

              {availLoading && selectedDate && (
                <div className="py-10 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {availError && selectedDate && (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-3xl text-outline mb-2">error_outline</span>
                  <p className="text-on-surface-variant text-sm">{availError}</p>
                </div>
              )}

              {availability && !availLoading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availability.slots.map((slot) => {
                    const isBooked = !slot.available;
                    const isSelected = selectedSlot === slot.time;

                    let classes = "py-4 text-sm font-bold rounded-lg transition-all ";
                    if (isBooked) {
                      classes += "border border-surface-container-high opacity-30 cursor-not-allowed bg-surface-container-low";
                    } else if (isSelected) {
                      classes += "bg-primary text-white shadow-lg shadow-primary/20";
                    } else {
                      classes += "border border-surface-container-high hover:border-primary hover:text-primary cursor-pointer";
                    }

                    return (
                      <button
                        key={slot.time}
                        className={classes}
                        disabled={isBooked}
                        onClick={() => !isBooked && setSelectedSlot(slot.time)}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}

              {availability && availability.slots.every((s) => !s.available) && !availLoading && (
                <p className="text-center text-sm text-on-surface-variant mt-4">No available slots on this date.</p>
              )}
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
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">Additional Notes</label>
                  <textarea
                    className="w-full bg-surface-container-low border-0 focus:ring-1 focus:ring-primary rounded-lg py-4 px-5 text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="Describe the core legal issue you wish to discuss..."
                    rows="4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {existingReservation && (
              <div className="bg-error-container/10 border border-error/20 rounded-xl p-5 text-sm text-error">
                <span className="material-symbols-outlined align-middle mr-2 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="font-bold">Already booked:</span> You have a <strong>{existingReservation.status}</strong> reservation with this lawyer. Wait for it to be resolved before booking another.
              </div>
            )}

            {submitError && (
              <div className="bg-error-container/10 border border-error/20 rounded-xl p-5 text-sm text-error">
                <span className="font-bold">Error:</span> {submitError}
              </div>
            )}

            {/* Action Section */}
            <div className="flex items-center justify-between pt-8">
              <Link
                to={`/client/lawyers/${lawyerId}`}
                className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Profile
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedSlot || submitting || !!existingReservation}
                className={`px-12 py-4 text-lg font-bold text-white rounded-xl shadow-xl transition-all ${
                  !selectedDate || !selectedSlot || submitting || !!existingReservation
                    ? "bg-outline/50 cursor-not-allowed"
                    : "bg-gradient-to-br from-primary to-primary-container shadow-primary/20 hover:scale-[1.02]"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
