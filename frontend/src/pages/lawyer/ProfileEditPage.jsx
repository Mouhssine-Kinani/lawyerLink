import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { lawyerApi } from "../../api/lawyer.api";
import { useAuth } from "../../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\//, "")}`;
}

const PLACEHOLDER_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRCKxGzp6_RP2TueZfgTzC250PEJid_LvtCfiwDTdVUM27Qqu6fboagZtErjdkJMVR9DEu93pX9K8tkoTZj5yaEuiDrZqgpoUXsNr2iDTXuujVfkDXDAlEsV4VQySBHwmkqtbIAWicgch0ZY7-8AqmccIRHveoNzEoum82VsdmbTpdk9tmg3WOkFNwoPtnMAr9jJsx0vO4_uAb2ZBCJ5hhtM7Zlz6O7g7TDjEMzueNPkKC4TINRo6WCMxqM_SR96AUAwgjGgc3e6Ou",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYuUYsNycerWuKUp4MmLw_hVvhB4JEiDRUyTZIPkzqSC38InmblOtZMxS_z9fbu97lj668_Suaiv3a_lMhbPDKofWwOEE5i3H27nsgaJEQFgKYebN7kpcoMa7Ctq9Gf1iKa8dC9dToNUud-FbV0u3_DQoFMcY06I1r9dibSytUM_Va72vS8MJgh8zua1BoIg96bmhR8XZN7jWMcst5j3pRFp6_xsGUbDjYedCl-58qK_cHb_hBpspantd01l_2fOQHrP5pXONlv-v8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiDOOSRikWKLdQPzFC9BLwFCIXIUlsAa0QPKjCY4ZN11X9Q9dH7ksVQImn6VVQ3l4TU6RityjlsQXzlAaZPHDhLy7PoLGSL134WXktHPrUMX3WQhDaadHVVoG_CKyh2P_g-0KxEBB7ya5MUjbrnDzbmktmS5WrFXlfmvE22z-BG5y34nYYoOpOTk84qOp5f7ePDbUu8vq95wZ1FJy7UqAR2PwpaJrQmiKdUNmygGs6l9nXVKLInmYhNuZwRXBkHuz102ksoXs8260T",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAR7gw7yoy1-I2YknYUXT8aH0N7csQmjXnorwzmoseMmeVGH4l6HY-YoG4A5cbDNPyp_j0pyzOGzbzpMzhZXDak9gS6t5Zt_jSyoyZLFl8REHqzDBUvYcrnYJki5ci7fvNKR9nW0Cs0jAiBBd2jYdKyuc9jnJHESgntKFrsJcLERdg4vhzawzEqDG5a5Y8FF76ZRiDIQxWArL_-mtyu01iyt2hAn_4zIjMN1Pe8jonzDQh1si4jbiovXi6OjVTgf67A_JBp_5bOmn8M",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB7iZsu-Dt4z9_6SarD5qEC4JjcOGtx_9AmIqxJxvwC_WzBAnh-siSkYYvLAh7zZHULxmoKQhfe9_e0PtRCKyaMTVcKpsBmQlbHL3YEyeqzKtkp9ybZl0wx6FROC1PJwMaYB5mJulRzWUHKDT_QBWuoxquZHbjcFRMftQRX78KIIVebUN-e6LLAfePrNLe9JCAO9FMPNBpL_wBtbhqYleLEBS4QKqfgaJfPs_ickAe0WOm985LGloo1mejO9ZnlHwux8-n4OcwQMjBb",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBQpk2HMbVWTApacNHxTFpFRhTNeSLHPsFKl-qxrp4Pxxtk5PhB8BFLAVbGpt2nTqxlgKEaZ2-fSaiEVYfxKHUa4aTS7GMqFCTO0gQvWH71-7FuKel3C5_5eYTLDF-LU-MQzxtPd0GkTTGblrLvbGuub1OFn5QU3xQTuR4KUh9IxccNyYfjKKAM_0Lp9gODZm4Q2zrTlWrRKmt6OvXp4A3Hc3HlMmDjGpsak-ugKfG9F-rFGFUWCtf9F8PahKJ-rvxIIleCKzqXKALc",
];

export default function ProfileEditPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    firm: "",
    license_number: "",
    specialties: "",
    languages: "",
    hourly_rate: "",
    city: "",
    region: "",
  });
  const [imageUrlState, setImageUrlState] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    lawyerApi.getMyProfile(token)
      .then((data) => {
        const lp = data.lawyer_profile;
        if (lp) {
          let specialtiesStr = lp.specialties || "";
          try {
            const parsed = JSON.parse(specialtiesStr);
            if (Array.isArray(parsed)) specialtiesStr = parsed.join(", ");
          } catch {}
          setForm({
            first_name: lp.first_name || "",
            last_name: lp.last_name || "",
            firm: lp.firm || "",
            license_number: lp.license_number || "",
            specialties: specialtiesStr,
            languages: lp.languages || "",
            hourly_rate: lp.hourly_rate != null ? String(lp.hourly_rate) : "",
            city: lp.city || data.city || "",
            region: lp.region || data.region || "",
          });
        }
        setImageUrlState(data.image_url);
        setUserId(data.id);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSuccess(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (imageFile) {
        const result = await lawyerApi.uploadProfileImage(imageFile, token);
        setImageUrlState(result.image_url);
      }

      // Parse specialties: comma-separated input -> JSON array string
      const specialtiesArr = form.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const specialtiesJson = JSON.stringify(specialtiesArr);

      const updateData = {
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        firm: form.firm || null,
        license_number: form.license_number || null,
        specialties: specialtiesJson,
        languages: form.languages || null,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        city: form.city || null,
        region: form.region || null,
      };

      await lawyerApi.updateProfile(updateData, token);

      const fresh = await lawyerApi.getMyProfile(token);
      setImageUrlState(fresh.image_url);

      setSuccess(true);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body antialiased">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-12 lg:py-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Edit Profile</h1>
          <p className="text-on-surface-variant mt-2">Update your professional information</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-tertiary-container text-on-tertiary-container rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-medium">Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Profile Photo */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
            <h2 className="text-lg font-bold text-on-surface mb-6">Profile Photo</h2>
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-surface-container-high">
                <img
                  className="w-full h-full object-cover"
                  alt="Profile preview"
                  src={imagePreview || imageUrl(imageUrlState) || PLACEHOLDER_IMAGES[(userId || 0) % PLACEHOLDER_IMAGES.length]}
                />
              </div>
              <div className="space-y-3">
                <label className="inline-block px-6 py-3 bg-primary text-on-primary text-sm font-bold rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                  Upload Photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                </label>
                <p className="text-xs text-outline">JPEG, PNG, or WEBP. Max 2MB.</p>
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 space-y-6">
            <h2 className="text-lg font-bold text-on-surface">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">First Name</label>
                <input
                  value={form.first_name}
                  onChange={handleChange("first_name")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Last Name</label>
                <input
                  value={form.last_name}
                  onChange={handleChange("last_name")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Law Firm</label>
                <input
                  value={form.firm}
                  onChange={handleChange("firm")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="Doe & Associates"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">License Number</label>
                <input
                  value={form.license_number}
                  onChange={handleChange("license_number")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="BAR-12345"
                />
              </div>
            </div>
          </section>

          {/* Professional Details */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 space-y-6">
            <h2 className="text-lg font-bold text-on-surface">Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Specialties</label>
                <input
                  value={form.specialties}
                  onChange={handleChange("specialties")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="Corporate Law, Intellectual Property"
                />
                <p className="text-[10px] text-outline">Comma-separated list</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Languages</label>
                <input
                  value={form.languages}
                  onChange={handleChange("languages")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="English, Spanish, French"
                />
                <p className="text-[10px] text-outline">Comma-separated list</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Hourly Rate ($)</label>
                <input
                  value={form.hourly_rate}
                  onChange={handleChange("hourly_rate")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="450"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">City</label>
                <input
                  value={form.city}
                  onChange={handleChange("city")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Region / State</label>
                <input
                  value={form.region}
                  onChange={handleChange("region")}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                  placeholder="NY"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center gap-4 pb-12">
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {success && (
              <span className="text-sm font-medium text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Saved successfully
              </span>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
