import { getCategoryLabel } from "./categories";

/* =========================================================
   CONDITIONS
========================================================= */

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

/* =========================================================
   COLORS
========================================================= */

export const COLOR_FILTER_OPTIONS = [
  { value: "Black", label: "Black", color: "#000000" },
  { value: "Charcoal", label: "Charcoal", color: "#36454f" },
  { value: "Dark Grey", label: "Dark grey", color: "#5f6368" },
  { value: "Grey", label: "Grey", color: "#8e8e8e" },
  { value: "Light Grey", label: "Light grey", color: "#d5d8dc" },

  { value: "White", label: "White", color: "#ffffff" },
  { value: "Ivory", label: "Ivory", color: "#fffff0" },
  { value: "Cream", label: "Cream", color: "#fffde2" },

  { value: "Beige", label: "Beige", color: "#e8d2af" },
  { value: "Nude", label: "Nude", color: "#e6c2a6" },
  { value: "Tan", label: "Tan", color: "#c99d72" },
  { value: "Camel", label: "Camel", color: "#c19a6b" },

  { value: "Brown", label: "Brown", color: "#7f5539" },
  { value: "Chocolate", label: "Chocolate", color: "#4e2f20" },

  { value: "Orange", label: "Orange", color: "#ff6b2c" },
  { value: "Peach", label: "Peach", color: "#ffcba4" },
  { value: "Apricot", label: "Apricot", color: "#fbceb1" },
  { value: "Coral", label: "Coral", color: "#ff7b5c" },

  { value: "Red", label: "Red", color: "#d62828" },
  { value: "Dark Red", label: "Dark red", color: "#9b2226" },
  { value: "Burgundy", label: "Burgundy", color: "#800020" },
  { value: "Maroon", label: "Maroon", color: "#6f1d1b" },

  { value: "Pink", label: "Pink", color: "#ffb7bd" },
  { value: "Rose", label: "Rose", color: "#e88b9a" },
  { value: "Hot Pink", label: "Hot pink", color: "#ff4da6" },
  { value: "Fuchsia", label: "Fuchsia", color: "#f90080" },

  { value: "Purple", label: "Purple", color: "#85008e" },
  { value: "Lilac", label: "Lilac", color: "#c68bcb" },
  { value: "Lavender", label: "Lavender", color: "#b7a2e2" },
  { value: "Mauve", label: "Mauve", color: "#b784a7" },

  { value: "Light Blue", label: "Light blue", color: "#7fc7e8" },
  { value: "Sky Blue", label: "Sky blue", color: "#87ceeb" },
  { value: "Blue", label: "Blue", color: "#1684c4" },
  { value: "Royal Blue", label: "Royal blue", color: "#4169e1" },
  { value: "Navy", label: "Navy", color: "#373a92" },

  { value: "Turquoise", label: "Turquoise", color: "#aad9e4" },
  { value: "Teal", label: "Teal", color: "#008080" },

  { value: "Mint", label: "Mint", color: "#98ff98" },
  { value: "Light Green", label: "Light green", color: "#90ee90" },
  { value: "Green", label: "Green", color: "#48a34c" },
  { value: "Dark Green", label: "Dark green", color: "#1b4332" },
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

  { value: "Clear", label: "Clear", color: "#f7f7f7" },

  {
    value: "Multicolor",
    label: "Multicolor",
    color:
      "linear-gradient(135deg, #ff6b2c 0%, #ffd43b 20%, #2a9d8f 40%, #2f80ed 60%, #8e5cf7 80%, #ff4da6 100%)"
  }
];

/* =========================================================
   MATERIALS
========================================================= */

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
  "Fiberglass",
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
  "Silicone",
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

/* =========================================================
   HELPERS
========================================================= */

function createOption(value, label = value) {
  return {
    value,
    label
  };
}

function createNumberRange(start, end, step = 1) {
  const values = [];

  for (
    let value = start;
    value <= end + 0.0001;
    value += step
  ) {
    values.push(Number(value.toFixed(2)));
  }

  return values;
}

function uniqueOptions(options) {
  return [
    ...new Map(
      (options || []).map((item) => [item.value, item])
    ).values()
  ];
}

function flattenSections(sections) {
  return uniqueOptions(
    (sections || []).flatMap((section) => section.options || [])
  );
}

/* =========================================================
   WOMEN
========================================================= */

const WOMEN_CLOTHING = [
  createOption("XXXS", "XXXS · US 000"),
  createOption("XXS", "XXS · US 00"),
  createOption("XS", "XS · US 0–2"),
  createOption("S", "S · US 4–6"),
  createOption("M", "M · US 8–10"),
  createOption("L", "L · US 12–14"),
  createOption("XL", "XL · US 16–18"),
  createOption("XXL", "XXL · US 20–22"),
  createOption("3XL", "3XL · US 24–26"),
  createOption("4XL", "4XL · US 28–30"),
  createOption("5XL", "5XL · US 32–34"),
  createOption("6XL", "6XL · US 36–38"),
  createOption("7XL", "7XL · US 40–42"),
  createOption("8XL", "8XL · US 44–46"),
  createOption("9XL", "9XL · US 48–50"),
  createOption("One size"),
  createOption("Other")
];

const WOMEN_NUMERIC = [
  "000",
  "00",
  "0",
  "2",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "50"
].map((size) =>
  createOption(`US ${size}`, `US ${size}`)
);

const WOMEN_PANTS = createNumberRange(
  23,
  52,
  1
).map((size) =>
  createOption(
    `W${size}`,
    `W${size} · ${size} in`
  )
);

const WOMEN_SHOES = [
  ...createNumberRange(
    4,
    15,
    0.5
  ).map((size) =>
    createOption(
      `US Women ${size}`,
      `US ${size}`
    )
  ),
  createOption(
    "Women shoes other",
    "Other"
  )
];

const WOMEN_BELTS = [
  ...createNumberRange(
    24,
    50,
    2
  ).map((size) =>
    createOption(
      `${size} in belt`,
      `${size} in`
    )
  ),
  createOption(
    "Women belt adjustable",
    "Adjustable"
  ),
  createOption(
    "Women belt one size",
    "One size"
  ),
  createOption(
    "Women belt other",
    "Other"
  )
];

/* =========================================================
   BRAS
========================================================= */

const BRA_BANDS = [
  28,
  30,
  32,
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
  54
];

const BRA_CUPS = [
  "AA",
  "A",
  "B",
  "C",
  "D",
  "DD/E",
  "DDD/F",
  "G",
  "H",
  "I",
  "J",
  "K"
];

const BRA_SIZES = [
  ...BRA_BANDS.flatMap((band) =>
    BRA_CUPS.map((cup) =>
      createOption(
        `${band}${cup}`,
        `${band}${cup}`
      )
    )
  ),

  createOption(
    "Bra XS",
    "XS"
  ),
  createOption(
    "Bra S",
    "S"
  ),
  createOption(
    "Bra M",
    "M"
  ),
  createOption(
    "Bra L",
    "L"
  ),
  createOption(
    "Bra XL",
    "XL"
  ),
  createOption(
    "Bra XXL",
    "XXL"
  ),
  createOption(
    "Bra 3XL",
    "3XL"
  ),
  createOption(
    "Bra 4XL",
    "4XL"
  ),
  createOption(
    "Bra one size",
    "One size"
  ),
  createOption(
    "Bra other",
    "Other"
  )
];

/* =========================================================
   MEN
========================================================= */

const MEN_CLOTHING = [
  createOption("XS"),
  createOption("S"),
  createOption("M"),
  createOption("L"),
  createOption("XL"),
  createOption("XXL"),
  createOption("3XL"),
  createOption("4XL"),
  createOption("5XL"),
  createOption("6XL"),
  createOption("7XL"),
  createOption("8XL"),
  createOption("One size"),
  createOption("Other")
];

const MEN_PANTS = [
  ...createNumberRange(
    23,
    60,
    1
  ).map((size) =>
    createOption(
      `W${size}`,
      `W${size} · ${size} in`
    )
  ),
  createOption(
    "Men pants other",
    "Other"
  )
];

const MEN_SUIT_JACKETS = [
  ...createNumberRange(
    32,
    60,
    2
  ).flatMap((size) => [
    createOption(
      `${size}S`,
      `US ${size} · Short`
    ),
    createOption(
      `${size}R`,
      `US ${size} · Regular`
    ),
    createOption(
      `${size}L`,
      `US ${size} · Long`
    )
  ]),
  createOption(
    "Men suit other",
    "Other"
  )
];

const MEN_SHOES = [
  ...createNumberRange(
    5,
    18,
    0.5
  ).map((size) =>
    createOption(
      `US Men ${size}`,
      `US ${size}`
    )
  ),
  createOption(
    "Men shoes other",
    "Other"
  )
];

const MEN_SHIRTS = [
  ...createNumberRange(
    13,
    22,
    0.5
  ).map((size) =>
    createOption(
      `${size} in neck`,
      `${size} in neck`
    )
  ),

  createOption(
    "Men shirt XS",
    "XS"
  ),
  createOption(
    "Men shirt S",
    "S"
  ),
  createOption(
    "Men shirt M",
    "M"
  ),
  createOption(
    "Men shirt L",
    "L"
  ),
  createOption(
    "Men shirt XL",
    "XL"
  ),
  createOption(
    "Men shirt XXL",
    "XXL"
  ),
  createOption(
    "Men shirt 3XL",
    "3XL"
  ),
  createOption(
    "Men shirt 4XL",
    "4XL"
  ),
  createOption(
    "Men shirt 5XL",
    "5XL"
  ),
  createOption(
    "Men shirt 6XL",
    "6XL"
  ),
  createOption(
    "Men shirt other",
    "Other"
  )
];

const MEN_BELTS = [
  ...createNumberRange(
    28,
    60,
    2
  ).map((size) =>
    createOption(
      `${size} in men belt`,
      `${size} in`
    )
  ),

  createOption(
    "Men belt adjustable",
    "Adjustable"
  ),

  createOption(
    "Men belt one size",
    "One size"
  ),

  createOption(
    "Men belt other",
    "Other"
  )
];

/* =========================================================
   ADULT HATS
========================================================= */

const ADULT_HATS = [
  createOption(
    "Hat XS/S",
    "XS / S"
  ),
  createOption(
    "Hat S/M",
    "S / M"
  ),
  createOption(
    "Hat M/L",
    "M / L"
  ),
  createOption(
    "Hat L/XL",
    "L / XL"
  ),
  createOption(
    "Hat XL/XXL",
    "XL / XXL"
  ),

  createOption(
    "US Hat 6 3/8",
    "US 6 3/8"
  ),
  createOption(
    "US Hat 6 1/2",
    "US 6 1/2"
  ),
  createOption(
    "US Hat 6 5/8",
    "US 6 5/8"
  ),
  createOption(
    "US Hat 6 3/4",
    "US 6 3/4"
  ),
  createOption(
    "US Hat 6 7/8",
    "US 6 7/8"
  ),
  createOption(
    "US Hat 7",
    "US 7"
  ),
  createOption(
    "US Hat 7 1/8",
    "US 7 1/8"
  ),
  createOption(
    "US Hat 7 1/4",
    "US 7 1/4"
  ),
  createOption(
    "US Hat 7 3/8",
    "US 7 3/8"
  ),
  createOption(
    "US Hat 7 1/2",
    "US 7 1/2"
  ),
  createOption(
    "US Hat 7 5/8",
    "US 7 5/8"
  ),
  createOption(
    "US Hat 7 3/4",
    "US 7 3/4"
  ),
  createOption(
    "US Hat 7 7/8",
    "US 7 7/8"
  ),
  createOption(
    "US Hat 8",
    "US 8"
  ),

  createOption(
    "Hat one size",
    "One size"
  ),

  createOption(
    "Hat adjustable",
    "Adjustable"
  ),

  createOption(
    "Hat other",
    "Other"
  )
];

/* =========================================================
   RINGS
========================================================= */

const RING_SIZES = [
  ...createNumberRange(
    3,
    15,
    0.5
  ).map((size) =>
    createOption(
      `US Ring ${size}`,
      `US ${size}`
    )
  ),

  createOption(
    "Ring adjustable",
    "Adjustable"
  ),

  createOption(
    "Ring one size",
    "One size"
  ),

  createOption(
    "Ring other",
    "Other"
  )
];

/* =========================================================
   GLOVES
========================================================= */

const ADULT_GLOVES = [
  createOption(
    "Gloves XXS",
    "XXS"
  ),
  createOption(
    "Gloves XS",
    "XS"
  ),
  createOption(
    "Gloves S",
    "S"
  ),
  createOption(
    "Gloves M",
    "M"
  ),
  createOption(
    "Gloves L",
    "L"
  ),
  createOption(
    "Gloves XL",
    "XL"
  ),
  createOption(
    "Gloves XXL",
    "XXL"
  ),
  createOption(
    "Gloves 3XL",
    "3XL"
  ),

  ...createNumberRange(
    5,
    12,
    0.5
  ).map((size) =>
    createOption(
      `Glove ${size}`,
      `Size ${size}`
    )
  ),

  createOption(
    "Gloves one size",
    "One size"
  ),

  createOption(
    "Gloves other",
    "Other"
  )
];

/* =========================================================
   KIDS & BABY CLOTHING
========================================================= */

const KIDS_CLOTHING = [
  createOption(
    "Preemie",
    "Preemie"
  ),
  createOption(
    "Newborn",
    "Newborn"
  ),

  createOption(
    "0-1M",
    "Up to 1 month"
  ),

  createOption(
    "1-3M",
    "1–3 months"
  ),

  createOption(
    "3-6M",
    "3–6 months"
  ),

  createOption(
    "6-9M",
    "6–9 months"
  ),

  createOption(
    "9-12M",
    "9–12 months"
  ),

  createOption(
    "12-18M",
    "12–18 months"
  ),

  createOption(
    "18-24M",
    "18–24 months"
  ),

  createOption(
    "24-36M",
    "24–36 months"
  ),

  createOption(
    "2T",
    "2T"
  ),

  createOption(
    "3T",
    "3T"
  ),

  createOption(
    "4T",
    "4T"
  ),

  createOption(
    "5T",
    "5T"
  ),

  createOption(
    "Kids US 4",
    "US 4"
  ),

  createOption(
    "Kids US 5",
    "US 5"
  ),

  createOption(
    "Kids US 6",
    "US 6"
  ),

  createOption(
    "Kids US 6X",
    "US 6X"
  ),

  createOption(
    "Kids US 7",
    "US 7"
  ),

  createOption(
    "Kids US 8",
    "US 8"
  ),

  createOption(
    "Kids US 10",
    "US 10"
  ),

  createOption(
    "Kids US 12",
    "US 12"
  ),

  createOption(
    "Kids US 14",
    "US 14"
  ),

  createOption(
    "Kids US 16",
    "US 16"
  ),

  createOption(
    "Kids US 18",
    "US 18"
  ),

  createOption(
    "Kids US 20",
    "US 20"
  ),

  createOption(
    "Youth XS",
    "Youth XS"
  ),

  createOption(
    "Youth S",
    "Youth S"
  ),

  createOption(
    "Youth M",
    "Youth M"
  ),

  createOption(
    "Youth L",
    "Youth L"
  ),

  createOption(
    "Youth XL",
    "Youth XL"
  ),

  createOption(
    "Youth XXL",
    "Youth XXL"
  ),

  createOption(
    "Kids one size",
    "One size"
  ),

  createOption(
    "Kids clothing other",
    "Other"
  )
];

/* =========================================================
   KIDS SHOES
========================================================= */

const KIDS_SHOES = [
  ...createNumberRange(
    0,
    13.5,
    0.5
  ).map((size) =>
    createOption(
      `US Kids ${size}C`,
      `${size}C`
    )
  ),

  ...createNumberRange(
    1,
    7,
    0.5
  ).map((size) =>
    createOption(
      `US Youth ${size}Y`,
      `${size}Y`
    )
  ),

  createOption(
    "Kids shoes other",
    "Other"
  )
];

/* =========================================================
   CHILD AGE
========================================================= */

const CHILD_AGE_OPTIONS = [
  createOption(
    "Age 0-3 months",
    "0–3 months"
  ),

  createOption(
    "Age 3-6 months",
    "3–6 months"
  ),

  createOption(
    "Age 6-9 months",
    "6–9 months"
  ),

  createOption(
    "Age 9-12 months",
    "9–12 months"
  ),

  createOption(
    "Age 12-18 months",
    "12–18 months"
  ),

  createOption(
    "Age 18-24 months",
    "18–24 months"
  ),

  createOption(
    "Age 2",
    "2 years"
  ),

  createOption(
    "Age 3",
    "3 years"
  ),

  createOption(
    "Age 4",
    "4 years"
  ),

  createOption(
    "Age 5",
    "5 years"
  ),

  createOption(
    "Age 6",
    "6 years"
  ),

  createOption(
    "Age 7",
    "7 years"
  ),

  createOption(
    "Age 8",
    "8 years"
  ),

  createOption(
    "Age 9",
    "9 years"
  ),

  createOption(
    "Age 10",
    "10 years"
  ),

  createOption(
    "Age 11",
    "11 years"
  ),

  createOption(
    "Age 12",
    "12 years"
  ),

  createOption(
    "Age 13",
    "13 years"
  ),

  createOption(
    "Age 14",
    "14 years"
  ),

  createOption(
    "Age 15",
    "15 years"
  ),

  createOption(
    "Age 16",
    "16 years"
  ),

  createOption(
    "Age other",
    "Other"
  )
];

/* =========================================================
   KIDS BELTS
========================================================= */

const KIDS_BELTS = [
  ...createNumberRange(
    18,
    34,
    2
  ).map((size) =>
    createOption(
      `${size} in kids belt`,
      `${size} in`
    )
  ),

  createOption(
    "Kids belt adjustable",
    "Adjustable"
  ),

  createOption(
    "Kids belt one size",
    "One size"
  ),

  createOption(
    "Kids belt other",
    "Other"
  )
];

/* =========================================================
   KIDS HATS
========================================================= */

const KIDS_HATS = [
  createOption(
    "Baby hat",
    "Baby"
  ),

  createOption(
    "Toddler hat",
    "Toddler"
  ),

  createOption(
    "Kids hat S",
    "Kids S"
  ),

  createOption(
    "Kids hat M",
    "Kids M"
  ),

  createOption(
    "Kids hat L",
    "Kids L"
  ),

  createOption(
    "Youth hat",
    "Youth"
  ),

  createOption(
    "Kids hat one size",
    "One size"
  ),

  createOption(
    "Kids hat adjustable",
    "Adjustable"
  ),

  createOption(
    "Kids hat other",
    "Other"
  )
];

/* =========================================================
   BAGS
========================================================= */

const BAG_SIZES = [
  createOption("Micro"),
  createOption("Mini"),
  createOption("Small"),
  createOption("Medium"),
  createOption("Large"),
  createOption("Extra large"),
  createOption("Oversized"),

  createOption(
    "Bag other",
    "Other"
  )
];

/* =========================================================
   ACCESSORIES
========================================================= */

const ACCESSORY_SIZES = [
  createOption("XXS"),
  createOption("XS"),
  createOption("S"),
  createOption("M"),
  createOption("L"),
  createOption("XL"),
  createOption("XXL"),
  createOption("3XL"),
  createOption("One size"),
  createOption("Adjustable"),
  createOption("Other")
];

/* =========================================================
   SPORTS
========================================================= */

const HELMET_SIZES = [
  createOption(
    "Helmet XXS",
    "XXS · 51–52 cm"
  ),

  createOption(
    "Helmet XS",
    "XS · 53–54 cm"
  ),

  createOption(
    "Helmet S",
    "S · 55–56 cm"
  ),

  createOption(
    "Helmet M",
    "M · 57–58 cm"
  ),

  createOption(
    "Helmet L",
    "L · 59–60 cm"
  ),

  createOption(
    "Helmet XL",
    "XL · 61–62 cm"
  ),

  createOption(
    "Helmet XXL",
    "XXL · 63–64 cm"
  ),

  createOption(
    "Helmet 3XL",
    "3XL · 65–66 cm"
  ),

  createOption(
    "Helmet other",
    "Other"
  )
];

/* =========================================================
   PETS
========================================================= */

const PET_CLOTHING = [
  createOption("Pet XXS"),
  createOption("Pet XS"),
  createOption("Pet S"),
  createOption("Pet M"),
  createOption("Pet L"),
  createOption("Pet XL"),
  createOption("Pet XXL"),
  createOption("Pet 3XL"),
  createOption("Pet 4XL"),
  createOption("Pet 5XL"),
  createOption("Pet other", "Other")
];

const PET_COLLARS = [
  ...createNumberRange(
    8,
    30,
    2
  ).map((size) =>
    createOption(
      `${size} in pet collar`,
      `${size} in`
    )
  ),

  createOption(
    "Pet collar adjustable",
    "Adjustable"
  ),

  createOption(
    "Pet collar other",
    "Other"
  )
];

/* =========================================================
   HOME
========================================================= */

const HOME_BEDDING_SIZES = [
  createOption("Crib"),
  createOption("Toddler"),
  createOption("Twin"),
  createOption("Twin XL"),
  createOption("Full"),
  createOption("Double"),
  createOption("Queen"),
  createOption("King"),
  createOption("California King"),
  createOption("One size"),
  createOption("Other")
];

const HOME_GENERIC_SIZES = [
  createOption("Extra small"),
  createOption("Small"),
  createOption("Medium"),
  createOption("Large"),
  createOption("Extra large"),
  createOption("One size"),
  createOption("Adjustable"),
  createOption("Other")
];

/* =========================================================
   COMPLETE SIZE FILTER GROUPS
========================================================= */

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
        options: WOMEN_PANTS
      },

      {
        title: "Women's shoes · US",
        options: WOMEN_SHOES
      },

      {
        title: "Women's belts",
        options: WOMEN_BELTS
      },

      {
        title: "Bras · US",
        options: BRA_SIZES
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
        options: ADULT_GLOVES
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
        options: MEN_PANTS
      },

      {
        title: "Men's suit jackets · US",
        options: MEN_SUIT_JACKETS
      },

      {
        title: "Men's shoes · US",
        options: MEN_SHOES
      },

      {
        title: "Men's shirts",
        options: MEN_SHIRTS
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
        options: ADULT_GLOVES
      }
    ]
  },

  {
    id: "kids",
    label: "Kids & Baby",

    sections: [
      {
        title: "Baby & kids clothing",
        options: KIDS_CLOTHING
      },

      {
        title: "Kids shoes · US",
        options: KIDS_SHOES
      },

      {
        title: "Child age",
        options: CHILD_AGE_OPTIONS
      },

      {
        title: "Kids belts",
        options: KIDS_BELTS
      },

      {
        title: "Kids hats",
        options: KIDS_HATS
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
        options: ADULT_GLOVES
      }
    ]
  },

  {
    id: "sports",
    label: "Sports & helmets",

    sections: [
      {
        title: "Sports clothing",
        options: uniqueOptions([
          ...WOMEN_CLOTHING,
          ...MEN_CLOTHING
        ])
      },

      {
        title: "Sports shoes · US",
        options: uniqueOptions([
          ...WOMEN_SHOES,
          ...MEN_SHOES
        ])
      },

      {
        title: "Motorcycle & sports helmets",
        options: HELMET_SIZES
      },

      {
        title: "Sports gloves",
        options: ADULT_GLOVES
      }
    ]
  },

  {
    id: "pets",
    label: "Pets",

    sections: [
      {
        title: "Pet clothing",
        options: PET_CLOTHING
      },

      {
        title: "Pet collars & harnesses",
        options: PET_COLLARS
      }
    ]
  },

  {
    id: "home",
    label: "Home",

    sections: [
      {
        title: "Bedding · US",
        options: HOME_BEDDING_SIZES
      },

      {
        title: "Other home sizes",
        options: HOME_GENERIC_SIZES
      }
    ]
  }
];

/* =========================================================
   NEW LISTING SIZE OPTIONS
========================================================= */

export function getListingSizeOptions(form = {}) {
  const category =
    String(
      form.category || ""
    ).toLowerCase();

  const subcategory =
    String(
      form.subcategory || ""
    ).toLowerCase();

  const childCategory =
    String(
      form.child_category || ""
    ).toLowerCase();

  const title =
    String(
      form.title || ""
    ).toLowerCase();

  const text =
    `${category} ${subcategory} ${childCategory} ${title}`;

  const isShoes =
    subcategory.includes("shoe") ||
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("sandals") ||
    text.includes("boots");

  const isBra =
    text.includes("bra") ||
    text.includes("bralette") ||
    text.includes("lingerie");

  const isPants =
    text.includes("pants") ||
    text.includes("jeans") ||
    text.includes("trousers");

  const isSuit =
    text.includes("suit") ||
    text.includes("blazer");

  const isShirt =
    text.includes("shirt") ||
    text.includes("polo");

  const isBelt =
    text.includes("belt");

  const isHat =
    text.includes("hat") ||
    text.includes("cap");

  const isRing =
    text.includes("ring");

  const isGlove =
    text.includes("glove");

  const isBag =
    subcategory.includes("bag") ||
    text.includes(" bag");

  const isHelmet =
    subcategory.includes("helmet") ||
    text.includes("helmet");

  const isClothing =
    subcategory.includes("clothing") ||
    subcategory.includes("uniform") ||
    subcategory.includes("barong") ||
    subcategory.includes("filipiniana") ||
    subcategory.includes("jacket") ||
    subcategory.includes("raincoat") ||
    text.includes("dress") ||
    text.includes("hoodie") ||
    text.includes("coat") ||
    text.includes("sweater") ||
    text.includes("cardigan") ||
    text.includes("shorts") ||
    isPants ||
    isShirt ||
    isSuit ||
    isBra;

  if (isHelmet) {
    return HELMET_SIZES.map(
      (item) => item.value
    );
  }

  if (isBra) {
    return BRA_SIZES.map(
      (item) => item.value
    );
  }

  if (isShoes) {
    if (
      category === "kids"
    ) {
      return KIDS_SHOES.map(
        (item) => item.value
      );
    }

    if (
      category === "men"
    ) {
      return MEN_SHOES.map(
        (item) => item.value
      );
    }

    return WOMEN_SHOES.map(
      (item) => item.value
    );
  }

  if (
    category === "men" &&
    isPants
  ) {
    return MEN_PANTS.map(
      (item) => item.value
    );
  }

  if (
    category === "women" &&
    isPants
  ) {
    return WOMEN_PANTS.map(
      (item) => item.value
    );
  }

  if (
    category === "men" &&
    isSuit
  ) {
    return MEN_SUIT_JACKETS.map(
      (item) => item.value
    );
  }

  if (
    category === "men" &&
    isShirt
  ) {
    return MEN_SHIRTS.map(
      (item) => item.value
    );
  }

  if (isBelt) {
    if (
      category === "men"
    ) {
      return MEN_BELTS.map(
        (item) => item.value
      );
    }

    if (
      category === "kids"
    ) {
      return KIDS_BELTS.map(
        (item) => item.value
      );
    }

    return WOMEN_BELTS.map(
      (item) => item.value
    );
  }

  if (isHat) {
    if (
      category === "kids"
    ) {
      return KIDS_HATS.map(
        (item) => item.value
      );
    }

    return ADULT_HATS.map(
      (item) => item.value
    );
  }

  if (isRing) {
    return RING_SIZES.map(
      (item) => item.value
    );
  }

  if (isGlove) {
    return ADULT_GLOVES.map(
      (item) => item.value
    );
  }

  if (isBag) {
    return BAG_SIZES.map(
      (item) => item.value
    );
  }

  if (
    category === "women" &&
    isClothing
  ) {
    return flattenSections([
      {
        options:
          WOMEN_CLOTHING
      },

      {
        options:
          WOMEN_NUMERIC
      },

      {
        options:
          WOMEN_PANTS
      },

      {
        options:
          BRA_SIZES
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category === "men" &&
    isClothing
  ) {
    return flattenSections([
      {
        options:
          MEN_CLOTHING
      },

      {
        options:
          MEN_PANTS
      },

      {
        options:
          MEN_SUIT_JACKETS
      },

      {
        options:
          MEN_SHIRTS
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category === "kids" &&
    isClothing
  ) {
    return flattenSections([
      {
        options:
          KIDS_CLOTHING
      },

      {
        options:
          CHILD_AGE_OPTIONS
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category === "sports"
  ) {
    return flattenSections([
      {
        options:
          WOMEN_CLOTHING
      },

      {
        options:
          MEN_CLOTHING
      },

      {
        options:
          WOMEN_SHOES
      },

      {
        options:
          MEN_SHOES
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category ===
    "travel_motorbike"
  ) {
    return flattenSections([
      {
        options:
          WOMEN_CLOTHING
      },

      {
        options:
          MEN_CLOTHING
      },

      {
        options:
          HELMET_SIZES
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category === "pets"
  ) {
    return flattenSections([
      {
        options:
          PET_CLOTHING
      },

      {
        options:
          PET_COLLARS
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category === "home"
  ) {
    return flattenSections([
      {
        options:
          HOME_BEDDING_SIZES
      },

      {
        options:
          HOME_GENERIC_SIZES
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    subcategory.includes(
      "accessor"
    ) ||
    subcategory.includes(
      "watch"
    )
  ) {
    return flattenSections([
      {
        options:
          ACCESSORY_SIZES
      },

      {
        options:
          ADULT_HATS
      },

      {
        options:
          RING_SIZES
      },

      {
        options:
          ADULT_GLOVES
      }
    ]).map(
      (item) => item.value
    );
  }

  if (
    category === "women"
  ) {
    return WOMEN_CLOTHING.map(
      (item) => item.value
    );
  }

  if (
    category === "men"
  ) {
    return MEN_CLOTHING.map(
      (item) => item.value
    );
  }

  if (
    category === "kids"
  ) {
    return KIDS_CLOTHING.map(
      (item) => item.value
    );
  }

  return ACCESSORY_SIZES.map(
    (item) => item.value
  );
}

/* =========================================================
   SORT
========================================================= */

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

/* =========================================================
   SEARCH FILTER KEYS
========================================================= */

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

/* =========================================================
   PARAM HELPERS
========================================================= */

export function readMultiParam(
  searchParams,
  key
) {
  const rawValues =
    searchParams.getAll(key);

  return [
    ...new Set(
      rawValues
        .flatMap((value) =>
          String(value || "")
            .split(",")
            .map((part) =>
              part.trim()
            )
        )
        .filter(Boolean)
    )
  ];
}

export function writeMultiParam(
  params,
  key,
  values
) {
  params.delete(key);

  (values || []).forEach(
    (value) => {
      const cleanValue =
        String(
          value || ""
        ).trim();

      if (cleanValue) {
        params.append(
          key,
          cleanValue
        );
      }
    }
  );

  return params;
}

export function clearAllSearchFilters(
  searchParams
) {
  const nextParams =
    new URLSearchParams(
      searchParams
    );

  SEARCH_FILTER_KEYS.forEach(
    (key) => {
      nextParams.delete(key);
    }
  );

  return nextParams;
}

export function countActiveSearchFilters(
  searchParams
) {
  let count = 0;

  if (
    searchParams.get(
      "category"
    )
  ) {
    count += 1;
  }

  if (
    readMultiParam(
      searchParams,
      "size"
    ).length
  ) {
    count += 1;
  }

  if (
    readMultiParam(
      searchParams,
      "brand"
    ).length
  ) {
    count += 1;
  }

  if (
    readMultiParam(
      searchParams,
      "condition"
    ).length
  ) {
    count += 1;
  }

  if (
    readMultiParam(
      searchParams,
      "color"
    ).length
  ) {
    count += 1;
  }

  if (
    readMultiParam(
      searchParams,
      "material"
    ).length
  ) {
    count += 1;
  }

  if (
    searchParams.get(
      "min_price"
    ) ||
    searchParams.get(
      "max_price"
    )
  ) {
    count += 1;
  }

  if (
    searchParams.get(
      "sort"
    ) &&
    searchParams.get(
      "sort"
    ) !== "newest"
  ) {
    count += 1;
  }

  return count;
}

function summarizeMultiple(
  values
) {
  if (!values.length) {
    return "All";
  }

  if (
    values.length === 1
  ) {
    return values[0];
  }

  return `${values.length} selected`;
}

/* =========================================================
   FILTER SUMMARY
========================================================= */

export function getFilterSummary(
  filterType,
  searchParams
) {
  if (
    filterType ===
    "category"
  ) {
    const category =
      searchParams.get(
        "category"
      );

    return category
      ? getCategoryLabel(
          category
        )
      : "All";
  }

  if (
    filterType ===
    "size"
  ) {
    return summarizeMultiple(
      readMultiParam(
        searchParams,
        "size"
      )
    );
  }

  if (
    filterType ===
    "brand"
  ) {
    return summarizeMultiple(
      readMultiParam(
        searchParams,
        "brand"
      )
    );
  }

  if (
    filterType ===
    "condition"
  ) {
    const selected =
      readMultiParam(
        searchParams,
        "condition"
      );

    if (
      !selected.length
    ) {
      return "All";
    }

    if (
      selected.length > 1
    ) {
      return `${selected.length} selected`;
    }

    return (
      CONDITION_FILTER_OPTIONS.find(
        (option) =>
          option.value ===
          selected[0]
      )?.label ||
      selected[0]
    );
  }

  if (
    filterType ===
    "color"
  ) {
    const selected =
      readMultiParam(
        searchParams,
        "color"
      );

    if (
      !selected.length
    ) {
      return "All";
    }

    if (
      selected.length > 1
    ) {
      return `${selected.length} selected`;
    }

    return (
      COLOR_FILTER_OPTIONS.find(
        (option) =>
          option.value ===
          selected[0]
      )?.label ||
      selected[0]
    );
  }

  if (
    filterType ===
    "material"
  ) {
    return summarizeMultiple(
      readMultiParam(
        searchParams,
        "material"
      )
    );
  }

  if (
    filterType ===
    "price"
  ) {
    const minimum =
      searchParams.get(
        "min_price"
      );

    const maximum =
      searchParams.get(
        "max_price"
      );

    if (
      !minimum &&
      !maximum
    ) {
      return "All";
    }

    if (
      minimum &&
      maximum
    ) {
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

  if (
    filterType ===
    "sort"
  ) {
    const sort =
      searchParams.get(
        "sort"
      ) ||
      "newest";

    return (
      SORT_FILTER_OPTIONS.find(
        (option) =>
          option.value ===
          sort
      )?.label ||
      "Newest first"
    );
  }

  return "All";
}