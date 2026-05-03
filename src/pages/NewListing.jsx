import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  CATEGORIES,
  getCategoryById,
  getFirstChildCategory,
  getFirstSubcategory,
  getSubcategoryById
} from "../lib/categories";
import { supabase } from "../lib/supabase";

const conditions = [
  {
    id: "new",
    label: "New with tags",
    description: "Never used, with original tags or packaging."
  },
  {
    id: "like_new",
    label: "Like new",
    description: "Used once or twice, no visible flaws."
  },
  {
    id: "good",
    label: "Good",
    description: "Used, but well maintained."
  },
  {
    id: "fair",
    label: "Fair",
    description: "Visible signs of wear, still usable."
  }
];

export default function NewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "women",
    subcategory: "women_clothing",
    child_category: "",
    condition: "like_new",
    price: "",
    brand: "",
    size: "",
    location: "",
    is_negotiable: false
  });

  const selectedCategory = getCategoryById(form.category);
  const selectedSubcategory = getSubcategoryById(form.subcategory);

  const buyerProtection = useMemo(() => {
    const price = Number(form.price || 0);
    return price * 0.08;
  }, [form.price]);

  const totalPreview = useMemo(() => {
    const price = Number(form.price || 0);
    return price + buyerProtection;
  }, [form.price, buyerProtection]);

  function updateField(e) {
    const { name, value, type, checked } = e.target;

    if (name === "category") {
      const firstSubcategory = getFirstSubcategory(value);
      const firstChildCategory = firstSubcategory?.children?.[0] || null;

      setForm((prev) => ({
        ...prev,
        category: value,
        subcategory: firstSubcategory?.id || "",
        child_category: firstChildCategory?.id || ""
      }));

      return;
    }

    if (name === "subcategory") {
      const firstChildCategory = getFirstChildCategory(value);

      setForm((prev) => ({
        ...prev,
        subcategory: value,
        child_category: firstChildCategory?.id || ""
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files || []).slice(0, 8);
    setFiles(selected);
  }

  async function uploadPhotos() {
    const urls = [];

    for (const file of files) {
      const extension = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from("listings")
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage.from("listings").getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    if (files.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }

    setLoading(true);

    try {
      const photoUrls = await uploadPhotos();

      const { data, error } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          subcategory: form.subcategory,
          child_category: form.child_category || null,
          condition: form.condition,
          price: Number(form.price),
          photos: photoUrls,
          brand: form.brand || null,
          size: form.size || null,
          location: form.location || null,
          is_negotiable: form.is_negotiable
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/item/${data.id}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container narrow">
        <div className="page-header">
          <div>
            <h1>Sell an item</h1>
            <p>List for free. Buyers pay the protection fee.</p>
          </div>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Photos</h2>

            <label className="upload-box">
              <Camera size={32} />
              <strong>Add up to 8 photos</strong>
              <span>Square photos work best.</span>
              <input type="file" accept="image/*" multiple onChange={handleFiles} />
            </label>

            {files.length > 0 && (
              <div className="preview-grid">
                {files.map((file, index) => (
                  <img
                    key={`${file.name}-${index}`}
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                  />
                ))}
              </div>
            )}
          </section>

          <section className="form-section">
            <h2>Item details</h2>

            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                required
                placeholder="ex: Nike Air Force 1"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows="5"
                placeholder="Describe your item, condition, flaws, dimensions..."
              />
            </label>

            <div className="two-cols">
              <label>
                Brand
                <input
                  name="brand"
                  value={form.brand}
                  onChange={updateField}
                  placeholder="ex: Nike"
                />
              </label>

              <label>
                Size
                <input
                  name="size"
                  value={form.size}
                  onChange={updateField}
                  placeholder="ex: M, 38, One size"
                />
              </label>
            </div>

            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="ex: Manila, Cebu, Davao"
              />
            </label>
          </section>

          <section className="form-section">
            <h2>Category</h2>

            <div className="choice-grid">
              {CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className={form.category === category.id ? "choice active" : "choice"}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={form.category === category.id}
                    onChange={updateField}
                  />
                  <span>{category.icon}</span>
                  <strong>{category.label}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="form-section">
            <h2>Subcategory</h2>

            <div className="subcategory-choice-grid">
              {selectedCategory?.subcategories.map((subcategory) => (
                <label
                  key={subcategory.id}
                  className={
                    form.subcategory === subcategory.id
                      ? "subcategory-choice active"
                      : "subcategory-choice"
                  }
                >
                  <input
                    type="radio"
                    name="subcategory"
                    value={subcategory.id}
                    checked={form.subcategory === subcategory.id}
                    onChange={updateField}
                  />
                  <strong>{subcategory.label}</strong>
                </label>
              ))}
            </div>
          </section>

          {selectedSubcategory?.children?.length > 0 && (
            <section className="form-section">
              <h2>{selectedSubcategory.label} type</h2>

              <div className="child-choice-grid">
                {selectedSubcategory.children.map((child) => (
                  <label
                    key={child.id}
                    className={
                      form.child_category === child.id
                        ? "child-choice active"
                        : "child-choice"
                    }
                  >
                    <input
                      type="radio"
                      name="child_category"
                      value={child.id}
                      checked={form.child_category === child.id}
                      onChange={updateField}
                    />
                    <strong>{child.label}</strong>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="form-section">
            <h2>Condition</h2>

            <div className="condition-list">
              {conditions.map((condition) => (
                <label
                  key={condition.id}
                  className={
                    form.condition === condition.id
                      ? "condition-choice active"
                      : "condition-choice"
                  }
                >
                  <input
                    type="radio"
                    name="condition"
                    value={condition.id}
                    checked={form.condition === condition.id}
                    onChange={updateField}
                  />

                  <div>
                    <strong>{condition.label}</strong>
                    <p>{condition.description}</p>
                  </div>

                  {form.condition === condition.id && <CheckCircle2 size={20} />}
                </label>
              ))}
            </div>
          </section>

          <section className="form-section">
            <h2>Price</h2>

            <label>
              Price in ₱
              <input
                name="price"
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={updateField}
                required
                placeholder="ex: 500"
              />
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                name="is_negotiable"
                checked={form.is_negotiable}
                onChange={updateField}
              />
              Price is negotiable
            </label>

            <div className="price-preview">
              <div>
                <span>Item price</span>
                <strong>₱{Number(form.price || 0).toLocaleString("en-PH")}</strong>
              </div>

              <div>
                <span>Buyer Protection 8%</span>
                <strong>₱{buyerProtection.toLocaleString("en-PH")}</strong>
              </div>

              <div className="total-row">
                <span>Buyer preview total</span>
                <strong>₱{totalPreview.toLocaleString("en-PH")}</strong>
              </div>
            </div>
          </section>

          <button className="primary-button full large" disabled={loading} type="submit">
            {loading ? "Publishing..." : "Publish for free"}
          </button>
        </form>
      </div>
    </main>
  );
}