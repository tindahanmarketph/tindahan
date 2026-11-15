import { ChevronLeft, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { MIN_DESCRIPTION_LENGTH, validateListingText } from "../lib/listingRules";

/*
 * Modification d'une annonce existante (cahier L3.1) : on change le prix, le texte,
 * les photos… sans repasser par la création.
 */

const CONDITIONS = [
  ["new", "New with tags"],
  ["new_without_tags", "New without tags"],
  ["like_new", "Like new"],
  ["very_good", "Very good"],
  ["good", "Good"],
  ["fair", "Fair"]
];

const MAX_PHOTOS = 20;

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loadingAuth } = useAuth();
  const fileRef = useRef(null);

  const [listing, setListing] = useState(null);
  const [form, setForm] = useState(null);
  const [photos, setPhotos] = useState([]); // [{url} | {file, preview}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loadingAuth) return;
    let cancelled = false;

    async function load() {
      const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;

      if (data) {
        setListing(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          price: String(Math.round(Number(data.price) || 0)),
          is_negotiable: Boolean(data.is_negotiable),
          condition: data.condition || "good",
          brand: data.brand || "",
          size: data.size || "",
          color: data.color || "",
          location: data.location || "",
          meetup_enabled: Boolean(data.meetup_enabled)
        });
        setPhotos((data.photos || []).map((url) => ({ url })));
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, loadingAuth]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function addFiles(event) {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    setPhotos((current) =>
      [...current, ...picked.map((file) => ({ file, preview: URL.createObjectURL(file) }))].slice(0, MAX_PHOTOS)
    );
  }

  const removePhoto = (index) => setPhotos((current) => current.filter((_, i) => i !== index));
  const makeCover = (index) =>
    setPhotos((current) => [current[index], ...current.filter((_, i) => i !== index)]);

  async function uploadNew() {
    const urls = [];
    for (const photo of photos) {
      if (photo.url) {
        urls.push(photo.url);
        continue;
      }
      const ext = photo.file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("listings").upload(path, photo.file, {
        cacheControl: "3600",
        upsert: false
      });
      if (error) throw new Error("Unable to upload a photo. Please try again.");
      urls.push(supabase.storage.from("listings").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");

    const nextErrors = validateListingText({
      title: form.title,
      description: form.description,
      price: form.price,
      brand: form.brand,
      photoCount: photos.length,
      isEdit: true
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const urls = await uploadNew();
      const hasSpot = Boolean(listing.seller_meetup_spot);
      const { error } = await supabase
        .from("listings")
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Math.round(Number(form.price)),
          is_negotiable: form.is_negotiable,
          condition: form.condition,
          brand: form.brand.trim() || null,
          size: form.size.trim() || null,
          color: form.color.trim() || null,
          location: form.location.trim() || null,
          photos: urls,
          meetup_enabled: Boolean(form.meetup_enabled && hasSpot)
        })
        .eq("id", id)
        .eq("seller_id", user.id);

      if (error) throw error;
      navigate(`/item/${id}`);
    } catch (err) {
      setMessage(err.message || "Unable to save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || loadingAuth) {
    return (
      <main className="page">
        <div className="container narrow">
          <p>Loading…</p>
        </div>
      </main>
    );
  }

  if (!listing || !user || String(listing.seller_id) !== String(user.id)) {
    return (
      <main className="page">
        <div className="container narrow edit-listing-page">
          <h1>Listing not found</h1>
          <p>You can only edit your own listings.</p>
          <button type="button" onClick={() => navigate("/")}>Back to home</button>
        </div>
      </main>
    );
  }

  const isLocked = ["sold", "completed"].includes(String(listing.status).toLowerCase());
  const isReserved = String(listing.status).toLowerCase() === "reserved";

  return (
    <main className="page edit-listing-page" data-testid="edit-listing">
      <div className="container narrow">
        <button type="button" className="edit-listing-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={22} /> Back
        </button>

        <h1>Edit listing</h1>

        {isLocked && (
          <p className="field-error" role="alert">This item is sold and can no longer be edited.</p>
        )}
        {isReserved && (
          <p className="order-detail-note">
            A buyer is currently checking out this item. A price change will only apply to new purchases.
          </p>
        )}

        <form onSubmit={handleSave} className="edit-listing-form">
          <label>
            Title
            <input value={form.title} onChange={(e) => update("title", e.target.value)} maxLength={100} />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </label>

          <label>
            Description
            <textarea rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} />
            <small className="order-detail-note">
              {form.description.trim().length}/{MIN_DESCRIPTION_LENGTH} characters minimum
            </small>
            {errors.description && <small className="field-error">{errors.description}</small>}
          </label>

          <label>
            Price (₱)
            <input
              inputMode="numeric"
              value={form.price}
              onChange={(e) => update("price", e.target.value.replace(/[^\d]/g, ""))}
              data-testid="edit-price"
            />
            {errors.price && <small className="field-error">{errors.price}</small>}
          </label>

          <label className="edit-listing-check">
            <input type="checkbox" checked={form.is_negotiable} onChange={(e) => update("is_negotiable", e.target.checked)} />
            Accept offers
          </label>

          <label>
            Condition
            <select value={form.condition} onChange={(e) => update("condition", e.target.value)}>
              {CONDITIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Brand
            <input value={form.brand} onChange={(e) => update("brand", e.target.value)} />
          </label>
          <label>
            Size
            <input value={form.size} onChange={(e) => update("size", e.target.value)} />
          </label>
          <label>
            Color
            <input value={form.color} onChange={(e) => update("color", e.target.value)} />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </label>

          {listing.seller_meetup_spot && (
            <label className="edit-listing-check">
              <input type="checkbox" checked={form.meetup_enabled} onChange={(e) => update("meetup_enabled", e.target.checked)} />
              Offer Safe Meet-Up at {listing.seller_meetup_spot.name}
            </label>
          )}

          <div>
            <strong>Photos ({photos.length}/{MAX_PHOTOS})</strong>
            <div className="edit-listing-photos">
              {photos.map((photo, index) => (
                <div className="edit-listing-photo" key={photo.url || photo.preview}>
                  <img src={photo.url || photo.preview} alt={`Photo ${index + 1}`} />
                  {index === 0 ? (
                    <span>Cover</span>
                  ) : (
                    <button type="button" onClick={() => makeCover(index)}>Make cover</button>
                  )}
                  <button type="button" aria-label="Remove photo" onClick={() => removePhoto(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button type="button" className="edit-listing-add-photo" onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={22} /> Add
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
            {errors.photos && <small className="field-error">{errors.photos}</small>}
          </div>

          {message && <p className="field-error" role="alert">{message}</p>}

          <button type="submit" disabled={saving || isLocked} data-testid="save-listing">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
