import { getCategoryLabel } from "./categories";

export const CONDITION_FILTER_OPTIONS = [
  {
    value: "new",
    label: "New with tags",
    description:
      "Brand new, never worn or used, with original tags or packaging."
  },
  {
    value: "new_without_tags",
    label: "New without tags",
    description:
      "Brand new, never worn or used, without original tags or packaging."
  },
  {
    value: "very_good",
    label: "Very good",
    description:
      "Used only a few times. May have very minor imperfections."
  },
  {
    value: "good",
    label: "Good",
    description:
      "Used a few times and may show minor signs of wear."
  },
  {
    value: "fair",
    label: "Fair",
    description:
      "Used several times and shows visible signs of wear."
  }
];

export const COLOR_FILTER_OPTIONS = [
  { value: "Black", label: "Black", color: "#000000" },
  { value: "Grey", label: "Grey", color: "#8e8e8e" },
  { value: "White", label: "White", color: "#ffffff" },

  { value: "Cream", label: "Cream", color: "#fffde2" },
  { value: "Beige", label: "Beige", color: "#e8d2af" },
  { value: "Brown", label: "Brown", color: "#7f5539" },

  { value: "Orange", label: "Orange", color: "#ff9d00" },
  { value: "Coral", label: "Coral", color: "#ff7b5c" },
  { value: "Red", label: "Red", color: "#d62828" },

  { value: "Burgundy", label: "Burgundy", color: "#a92d3d" },
  { value: "Fuchsia", label: "Fuchsia", color: "#f90080" },
  { value: "Pink", label: "Pink", color: "#ffb7bd" },

  { value: "Purple", label: "Purple", color: "#85008e" },
  { value: "Lilac", label: "Lilac", color: "#c68bcb" },
  { value: "Light Blue", label: "Light blue", color: "#7fc7e8" },

  { value: "Blue", label: "Blue", color: "#1684c4" },
  { value: "Navy", label: "Navy", color: "#373a92" },
  { value: "Turquoise", label: "Turquoise", color: "#aad9e4" },

  { value: "Green", label: "Green", color: "#48a34c" },
  { value: "Khaki", label: "Khaki", color: "#8b8f56" },
  { value: "Yellow", label: "Yellow", color: "#ffd43b" },

  { value: "Gold", label: "Gold", color: "#d4af37" },
  { value: "Silver", label: "Silver", color: "#c0c0c0" },
  {
    value: "Multicolor",
    label: "Multicolor",
    color:
      "linear-gradient(135deg, #ff6b2c 0%, #ffd43b 25%, #2a9d8f 50%, #2f80ed 75%, #d946ef 100%)"
  }
];

export const MATERIAL_FILTER_OPTIONS = [
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

const ADULT_SHOES = [
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

const KIDS_SHOES = [
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

export const SIZE_FILTER_GROUPS = [
  {
    id: "women",
    label: "Women",
    sections: [
      {
        title: "Women's clothing",
        options: [
          { value: "XXS", label: "XXS · US 00" },
          { value: "XS", label: "XS · US 0–2" },
          { value: "S", label: "S · US 4–6" },
          { value: "M", label: "M · US 8–10" },
          { value: "L", label: "L · US 12–14" },
          { value: "XL", label: "XL · US 16–18" },
          { value: "XXL", label: "XXL · US 20–22" },
          { value: "One size", label: "One size" }
        ]
      },
      {
        title: "Women's shoes · US",
        options: ADULT_SHOES.map((size) => ({
          value: size,
          label: size
        }))
      }
    ]
  },

  {
    id: "men",
    label: "Men",
    sections: [
      {
        title: "Men's clothing",
        options: [
          { value: "XS", label: "XS · US 34" },
          { value: "S", label: "S · US 36" },
          { value: "M", label: "M · US 38" },
          { value: "L", label: "L · US 40" },
          { value: "XL", label: "XL · US 42" },
          { value: "XXL", label: "XXL · US 44" },
          { value: "One size", label: "One size" }
        ]
      },
      {
        title: "Men's shoes · US",
        options: ADULT_SHOES.map((size) => ({
          value: size,
          label: size
        }))
      }
    ]
  },

  {
    id: "kids",
    label: "Kids",
    sections: [
      {
        title: "Kids clothing",
        options: [
          { value: "XXS", label: "XXS" },
          { value: "XS", label: "XS" },
          { value: "S", label: "S" },
          { value: "M", label: "M" },
          { value: "L", label: "L" },
          { value: "XL", label: "XL" },
          { value: "XXL", label: "XXL" },
          { value: "One size", label: "One size" }
        ]
      },
      {
        title: "Kids shoes · US",
        options: KIDS_SHOES.map((size) => ({
          value: size,
          label: size
        }))
      }
    ]
  },

  {
    id: "accessories",
    label: "Bags & accessories",
    sections: [
      {
        title: "Bags",
        options: [
          { value: "Mini", label: "Mini" },
          { value: "Small", label: "Small" },
          { value: "Medium", label: "Medium" },
          { value: "Large", label: "Large" },
          { value: "Oversized", label: "Oversized" }
        ]
      },
      {
        title: "Accessories",
        options: [
          { value: "One size", label: "One size" },
          { value: "Adjustable", label: "Adjustable" },
          { value: "Small", label: "Small" },
          { value: "Medium", label: "Medium" },
          { value: "Large", label: "Large" }
        ]
      }
    ]
  }
];

export const SORT_FILTER_OPTIONS = [
  {
    value: "relevance",
    label: "Relevance"
  },
  {
    value: "newest",
    label: "Newest first"
  },
  {
    value: "price-low",
    label: "Price: low to high"
  },
  {
    value: "price-high",
    label: "Price: high to low"
  }
];

export const SEARCH_FILTER_KEYS = [
  "category",
  "subcategory",
  "child_category",
  "size",
  "brand",
  "condition",
  "color",
  "material",
  "min_price",
  "max_price",
  "sort"
];

export function readMultiParam(searchParams, key) {
  const rawValues = searchParams.getAll(key);

  return [
    ...new Set(
      rawValues
        .flatMap((value) =>
          String(value || "")
            .split(",")
            .map((part) => part.trim())
        )
        .filter(Boolean)
    )
  ];
}

export function writeMultiParam(params, key, values) {
  params.delete(key);

  (values || []).forEach((value) => {
    const cleanValue = String(value || "").trim();

    if (cleanValue) {
      params.append(key, cleanValue);
    }
  });

  return params;
}

export function clearAllSearchFilters(searchParams) {
  const nextParams = new URLSearchParams(searchParams);

  SEARCH_FILTER_KEYS.forEach((key) => {
    nextParams.delete(key);
  });

  return nextParams;
}

export function countActiveSearchFilters(searchParams) {
  let count = 0;

  if (searchParams.get("category")) count += 1;
  if (readMultiParam(searchParams, "size").length) count += 1;
  if (readMultiParam(searchParams, "brand").length) count += 1;
  if (readMultiParam(searchParams, "condition").length) count += 1;
  if (readMultiParam(searchParams, "color").length) count += 1;
  if (readMultiParam(searchParams, "material").length) count += 1;

  if (
    searchParams.get("min_price") ||
    searchParams.get("max_price")
  ) {
    count += 1;
  }

  if (
    searchParams.get("sort") &&
    searchParams.get("sort") !== "newest"
  ) {
    count += 1;
  }

  return count;
}

function summarizeMultiple(values) {
  if (!values.length) return "All";

  if (values.length === 1) {
    return values[0];
  }

  return `${values.length} selected`;
}

export function getFilterSummary(filterType, searchParams) {
  if (filterType === "category") {
    const category = searchParams.get("category");

    return category
      ? getCategoryLabel(category)
      : "All";
  }

  if (filterType === "size") {
    return summarizeMultiple(
      readMultiParam(searchParams, "size")
    );
  }

  if (filterType === "brand") {
    return summarizeMultiple(
      readMultiParam(searchParams, "brand")
    );
  }

  if (filterType === "condition") {
    const selected = readMultiParam(
      searchParams,
      "condition"
    );

    if (!selected.length) return "All";

    if (selected.length > 1) {
      return `${selected.length} selected`;
    }

    return (
      CONDITION_FILTER_OPTIONS.find(
        (option) => option.value === selected[0]
      )?.label || selected[0]
    );
  }

  if (filterType === "color") {
    return summarizeMultiple(
      readMultiParam(searchParams, "color")
    );
  }

  if (filterType === "material") {
    return summarizeMultiple(
      readMultiParam(searchParams, "material")
    );
  }

  if (filterType === "price") {
    const minimum =
      searchParams.get("min_price");

    const maximum =
      searchParams.get("max_price");

    if (!minimum && !maximum) return "All";

    if (minimum && maximum) {
      return `₱${Number(minimum).toLocaleString(
        "en-PH"
      )} – ₱${Number(maximum).toLocaleString(
        "en-PH"
      )}`;
    }

    if (minimum) {
      return `From ₱${Number(minimum).toLocaleString(
        "en-PH"
      )}`;
    }

    return `Up to ₱${Number(maximum).toLocaleString(
      "en-PH"
    )}`;
  }

  if (filterType === "sort") {
    const sort =
      searchParams.get("sort") || "newest";

    return (
      SORT_FILTER_OPTIONS.find(
        (option) => option.value === sort
      )?.label || "Newest first"
    );
  }

  return "All";
}