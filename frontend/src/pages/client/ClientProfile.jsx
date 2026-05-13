import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { clientApi } from "../../api/client.api";
import { useAuth } from "../../hooks/useAuth";

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

export default function ClientProfile() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    region: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageUrlState, setImageUrlState] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    clientApi
      .getMyProfile(token)
      .then((data) => {
        const cp = data.client_profile;
        if (cp) {
          setForm({
            first_name: cp.first_name || "",
            last_name: cp.last_name || "",
            phone: cp.phone || "",
            city: data.city || "",
            region: data.region || "",
          });
        }
        setImageUrlState(data.image_url);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setSuccess(false);
  };

  const REQUIRED_FIELDS = [
    "first_name",
    "last_name",
    "phone",
    "city",
    "region",
  ];
  const FIELD_LABELS = {
    first_name: "First Name",
    last_name: "Last Name",
    phone: "Phone Number",
    city: "City",
    region: "Region / State",
  };

  function validateForm() {
    const errors = {};
    for (const field of REQUIRED_FIELDS) {
      const val = form[field];
      if (!val || (typeof val === "string" && !val.trim())) {
        errors[field] = `${FIELD_LABELS[field]} is required`;
      }
    }
    return errors;
  }

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
    setRemoveImage(false);
    setError(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrlState(null);
    setRemoveImage(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (removeImage) {
        await clientApi.deleteProfileImage(token).catch(() => {});
      } else if (imageFile) {
        const result = await clientApi.uploadProfileImage(imageFile, token);
        setImageUrlState(result.image_url);
      }

      await clientApi.updateProfile(
        {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          region: form.region.trim(),
        },
        token,
      );

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
            <p className="text-on-surface-variant text-sm font-medium">
              Loading profile...
            </p>
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
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            My Profile
          </h1>
          <p className="text-on-surface-variant mt-2">
            Update your personal information
          </p>
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
            <span className="text-sm font-medium">
              Profile updated successfully!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
            <h2 className="text-lg font-bold text-on-surface mb-6">
              Profile Photo
            </h2>
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-surface-container-high">
                <img
                  className="w-full h-full object-cover"
                  alt="Profile preview"
                  src={
                    imagePreview ||
                    imageUrl(imageUrlState) ||
                    PLACEHOLDER_AVATAR
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="inline-block px-6 py-3 bg-primary text-on-primary text-sm font-bold rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                {(imageUrlState || imagePreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="block px-6 py-3 border border-outline text-sm font-bold rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-outline">
                  JPEG, PNG, or WEBP. Max 2MB.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 space-y-6">
            <h2 className="text-lg font-bold text-on-surface">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  First Name *
                </label>
                <input
                  value={form.first_name}
                  onChange={handleChange("first_name")}
                  className={`w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all ${fieldErrors.first_name ? "ring-2 ring-error" : ""}`}
                  placeholder="John"
                  required
                />
                {fieldErrors.first_name && (
                  <p className="text-xs text-error">{fieldErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Last Name *
                </label>
                <input
                  value={form.last_name}
                  onChange={handleChange("last_name")}
                  className={`w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all ${fieldErrors.last_name ? "ring-2 ring-error" : ""}`}
                  placeholder="Doe"
                  required
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-error">{fieldErrors.last_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Phone Number *
                </label>
                <input
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className={`w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all ${fieldErrors.phone ? "ring-2 ring-error" : ""}`}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-error">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  City *
                </label>
                <input
                  value={form.city}
                  onChange={handleChange("city")}
                  className={`w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all ${fieldErrors.city ? "ring-2 ring-error" : ""}`}
                  placeholder="Casablanca"
                  required
                />
                {fieldErrors.city && (
                  <p className="text-xs text-error">{fieldErrors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Region / State *
                </label>
                <input
                  value={form.region}
                  onChange={handleChange("region")}
                  className={`w-full bg-surface-container-high border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all ${fieldErrors.region ? "ring-2 ring-error" : ""}`}
                  placeholder="Casablanca-Settat"
                  required
                />
                {fieldErrors.region && (
                  <p className="text-xs text-error">{fieldErrors.region}</p>
                )}
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 pb-12">
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {success && (
              <span className="text-sm font-medium text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">
                  check_circle
                </span>
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
