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
  { value: "Charcoal", label: "Charcoal", color: "#36454f" },
  { value: "Grey", label: "Grey", color: "#8e8e8e" },
  { value: "Light Grey", label: "Light grey", color: "#d2d6d8" },
  { value: "White", label: "White", color: "#ffffff" },
  { value: "Cream", label: "Cream", color: "#fffde2" },
  { value: "Ivory", label: "Ivory", color: "#fffff0" },
  { value: "Beige", label: "Beige", color: "#e8d2af" },
  { value: "Nude", label: "Nude", color: "#e7c6aa" },
  { value: "Tan", label: "Tan", color: "#c99d72" },
  { value: "Camel", label: "Camel", color: "#c19a6b" },
  { value: "Brown", label: "Brown", color: "#7f5539" },
  { value: "Chocolate", label: "Chocolate", color: "#4e2f20" },
  { value: "Orange", label: "Orange", color: "#ff6b2c" },
  { value: "Peach", label: "Peach", color: "#ffcba4" },
  { value: "Coral", label: "Coral", color: "#ff7b5c" },
  { value: "Red", label: "Red", color: "#d62828" },
  { value: "Burgundy", label: "Burgundy", color: "#800020" },
  { value: "Maroon", label: "Maroon", color: "#6f1d1b" },
  { value: "Fuchsia", label: "Fuchsia", color: "#f90080" },
  { value: "Pink", label: "Pink", color: "#ffb7bd" },
  { value: "Rose", label: "Rose", color: "#e88b9a" },
  { value: "Mauve", label: "Mauve", color: "#b784a7" },
  { value: "Purple", label: "Purple", color: "#85008e" },
  { value: "Lilac", label: "Lilac", color: "#c68bcb" },
  { value: "Lavender", label: "Lavender", color: "#b7a2e2" },
  { value: "Light Blue", label: "Light blue", color: "#7fc7e8" },
  { value: "Blue", label: "Blue", color: "#1684c4" },
  { value: "Royal Blue", label: "Royal blue", color: "#4169e1" },
  { value: "Navy", label: "Navy", color: "#14213d" },
  { value: "Turquoise", label: "Turquoise", color: "#40e0d0" },
  { value: "Teal", label: "Teal", color: "#008080" },
  { value: "Mint", label: "Mint", color: "#98ff98" },
  { value: "Green", label: "Green", color: "#2a9d8f" },
  { value: "Olive", label: "Olive", color: "#808000" },
  { value: "Khaki", label: "Khaki", color: "#8b8f56" },
  { value: "Lime", label: "Lime", color: "#b7e000" },
  { value: "Yellow", label: "Yellow", color: "#ffd43b" },
  { value: "Mustard", label: "Mustard", color: "#d4a017" },
  { value: "Gold", label: "Gold", color: "#d4af37" },
  { value: "Rose Gold", label: "Rose gold", color: "#b76e79" },
  { value: "Silver", label: "Silver", color: "#c0c0c0" },
  { value: "Bronze", label: "Bronze", color: "#cd7f32" },
  { value: "Copper", label: "Copper", color: "#b87333" },
  { value: "Clear", label: "Clear / transparent", color: "#f7f7f7" },
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
  "Aluminum",
  "Bamboo",
  "Brass",
  "Canvas",
  "Cashmere",
  "Ceramic",
  "Chiffon",
  "Chrome",
  "Cork",
  "Corduroy",
  "Cotton",
  "Crystal",
  "Denim",
  "Down",
  "Elastane",
  "EVA",
  "Faux fur",
  "Faux leather",
  "Faux suede",
  "Felt",
  "Fleece",
  "Foam",
  "Glass",
  "Gold",
  "Hemp",
  "Jersey",
  "Jute",
  "Lace",
  "Latex",
  "Leather",
  "Linen",
  "Lycra",
  "Lyocell",
  "Merino wool",
  "Mesh",
  "Metal",
  "Microfiber",
  "Modal",
  "Mohair",
  "Neoprene",
  "Nylon",
  "Organic cotton",
  "Paper",
  "Pearl",
  "Plastic",
  "Polyamide",
  "Polyester",
  "Polypropylene",
  "Polyurethane",
  "PVC",
  "Rattan",
  "Rayon",
  "Resin",
  "Rubber",
  "Satin",
  "Sequin",
  "Shell",
  "Silk",
  "Silver",
  "Spandex",
  "Stainless steel",
  "Stone",
  "Suede",
  "Synthetic",
  "Tencel",
  "Terrycloth",
  "Titanium",
  "Tweed",
  "Velour",
  "Velvet",
  "Viscose",
  "Wicker",
  "Wood",
  "Wool"
];

const WOMEN_CLOTHING = [
  { value: "XXS", label: "XXS · US 00" },
  { value: "XS", label: "XS · US 0–2" },
  { value: "S", label: "S · US 4–6" },
  { value: "M", label: "M · US 8–10" },
  { value: "L", label: "L · US 12–14" },
  { value: "XL", label: "XL · US 16–18" },
  { value: "XXL", label: "XXL · US 20–22" },
  { value: "3XL", label: "3XL · US 24–26" },
  { value: "4XL", label: "4XL · US 28–30" },
  { value: "5XL", label: "5XL · US 32–34" },
  { value: "6XL", label: "6XL" },
  { value: "One size", label: "One size" },
  { value: "Other", label: "Other" }
];

const WOMEN_NUMERIC = [
  "US 00",
  "US 0",
  "US 2",
  "US 4",
  "US 6",
  "US 8",
  "US 10",
  "US 12",
  "US 14",
  "US 16",
  "US 18",
  "US 20",
  "US 22",
  "US 24",
  "US 26",
  "US 28",
  "US 30",
  "US 32"
].map((value) => ({ value, label: value }));

const MEN_CLOTHING = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "3XL", label: "3XL" },
  { value: "4XL", label: "4XL" },
  { value: "5XL", label: "5XL" },
  { value: "6XL", label: "6XL" },
  { value: "7XL", label: "7XL" },
  { value: "8XL", label: "8XL" },
  { value: "One size", label: "One size" },
  { value: "Other", label: "Other" }
];

const WOMEN_SHOES = [
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
  "US 12.5",
  "US 13",
  "US 14"
].map((value) => ({ value, label: value }));

const MEN_SHOES = [
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
  "US 12.5",
  "US 13",
  "US 14",
  "US 15",
  "US 16"
].map((value) => ({ value, label: value }));

const JEANS_WAIST = [
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 40, 42, 44, 46,
  48, 50, 52
].map((size) => ({ value: `W${size}`, label: `W${size} · ${size} in` }));

const WOMEN_BELTS = [24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44].map(
  (size) => ({ value: `${size} in`, label: `${size} in` })
);

const MEN_BELTS = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50].map(
  (size) => ({ value: `${size} in`, label: `${size} in` })
);

const BRA_BANDS = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46];
const BRA_CUPS = ["AA", "A", "B", "C", "D", "DD", "DDD/F", "G"];

const BRA_SIZES = BRA_BANDS.flatMap((band) =>
  BRA_CUPS.map((cup) => ({
    value: `${band}${cup}`,
    label: `${band}${cup}`
  }))
);

const RING_SIZES = [
  4,
  4.5,
  5,
  5.5,
  6,
  6.5,
  7,
  7.5,
  8,
  8.5,
  9,
  9.5,
  10,
  10.5,
  11,
  11.5,
  12,
  12.5,
  13
].map((size) => ({
  value: `US Ring ${size}`,
  label: `US ${size}`
}));

const ADULT_HATS = [
  { value: "XS/S", label: "XS/S" },
  { value: "S/M", label: "S/M" },
  { value: "M/L", label: "M/L" },
  { value: "L/XL", label: "L/XL" },
  { value: "One size", label: "One size" },
  { value: "Adjustable", label: "Adjustable" }
];

const GLOVE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"].map((value) => ({
  value,
  label: value
}));

const MEN_SHIRTS = [
  14,
  14.5,
  15,
  15.5,
  16,
  16.5,
  17,
  17.5,
  18,
  18.5,
  19,
  19.5,
  20
].map((size) => ({
  value: `${size} in neck`,
  label: `${size} in neck`
}));

const MEN_SUITS = [
  34,
  36,
  38,
  40,
  42,
  44,
  46,
  48,
  50,
  52,
  54,
  56,
  58,
  60
].map((size) => ({
  value: `US ${size}`,
  label: `US ${size}`
}));

const BABY_KIDS_CLOTHING = [
  { value: "Preemie", label: "Preemie" },
  { value: "Newborn", label: "Newborn" },
  { value: "0-3M", label: "0–3 months" },
  { value: "3-6M", label: "3–6 months" },
  { value: "6-9M", label: "6–9 months" },
  { value: "9-12M", label: "9–12 months" },
  { value: "12-18M", label: "12–18 months" },
  { value: "18-24M", label: "18–24 months" },
  { value: "2T", label: "2T" },
  { value: "3T", label: "3T" },
  { value: "4T", label: "4T" },
  { value: "5T", label: "5T" },
  { value: "XS", label: "Kids XS" },
  { value: "S", label: "Kids S" },
  { value: "M", label: "Kids M" },
  { value: "L", label: "Kids L" },
  { value: "XL", label: "Kids XL" },
  { value: "XXL", label: "Kids XXL" },
  { value: "One size", label: "One size" }
];

const KIDS_SHOES = [
  "US Kids 1",
  "US Kids 2",
  "US Kids 3",
  "US Kids 4",
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
  "US Youth 1.5",
  "US Youth 2",
  "US Youth 2.5",
  "US Youth 3",
  "US Youth 3.5",
  "US Youth 4",
  "US Youth 4.5",
  "US Youth 5",
  "US Youth 5.5",
  "US Youth 6",
  "US Youth 6.5",
  "US Youth 7"
].map((value) => ({ value, label: value }));

const BAG_SIZES = [
  "Mini",
  "Small",
  "Medium",
  "Large",
  "Oversized"
].map((value) => ({
  value,
  label: value
}));

const ACCESSORY_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Small",
  "Medium",
  "Large",
  "One size",
  "Adjustable"
].map((value) => ({
  value,
  label: value
}));

const HOME_BEDDING = [
  "Crib",
  "Twin",
  "Twin XL",
  "Full / Double",
  "Queen",
  "King",
  "California King"
].map((value) => ({
  value,
  label: value
}));

const GENERIC_SIZES = [
  { value: "One size", label: "One size" },
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
  { value: "Adjustable", label: "Adjustable" },
  { value: "Other", label: "Other" }
];

export const SIZE_FILTER_GROUPS = [
  {
    id: "women",
    label: "Women",
    sections: [
      {
        title: "Women's clothing",
        options: WOMEN_CLOTHING
      },
      {
        title: "Women's numeric sizes · US",
        options: WOMEN_NUMERIC
      },
      {
        title: "Women's pants & jeans",
        options: JEANS_WAIST
      },
      {
        title: "Women's shoes · US",
        options: WOMEN_SHOES
      },
      {
        title: "Bras · US",
        options: BRA_SIZES
      },
      {
        title: "Women's belts",
        options: WOMEN_BELTS
      },
      {
        title: "Adult hats",
        options: ADULT_HATS
      },
      {
        title: "Rings · US",
        options: RING_SIZES
      },
      {
        title: "Adult gloves",
        options: GLOVE_SIZES
      }
    ]
  },

  {
    id: "men",
    label: "Men",
    sections: [
      {
        title: "Men's clothing",
        options: MEN_CLOTHING
      },
      {
        title: "Men's pants & jeans",
        options: JEANS_WAIST
      },
      {
        title: "Men's suit jackets · US",
        options: MEN_SUITS
      },
      {
        title: "Men's shirts · neck size",
        options: MEN_SHIRTS
      },
      {
        title: "Men's shoes · US",
        options: MEN_SHOES
      },
      {
        title: "Men's belts",
        options: MEN_BELTS
      },
      {
        title: "Adult hats",
        options: ADULT_HATS
      },
      {
        title: "Rings · US",
        options: RING_SIZES
      },
      {
        title: "Adult gloves",
        options: GLOVE_SIZES
      }
    ]
  },

  {
    id: "kids",
    label: "Kids & Baby",
    sections: [
      {
        title: "Baby & kids clothing",
        options: BABY_KIDS_CLOTHING
      },
      {
        title: "Kids shoes · US",
        options: KIDS_SHOES
      },
      {
        title: "Kids accessories",
        options: [
          { value: "XS", label: "XS" },
          { value: "S", label: "S" },
          { value: "M", label: "M" },
          { value: "L", label: "L" },
          { value: "XL", label: "XL" },
          { value: "One size", label: "One size" },
          { value: "Adjustable", label: "Adjustable" }
        ]
      }
    ]
  },

  {
    id: "accessories",
    label: "Bags & accessories",
    sections: [
      {
        title: "Bags",
        options: BAG_SIZES
      },
      {
        title: "Accessories",
        options: ACCESSORY_SIZES
      },
      {
        title: "Adult hats",
        options: ADULT_HATS
      },
      {
        title: "Rings · US",
        options: RING_SIZES
      },
      {
        title: "Adult gloves",
        options: GLOVE_SIZES
      }
    ]
  },

  {
    id: "home",
    label: "Home",
    sections: [
      {
        title: "Bedding · US",
        options: HOME_BEDDING
      },
      {
        title: "General home sizes",
        options: GENERIC_SIZES
      }
    ]
  }
];

function uniqueOptionValues(options) {
  return [
    ...new Map(
      (options || []).map((option) => [
        option.value,
        option
      ])
    ).values()
  ];
}

function flattenSectionOptions(sections) {
  return uniqueOptionValues(
    (sections || []).flatMap((section) => section.options || [])
  );
}

export function getListingSizeOptions(form = {}) {
  const category = String(form.category || "").toLowerCase();
  const subcategory = String(form.subcategory || "").toLowerCase();
  const childCategory = String(form.child_category || "").toLowerCase();
  const title = String(form.title || "").toLowerCase();

  const text = `${category} ${subcategory} ${childCategory} ${title}`;

  const isClothing =
    subcategory.includes("clothing") ||
    subcategory.includes("uniform") ||
    subcategory.includes("barong") ||
    subcategory.includes("filipiniana") ||
    subcategory.includes("jacket") ||
    subcategory.includes("raincoat") ||
    text.includes("shirt") ||
    text.includes("dress") ||
    text.includes("pants") ||
    text.includes("jeans") ||
    text.includes("shorts") ||
    text.includes("hoodie") ||
    text.includes("sweater") ||
    text.includes("coat");

  if (subcategory.includes("bag") || text.includes(" bag")) {
    return BAG_SIZES.map((option) => option.value);
  }

  if (
    subcategory.includes("shoe") ||
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("sandals") ||
    text.includes("boots")
  ) {
    if (category === "kids" || subcategory.includes("kids")) {
      return KIDS_SHOES.map((option) => option.value);
    }

    if (category === "men") {
      return MEN_SHOES.map((option) => option.value);
    }

    if (category === "women") {
      return WOMEN_SHOES.map((option) => option.value);
    }

    return uniqueOptionValues([
      ...WOMEN_SHOES,
      ...MEN_SHOES
    ]).map((option) => option.value);
  }

  if (category === "women" && isClothing) {
    return flattenSectionOptions([
      { options: WOMEN_CLOTHING },
      { options: WOMEN_NUMERIC },
      { options: JEANS_WAIST },
      { options: BRA_SIZES }
    ]).map((option) => option.value);
  }

  if (category === "men" && isClothing) {
    return flattenSectionOptions([
      { options: MEN_CLOTHING },
      { options: JEANS_WAIST },
      { options: MEN_SUITS },
      { options: MEN_SHIRTS }
    ]).map((option) => option.value);
  }

  if (category === "kids" && isClothing) {
    return BABY_KIDS_CLOTHING.map((option) => option.value);
  }

  if (
    category === "local_cultural" &&
    subcategory.includes("barong")
  ) {
    return flattenSectionOptions([
      { options: MEN_CLOTHING },
      { options: MEN_SUITS }
    ]).map((option) => option.value);
  }

  if (
    category === "local_cultural" &&
    subcategory.includes("filipiniana")
  ) {
    return flattenSectionOptions([
      { options: WOMEN_CLOTHING },
      { options: WOMEN_NUMERIC }
    ]).map((option) => option.value);
  }

  if (
    category === "school_office" &&
    subcategory.includes("uniform")
  ) {
    return flattenSectionOptions([
      { options: BABY_KIDS_CLOTHING },
      { options: WOMEN_CLOTHING },
      { options: MEN_CLOTHING }
    ]).map((option) => option.value);
  }

  if (category === "designer" && isClothing) {
    return flattenSectionOptions([
      { options: WOMEN_CLOTHING },
      { options: MEN_CLOTHING },
      { options: WOMEN_NUMERIC },
      { options: JEANS_WAIST },
      { options: MEN_SUITS }
    ]).map((option) => option.value);
  }

  if (category === "sports" && isClothing) {
    return flattenSectionOptions([
      { options: WOMEN_CLOTHING },
      { options: MEN_CLOTHING },
      { options: BABY_KIDS_CLOTHING }
    ]).map((option) => option.value);
  }

  if (
    category === "travel_motorbike" &&
    isClothing
  ) {
    return flattenSectionOptions([
      { options: WOMEN_CLOTHING },
      { options: MEN_CLOTHING }
    ]).map((option) => option.value);
  }

  if (
    subcategory.includes("accessor") ||
    subcategory.includes("watch") ||
    text.includes("belt") ||
    text.includes("hat") ||
    text.includes("cap") ||
    text.includes("ring") ||
    text.includes("glove")
  ) {
    return flattenSectionOptions([
      { options: ACCESSORY_SIZES },
      { options: ADULT_HATS },
      { options: RING_SIZES },
      { options: GLOVE_SIZES },
      {
        options:
          category === "men"
            ? MEN_BELTS
            : WOMEN_BELTS
      }
    ]).map((option) => option.value);
  }

  if (
    category === "home" &&
    subcategory.includes("bedding")
  ) {
    return HOME_BEDDING.map((option) => option.value);
  }

  if (category === "home") {
    return GENERIC_SIZES.map((option) => option.value);
  }

  return GENERIC_SIZES.map((option) => option.value);
}

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

  if (searchParams.get("category")) {
    count += 1;
  }

  if (readMultiParam(searchParams, "size").length) {
    count += 1;
  }

  if (readMultiParam(searchParams, "brand").length) {
    count += 1;
  }

  if (readMultiParam(searchParams, "condition").length) {
    count += 1;
  }

  if (readMultiParam(searchParams, "color").length) {
    count += 1;
  }

  if (readMultiParam(searchParams, "material").length) {
    count += 1;
  }

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
  if (!values.length) {
    return "All";
  }

  if (values.length === 1) {
    return values[0];
  }

  return `${values.length} selected`;
}

export function getFilterSummary(
  filterType,
  searchParams
) {
  if (filterType === "category") {
    const category =
      searchParams.get("category");

    return category
      ? getCategoryLabel(category)
      : "All";
  }

  if (filterType === "size") {
    return summarizeMultiple(
      readMultiParam(
        searchParams,
        "size"
      )
    );
  }

  if (filterType === "brand") {
    return summarizeMultiple(
      readMultiParam(
        searchParams,
        "brand"
      )
    );
  }

  if (filterType === "condition") {
    const selected =
      readMultiParam(
        searchParams,
        "condition"
      );

    if (!selected.length) {
      return "All";
    }

    if (selected.length > 1) {
      return `${selected.length} selected`;
    }

    return (
      CONDITION_FILTER_OPTIONS.find(
        (option) =>
          option.value === selected[0]
      )?.label ||
      selected[0]
    );
  }

  if (filterType === "color") {
    const selected =
      readMultiParam(
        searchParams,
        "color"
      );

    if (!selected.length) {
      return "All";
    }

    if (selected.length > 1) {
      return `${selected.length} selected`;
    }

    return (
      COLOR_FILTER_OPTIONS.find(
        (option) =>
          option.value === selected[0]
      )?.label ||
      selected[0]
    );
  }

  if (filterType === "material") {
    return summarizeMultiple(
      readMultiParam(
        searchParams,
        "material"
      )
    );
  }

  if (filterType === "price") {
    const minimum =
      searchParams.get("min_price");

    const maximum =
      searchParams.get("max_price");

    if (!minimum && !maximum) {
      return "All";
    }

    if (minimum && maximum) {
      return `₱${Number(
        minimum
      ).toLocaleString(
        "en-PH"
      )} – ₱${Number(
        maximum
      ).toLocaleString(
        "en-PH"
      )}`;
    }

    if (minimum) {
      return `From ₱${Number(
        minimum
      ).toLocaleString(
        "en-PH"
      )}`;
    }

    return `Up to ₱${Number(
      maximum
    ).toLocaleString(
      "en-PH"
    )}`;
  }

  if (filterType === "sort") {
    const sort =
      searchParams.get("sort") ||
      "newest";

    return (
      SORT_FILTER_OPTIONS.find(
        (option) =>
          option.value === sort
      )?.label ||
      "Newest first"
    );
  }

  return "All";
}