import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronDown, Ruler, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  CATEGORIES,
  getCategoryById,
  getFirstChildCategory,
  getFirstSubcategory,
  getSubcategoryById
} from "../lib/categories";
import { supabase } from "../lib/supabase";

const conditionOptions = [
  {
    id: "new",
    label: "New with tags",
    description: "Brand new, never worn or used, with original tags or packaging."
  },
  {
    id: "new_without_tags",
    label: "New without tags",
    description: "Brand new, never worn or used, without original tags or packaging."
  },
  {
    id: "very_good",
    label: "Very good",
    description:
      "Used only a few times. May have very minor imperfections, but remains in very good condition. Mention any flaws in the description."
  },
  {
    id: "good",
    label: "Good",
    description:
      "Used a few times. Shows some imperfections or signs of wear. Add clear photos and describe any flaws."
  },
  {
    id: "fair",
    label: "Fair",
    description:
      "Used several times. Shows visible signs of wear or imperfections, but is still usable. Be transparent in the description."
  }
];

const clothingSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One size"];

const shoeSizes = [
  "US 4",
  "US 4.5",
  "US 5",
  "US 5.5",
  "US 6",
  "US 6.5",
  "US 7",
  "US 7.5",
  "US 8",
  "US 8.5",
  "US 9",
  "US 9.5",
  "US 10",
  "US 10.5",
  "US 11",
  "US 11.5",
  "US 12",
  "US 13"
];

const kidShoeSizes = [
  "US Kids 5",
  "US Kids 6",
  "US Kids 7",
  "US Kids 8",
  "US Kids 9",
  "US Kids 10",
  "US Kids 11",
  "US Kids 12",
  "US Kids 13",
  "US Youth 1",
  "US Youth 2",
  "US Youth 3",
  "US Youth 4",
  "US Youth 5",
  "US Youth 6"
];

const bagSizes = ["Mini", "Small", "Medium", "Large", "Oversized"];

const accessorySizes = ["One size", "Adjustable", "Small", "Medium", "Large"];

const materialOptions = [
  "Acetate",
  "Acrylic",
  "Alpaca",
  "Bamboo",
  "Canvas",
  "Cashmere",
  "Ceramic",
  "Chiffon",
  "Corduroy",
  "Cotton",
  "Denim",
  "Down",
  "Elastane",
  "Faux fur",
  "Faux leather",
  "Felt",
  "Fleece",
  "Glass",
  "Gold",
  "Hemp",
  "Jersey",
  "Lace",
  "Leather",
  "Linen",
  "Lyocell",
  "Mesh",
  "Metal",
  "Microfiber",
  "Mohair",
  "Nylon",
  "Paper",
  "Plastic",
  "Polyamide",
  "Polyester",
  "Polyurethane",
  "Rayon",
  "Rubber",
  "Satin",
  "Sequin",
  "Silk",
  "Silver",
  "Stainless steel",
  "Suede",
  "Synthetic",
  "Terrycloth",
  "Tweed",
  "Velour",
  "Velvet",
  "Viscose",
  "Wood",
  "Wool"
];

const allColors = [
  { id: "Black", label: "Black", hex: "#000000" },
  { id: "White", label: "White", hex: "#ffffff" },
  { id: "Grey", label: "Grey", hex: "#8e8e8e" },
  { id: "Blue", label: "Blue", hex: "#2f80ed" },
  { id: "Navy", label: "Navy", hex: "#14213d" },
  { id: "Red", label: "Red", hex: "#d62828" },
  { id: "Pink", label: "Pink", hex: "#ff8fab" },
  { id: "Orange", label: "Orange", hex: "#ff6b2c" },
  { id: "Yellow", label: "Yellow", hex: "#f6c945" },
  { id: "Green", label: "Green", hex: "#2a9d8f" },
  { id: "Brown", label: "Brown", hex: "#7f5539" },
  { id: "Beige", label: "Beige", hex: "#d6c3a5" },
  { id: "Purple", label: "Purple", hex: "#8e5cf7" },
  { id: "Gold", label: "Gold", hex: "#d4af37" },
  { id: "Silver", label: "Silver", hex: "#c0c0c0" },
  {
    id: "Multicolor",
    label: "Multicolor",
    hex: "linear-gradient(135deg, #ff6b2c, #2f80ed, #2a9d8f)"
  }
];

const parcelOptions = [
  {
    id: "small",
    label: "Small",
    description:
      "Fits a small item in a padded envelope, such as a T-shirt or accessory."
  },
  {
    id: "medium",
    label: "Medium",
    badge: "Recommended",
    description:
      "Fits an item in a shoe box or medium parcel, such as shoes, bags or folded clothes."
  },
  {
    id: "large",
    label: "Large",
    description:
      "Fits a larger box, such as bulky clothing, home items or multiple items."
  }
];

const authenticityGuides = {
  shoes: {
    title: "How to prove your shoes are authentic?",
    intro:
      "Selling counterfeit items is not allowed on TindaHan. Add as many authenticity proof photos as possible. This helps buyers trust your listing and can prevent your item from being hidden during review.",
    requiredTitle: "Essential photos to add",
    optionalTitle: "Extra photos you can add",
    required: [
      { label: "Inside label", icon: "🏷️" },
      { label: "Soles", icon: "👣" },
      { label: "Serial number", icon: "🔢" }
    ],
    optional: [
      { label: "Front view", icon: "👟" },
      { label: "Back view", icon: "↩️" },
      { label: "Side view", icon: "↪️" },
      { label: "Size tag", icon: "🏷️" },
      { label: "Box", icon: "📦" },
      { label: "Receipt or proof", icon: "🧾" }
    ]
  },

  clothing: {
    title: "How to prove your clothing item is authentic?",
    intro:
      "For branded clothing, add clear photos of the labels, stitching, logo and material details. This reassures buyers and helps show that the item is genuine.",
    requiredTitle: "Essential photos to add",
    optionalTitle: "Extra photos you can add",
    required: [
      { label: "Brand label", icon: "🏷️" },
      { label: "Size label", icon: "📏" },
      { label: "Logo details", icon: "🔍" }
    ],
    optional: [
      { label: "Front view", icon: "👕" },
      { label: "Back view", icon: "↩️" },
      { label: "Stitching", icon: "🧵" },
      { label: "Material tag", icon: "📄" },
      { label: "Care label", icon: "🧺" },
      { label: "Receipt or proof", icon: "🧾" }
    ]
  },

  bags: {
    title: "How to prove your bag is authentic?",
    intro:
      "For bags, add photos of the logo, inside label, stitching, lining, hardware and any serial number. These details help buyers verify authenticity.",
    requiredTitle: "Essential photos to add",
    optionalTitle: "Extra photos you can add",
    required: [
      { label: "Logo", icon: "🔍" },
      { label: "Inside label", icon: "🏷️" },
      { label: "Serial number", icon: "🔢" }
    ],
    optional: [
      { label: "Front view", icon: "👜" },
      { label: "Inside lining", icon: "🧵" },
      { label: "Zippers", icon: "🤐" },
      { label: "Straps", icon: "〰️" },
      { label: "Dust bag", icon: "🛍️" },
      { label: "Receipt or proof", icon: "🧾" }
    ]
  },

  accessories: {
    title: "How to prove your accessory is authentic?",
    intro:
      "For accessories, add close-up photos of labels, logos, engravings, packaging and proof of purchase whenever possible.",
    requiredTitle: "Essential photos to add",
    optionalTitle: "Extra photos you can add",
    required: [
      { label: "Logo", icon: "🔍" },
      { label: "Engraving or label", icon: "🏷️" },
      { label: "Packaging", icon: "📦" }
    ],
    optional: [
      { label: "Front view", icon: "✨" },
      { label: "Back view", icon: "↩️" },
      { label: "Close-up detail", icon: "🔎" },
      { label: "Serial number", icon: "🔢" },
      { label: "Certificate", icon: "📜" },
      { label: "Receipt or proof", icon: "🧾" }
    ]
  },

  default: {
    title: "How to prove your item is authentic?",
    intro:
      "If your item is branded, add clear photos of labels, logos, packaging, serial numbers and proof of purchase. This helps buyers trust your listing.",
    requiredTitle: "Essential photos to add",
    optionalTitle: "Extra photos you can add",
    required: [
      { label: "Brand label", icon: "🏷️" },
      { label: "Logo details", icon: "🔍" },
      { label: "Proof of purchase", icon: "🧾" }
    ],
    optional: [
      { label: "Front view", icon: "✨" },
      { label: "Back view", icon: "↩️" },
      { label: "Close-up detail", icon: "🔎" },
      { label: "Packaging", icon: "📦" },
      { label: "Serial number", icon: "🔢" },
      { label: "Certificate", icon: "📜" }
    ]
  }
};

function getItemType(form) {
  const text = `${form.category || ""} ${form.subcategory || ""} ${
    form.child_category || ""
  } ${form.title || ""}`.toLowerCase();

  if (
    text.includes("shoe") ||
    text.includes("shoes") ||
    text.includes("sneaker") ||
    text.includes("basket")
  ) {
    return "shoes";
  }

  if (
    text.includes("clothing") ||
    text.includes("shirt") ||
    text.includes("tshirt") ||
    text.includes("t-shirt") ||
    text.includes("hoodie") ||
    text.includes("jacket") ||
    text.includes("coat") ||
    text.includes("uniform") ||
    text.includes("barong") ||
    text.includes("filipiniana") ||
    text.includes("dress")
  ) {
    return "clothing";
  }

  if (text.includes("bag")) return "bags";

  if (
    text.includes("accessories") ||
    text.includes("accessory") ||
    text.includes("helmet") ||
    text.includes("cap") ||
    text.includes("watch")
  ) {
    return "accessories";
  }

  return "default";
}

function getAuthenticityGuide(form) {
  const itemType = getItemType(form);
  return authenticityGuides[itemType] || authenticityGuides.default;
}

function getSizeOptions(form) {
  const itemType = getItemType(form);
  const text = `${form.category || ""} ${form.subcategory || ""}`.toLowerCase();

  if (itemType === "shoes" && text.includes("kids")) return kidShoeSizes;
  if (itemType === "shoes") return shoeSizes;
  if (itemType === "clothing") return clothingSizes;
  if (itemType === "bags") return bagSizes;
  if (itemType === "accessories") return accessorySizes;

  return ["One size", "Small", "Medium", "Large"];
}

function getSuggestedColors(form) {
  const text = `${form.title || ""} ${form.description || ""} ${
    form.brand || ""
  }`.toLowerCase();

  const suggestions = allColors.filter((color) =>
    text.includes(color.label.toLowerCase())
  );

  if (suggestions.length > 0) return suggestions.slice(0, 4);

  if (getItemType(form) === "shoes") {
    return allColors.filter((color) =>
      ["Black", "White", "Grey", "Blue"].includes(color.id)
    );
  }

  if (getItemType(form) === "clothing") {
    return allColors.filter((color) =>
      ["Black", "White", "Grey", "Beige"].includes(color.id)
    );
  }

  return allColors.filter((color) =>
    ["Black", "White", "Grey", "Brown"].includes(color.id)
  );
}

function formatColorValue(colors) {
  if (!colors.length) return "";
  return colors.join(", ");
}

function formatMaterialValue(materials) {
  if (!materials.length) return "";
  return materials.join(", ");
}

function buildDescriptionWithExtras(form) {
  const cleanDescription = form.description?.trim() || "";
  const extraBlocks = [];

  if (form.selectedMaterials.length > 0) {
    extraBlocks.push(`Materials:\n${form.selectedMaterials.join(", ")}`);
  }

  if (getItemType(form) === "clothing") {
    const dimensions = [];

    if (form.shoulder_width) {
      dimensions.push(`Shoulder width: ${form.shoulder_width} cm`);
    }

    if (form.item_length) {
      dimensions.push(`Length: ${form.item_length} cm`);
    }

    if (dimensions.length > 0) {
      extraBlocks.push(`Dimensions:\n${dimensions.join("\n")}`);
    }
  }

  if (extraBlocks.length === 0) {
    return cleanDescription;
  }

  return `${cleanDescription}

${extraBlocks.join("\n\n")}`;
}

export default function NewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAuthenticityModal, setShowAuthenticityModal] = useState(false);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");

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
    color: "",
    selectedColors: [],
    material: "",
    selectedMaterials: [],
    location: "",
    shoulder_width: "",
    item_length: "",
    parcel_size: "medium",
    is_negotiable: false
  });

  const selectedCategory = getCategoryById(form.category);
  const selectedSubcategory = getSubcategoryById(form.subcategory);
  const authenticityGuide = getAuthenticityGuide(form);
  const sizeOptions = getSizeOptions(form);
  const suggestedColors = getSuggestedColors(form);

  const selectedCondition = conditionOptions.find(
    (condition) => condition.id === form.condition
  );

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
        child_category: firstChildCategory?.id || "",
        size: "",
        selectedColors: [],
        color: "",
        selectedMaterials: [],
        material: "",
        shoulder_width: "",
        item_length: ""
      }));

      return;
    }

    if (name === "subcategory") {
      const firstChildCategory = getFirstChildCategory(value);

      setForm((prev) => ({
        ...prev,
        subcategory: value,
        child_category: firstChildCategory?.id || "",
        size: "",
        selectedMaterials: [],
        material: "",
        shoulder_width: "",
        item_length: ""
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function selectSize(size) {
    setForm((prev) => ({
      ...prev,
      size
    }));

    setOpenDropdown("");
  }

  function selectCondition(conditionId) {
    setForm((prev) => ({
      ...prev,
      condition: conditionId
    }));

    setOpenDropdown("");
  }

  function toggleColor(colorId) {
    setForm((prev) => {
      const exists = prev.selectedColors.includes(colorId);

      let nextColors;

      if (exists) {
        nextColors = prev.selectedColors.filter((item) => item !== colorId);
      } else {
        if (prev.selectedColors.length >= 2) return prev;
        nextColors = [...prev.selectedColors, colorId];
      }

      return {
        ...prev,
        selectedColors: nextColors,
        color: formatColorValue(nextColors)
      };
    });
  }

  function toggleMaterial(material) {
    setForm((prev) => {
      const exists = prev.selectedMaterials.includes(material);

      let nextMaterials;

      if (exists) {
        nextMaterials = prev.selectedMaterials.filter((item) => item !== material);
      } else {
        if (prev.selectedMaterials.length >= 3) return prev;
        nextMaterials = [...prev.selectedMaterials, material];
      }

      return {
        ...prev,
        selectedMaterials: nextMaterials,
        material: formatMaterialValue(nextMaterials)
      };
    });
  }

  function selectParcelSize(parcelSize) {
    setForm((prev) => ({
      ...prev,
      parcel_size: parcelSize
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
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error(
          "Impossible d'envoyer la photo. Vérifie que le bucket Supabase 'listings' existe bien dans Storage."
        );
      }

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
          description: buildDescriptionWithExtras(form),
          category: form.category,
          subcategory: form.subcategory,
          child_category: form.child_category || null,
          condition: form.condition,
          price: Number(form.price),
          photos: photoUrls,
          brand: form.brand || null,
          size: form.size || null,
          color: form.color || null,
          location: form.location || null,
          is_negotiable: form.is_negotiable,
          shipping_options: form.parcel_size ? [form.parcel_size] : []
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
    <main className="page new-listing-page">
      <div className="container narrow">
        <div className="page-header">
          <div>
            <h1>Sell an item</h1>
            <p>List for free. Buyers pay the protection fee.</p>
          </div>
        </div>

        <form className="form-card new-listing-form" onSubmit={handleSubmit}>
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

          <section className="listing-detail-fields">
            <div className="listing-detail-row">
              <div className="listing-detail-label">Size</div>

              <div className="listing-detail-control">
                <button
                  type="button"
                  className={`listing-dropdown-trigger ${
                    openDropdown === "size" ? "active" : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(openDropdown === "size" ? "" : "size")
                  }
                >
                  <span>{form.size || "Select a size"}</span>
                  <ChevronDown size={18} />
                </button>

                {openDropdown === "size" && (
                  <div className="listing-dropdown-panel">
                    <p className="listing-dropdown-help">
                      Choose the size that matches the item's label.
                    </p>

                    <div className="listing-dropdown-subtitle">
                      {getItemType(form) === "shoes"
                        ? "US sizes"
                        : getItemType(form) === "clothing"
                        ? "Clothing sizes"
                        : "Available sizes"}
                    </div>

                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className="listing-option-row"
                        onClick={() => selectSize(size)}
                      >
                        <strong>{size}</strong>
                        <span
                          className={`listing-radio ${
                            form.size === size ? "active" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {getItemType(form) === "clothing" && (
              <div className="listing-detail-row dimensions-detail-row">
                <div className="listing-detail-label">Dimensions recommended</div>

                <div className="listing-detail-control">
                  <div className="dimensions-inline-fields">
                    <label className="dimension-inline-input">
                      <input
                        name="shoulder_width"
                        type="number"
                        min="0"
                        step="1"
                        value={form.shoulder_width}
                        onChange={updateField}
                        placeholder="Shoulder width, e.g. 42"
                      />
                      <span>cm</span>
                    </label>

                    <label className="dimension-inline-input">
                      <input
                        name="item_length"
                        type="number"
                        min="0"
                        step="1"
                        value={form.item_length}
                        onChange={updateField}
                        placeholder="Length, e.g. 68"
                      />
                      <span>cm</span>
                    </label>

                    <p className="dimensions-inline-help">
                      How to measure your item? Check our{" "}
                      <button
                        type="button"
                        className="dimensions-guide-link"
                        onClick={() => setShowDimensionsModal(true)}
                      >
                        dimensions guide
                      </button>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="listing-detail-row">
              <div className="listing-detail-label">Condition</div>

              <div className="listing-detail-control">
                <button
                  type="button"
                  className={`listing-dropdown-trigger ${
                    openDropdown === "condition" ? "active" : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(openDropdown === "condition" ? "" : "condition")
                  }
                >
                  <span>{selectedCondition?.label || "Select a condition"}</span>
                  <ChevronDown size={18} />
                </button>

                {openDropdown === "condition" && (
                  <div className="listing-dropdown-panel large">
                    {conditionOptions.map((condition) => (
                      <button
                        key={condition.id}
                        type="button"
                        className="listing-option-row tall"
                        onClick={() => selectCondition(condition.id)}
                      >
                        <span>
                          <strong>{condition.label}</strong>
                          <small>{condition.description}</small>
                        </span>

                        <span
                          className={`listing-radio ${
                            form.condition === condition.id ? "active" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="listing-detail-row">
              <div className="listing-detail-label">Color</div>

              <div className="listing-detail-control">
                <button
                  type="button"
                  className={`listing-dropdown-trigger ${
                    openDropdown === "color" ? "active" : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(openDropdown === "color" ? "" : "color")
                  }
                >
                  <span>{form.color || "Select up to 2 colors"}</span>
                  <ChevronDown size={18} />
                </button>

                {openDropdown === "color" && (
                  <div className="listing-dropdown-panel large">
                    <div className="listing-dropdown-subtitle">Suggestions</div>

                    {suggestedColors.map((color) => (
                      <button
                        key={`suggested-${color.id}`}
                        type="button"
                        className="listing-option-row"
                        onClick={() => toggleColor(color.id)}
                      >
                        <span className="color-option-left">
                          <span
                            className="color-dot"
                            style={{ background: color.hex }}
                          />
                          <strong>{color.label}</strong>
                        </span>

                        <span
                          className={`listing-checkbox ${
                            form.selectedColors.includes(color.id) ? "active" : ""
                          }`}
                        />
                      </button>
                    ))}

                    <div className="listing-dropdown-subtitle with-border">
                      All colors
                    </div>

                    {allColors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        className="listing-option-row"
                        onClick={() => toggleColor(color.id)}
                      >
                        <span className="color-option-left">
                          <span
                            className="color-dot"
                            style={{ background: color.hex }}
                          />
                          <strong>{color.label}</strong>
                        </span>

                        <span
                          className={`listing-checkbox ${
                            form.selectedColors.includes(color.id) ? "active" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="listing-detail-row">
              <div className="listing-detail-label">Material (recommended)</div>

              <div className="listing-detail-control">
                <button
                  type="button"
                  className={`listing-dropdown-trigger ${
                    openDropdown === "material" ? "active" : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(openDropdown === "material" ? "" : "material")
                  }
                >
                  <span>{form.material || "Select up to 3 materials"}</span>
                  <ChevronDown size={18} />
                </button>

                {openDropdown === "material" && (
                  <div className="listing-dropdown-panel large">
                    <p className="listing-dropdown-help">
                      Select the main materials shown on the item's label. You can
                      choose up to 3.
                    </p>

                    {materialOptions.map((material) => (
                      <button
                        key={material}
                        type="button"
                        className="listing-option-row"
                        onClick={() => toggleMaterial(material)}
                      >
                        <strong>{material}</strong>

                        <span
                          className={`listing-checkbox ${
                            form.selectedMaterials.includes(material) ? "active" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Authenticity proofs</h2>

            <div className="authenticity-hint-card">
              <div>
                <strong>Don’t forget to add these photos</strong>

                <div className="authenticity-hint-preview">
                  {authenticityGuide.required.slice(0, 3).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="authenticity-proof-mini"
                      onClick={() => setShowAuthenticityModal(true)}
                    >
                      <span>{item.icon}</span>
                    </button>
                  ))}
                </div>

                <p>
                  Add these photos to help prove your item is authentic and avoid
                  your listing being hidden or removed.{" "}
                  <button
                    type="button"
                    className="authenticity-link-button"
                    onClick={() => setShowAuthenticityModal(true)}
                  >
                    Check the essential authenticity proofs
                  </button>
                  .
                </p>
              </div>
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

          <section className="parcel-section">
            <h2>Choose parcel size</h2>
            <p>Shipping fees are paid by the buyer.</p>

            <div className="parcel-options">
              {parcelOptions.map((parcel) => (
                <button
                  key={parcel.id}
                  type="button"
                  className={`parcel-option ${
                    form.parcel_size === parcel.id ? "active" : ""
                  }`}
                  onClick={() => selectParcelSize(parcel.id)}
                >
                  <span>
                    {parcel.badge && (
                      <small className="parcel-badge">{parcel.badge}</small>
                    )}
                    <strong>{parcel.label}</strong>
                    <em>{parcel.description}</em>
                  </span>

                  <span
                    className={`listing-radio ${
                      form.parcel_size === parcel.id ? "active" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>

          <button className="add-listing-button" disabled={loading} type="submit">
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {showAuthenticityModal && (
        <div
          className="authenticity-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAuthenticityModal(false);
            }
          }}
        >
          <div
            className="authenticity-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Authenticity proofs"
          >
            <header className="authenticity-modal-header">
              <strong>Authenticity proofs</strong>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowAuthenticityModal(false)}
              >
                <X size={24} />
              </button>
            </header>

            <div className="authenticity-modal-body">
              <h2>{authenticityGuide.title}</h2>

              <p>{authenticityGuide.intro}</p>

              <h3>{authenticityGuide.requiredTitle}</h3>

              <div className="authenticity-proof-grid">
                {authenticityGuide.required.map((item) => (
                  <div className="authenticity-proof-card" key={item.label}>
                    <div>
                      <span>{item.icon}</span>
                    </div>
                    <p>{item.label}</p>
                  </div>
                ))}
              </div>

              <h3>{authenticityGuide.optionalTitle}</h3>

              <div className="authenticity-proof-grid">
                {authenticityGuide.optional.map((item) => (
                  <div className="authenticity-proof-card" key={item.label}>
                    <div>
                      <span>{item.icon}</span>
                    </div>
                    <p>{item.label}</p>
                  </div>
                ))}
              </div>

              <label className="authenticity-upload-button">
                Add photos
                <input type="file" accept="image/*" multiple onChange={handleFiles} />
              </label>

              <button
                className="authenticity-close-button"
                type="button"
                onClick={() => setShowAuthenticityModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDimensionsModal && (
        <div
          className="dimensions-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDimensionsModal(false);
            }
          }}
        >
          <div
            className="dimensions-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Dimensions guide"
          >
            <header className="dimensions-modal-header">
              <strong>Dimensions guide</strong>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowDimensionsModal(false)}
              >
                <X size={24} />
              </button>
            </header>

            <div className="dimensions-modal-body">
              <h2>How to measure your item</h2>

              <p>Lay your item flat on a clean surface.</p>

              <ul>
                <li>
                  <strong>Shoulder width:</strong> measure the distance between the
                  shoulder seams, across the back of the item.
                </li>

                <li>
                  <strong>Length:</strong> measure from the highest point near the
                  collar down to the bottom hem.
                </li>
              </ul>

              <div className="dimensions-guide-grid">
                <div className="dimensions-guide-card">
                  <div className="dimensions-guide-illustration">
                    <Ruler size={44} />
                    <span className="dimension-horizontal-line" />
                  </div>

                  <p>Shoulder width</p>
                </div>

                <div className="dimensions-guide-card">
                  <div className="dimensions-guide-illustration">
                    <Ruler size={44} />
                    <span className="dimension-vertical-line" />
                  </div>

                  <p>Length</p>
                </div>
              </div>

              <button
                className="dimensions-done-button"
                type="button"
                onClick={() => setShowDimensionsModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}