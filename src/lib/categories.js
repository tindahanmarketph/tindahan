export const CATEGORIES = [
  {
    id: "women",
    label: "Women",
    icon: "👗",
    subcategories: [
      { id: "women_clothing", label: "Clothing" },
      { id: "women_shoes", label: "Shoes" },
      { id: "women_bags", label: "Bags" },
      { id: "women_accessories", label: "Accessories" },
      { id: "women_beauty", label: "Beauty" },
      { id: "women_maternity", label: "Maternity" }
    ]
  },
  {
    id: "men",
    label: "Men",
    icon: "👔",
    subcategories: [
      { id: "men_clothing", label: "Clothing" },
      { id: "men_shoes", label: "Shoes" },
      { id: "men_bags", label: "Bags" },
      { id: "men_accessories", label: "Accessories" },
      { id: "men_grooming", label: "Grooming" }
    ]
  },
  {
    id: "kids",
    label: "Kids",
    icon: "🧸",
    subcategories: [
      { id: "kids_girls_clothing", label: "Girls clothing" },
      { id: "kids_boys_clothing", label: "Boys clothing" },
      { id: "kids_baby_clothing", label: "Baby clothing" },
      { id: "kids_shoes", label: "Kids shoes" },
      { id: "kids_toys", label: "Toys" },
      { id: "kids_school_items", label: "School items" },
      { id: "kids_baby_gear", label: "Baby gear" },
      { id: "kids_accessories", label: "Kids accessories" }
    ]
  },
  {
    id: "designer",
    label: "Designer",
    icon: "✨",
    subcategories: [
      { id: "designer_clothing", label: "Designer clothing" },
      { id: "designer_shoes", label: "Designer shoes" },
      { id: "designer_bags", label: "Designer bags" },
      { id: "designer_accessories", label: "Designer accessories" },
      { id: "designer_watches", label: "Luxury watches" }
    ]
  },
  {
    id: "home",
    label: "Home",
    icon: "🏠",
    subcategories: [
      { id: "home_decor", label: "Home decor" },
      { id: "home_kitchen", label: "Kitchen" },
      { id: "home_bedding", label: "Bedding" },
      { id: "home_bath", label: "Bath" },
      { id: "home_storage", label: "Storage" },
      { id: "home_furniture", label: "Furniture" },
      { id: "home_garden", label: "Garden" },
      {
        id: "home_appliances",
        label: "Appliances",
        children: [
          { id: "home_rice_cookers", label: "Rice cookers" },
          { id: "home_electric_fans", label: "Electric fans" },
          { id: "home_kettles", label: "Kettles" },
          { id: "home_small_kitchen_appliances", label: "Small kitchen appliances" },
          { id: "home_air_coolers", label: "Air coolers" },
          { id: "home_other_small_appliances", label: "Other small appliances" }
        ]
      }
    ]
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: "📱",
    subcategories: [
      { id: "electronics_phones", label: "Mobile phones" },
      { id: "electronics_tablets", label: "Tablets" },
      { id: "electronics_computers", label: "Computers" },
      { id: "electronics_cameras", label: "Cameras" },
      { id: "electronics_audio", label: "Audio" },
      { id: "electronics_gaming", label: "Gaming consoles" },
      { id: "electronics_smartwatches", label: "Smartwatches" },
      { id: "electronics_accessories", label: "Accessories" }
    ]
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "🎮",
    subcategories: [
      { id: "entertainment_books", label: "Books" },
      { id: "entertainment_movies", label: "Movies" },
      { id: "entertainment_music", label: "Music" },
      { id: "entertainment_video_games", label: "Video games" },
      { id: "entertainment_board_games", label: "Board games" },
      { id: "entertainment_comics_manga", label: "Comics & manga" }
    ]
  },
  {
    id: "hobbies",
    label: "Hobbies",
    icon: "🃏",
    subcategories: [
      { id: "hobbies_collectibles", label: "Collectibles" },
      { id: "hobbies_trading_cards", label: "Trading cards" },
      { id: "hobbies_art_supplies", label: "Art supplies" },
      { id: "hobbies_instruments", label: "Musical instruments" },
      { id: "hobbies_crafts", label: "Crafts" },
      { id: "hobbies_photography", label: "Photography gear" },
      { id: "hobbies_antiques", label: "Antiques" }
    ]
  },
  {
    id: "sports",
    label: "Sports",
    icon: "⚽",
    subcategories: [
      { id: "sports_clothing", label: "Sports clothing" },
      { id: "sports_shoes", label: "Sports shoes" },
      { id: "sports_fitness", label: "Fitness equipment" },
      { id: "sports_outdoor", label: "Outdoor gear" },
      { id: "sports_cycling", label: "Cycling" },
      { id: "sports_basketball", label: "Basketball" },
      { id: "sports_swimming", label: "Swimming" },
      { id: "sports_other", label: "Other sports" }
    ]
  },
  {
    id: "pets",
    label: "Pets",
    icon: "🐾",
    subcategories: [
      { id: "pets_accessories", label: "Pet accessories" },
      { id: "pets_clothing", label: "Pet clothing" },
      { id: "pets_toys", label: "Pet toys" },
      { id: "pets_carriers", label: "Pet carriers" },
      { id: "pets_bowls_feeders", label: "Bowls & feeders" }
    ]
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: "💄",
    subcategories: [
      { id: "beauty_makeup", label: "Makeup" },
      { id: "beauty_skincare", label: "Skincare" },
      { id: "beauty_haircare", label: "Hair care" },
      { id: "beauty_fragrance", label: "Fragrance" },
      { id: "beauty_nails", label: "Nail care" },
      { id: "beauty_tools", label: "Beauty tools" }
    ]
  },
  {
    id: "school_office",
    label: "School & Office",
    icon: "🎒",
    subcategories: [
      { id: "school_bags", label: "School bags" },
      { id: "school_uniforms", label: "Uniforms" },
      { id: "school_books", label: "Books" },
      { id: "school_stationery", label: "Stationery" },
      { id: "office_supplies", label: "Office supplies" },
      { id: "school_calculators", label: "Calculators" }
    ]
  },
  {
    id: "local_cultural",
    label: "Local & Cultural",
    icon: "🇵🇭",
    subcategories: [
      { id: "local_barong", label: "Barong Tagalog" },
      { id: "local_filipiniana", label: "Filipiniana dresses" },
      { id: "local_handmade", label: "Local handmade items" },
      { id: "local_brands", label: "Local fashion brands" },
      { id: "local_festival", label: "Festival outfits" },
      { id: "local_accessories", label: "Traditional accessories" }
    ]
  },
  {
    id: "travel_motorbike",
    label: "Travel & Motorbike",
    icon: "🛵",
    subcategories: [
      { id: "travel_bags", label: "Travel bags" },
      { id: "travel_accessories", label: "Travel accessories" },
      { id: "motorbike_helmets", label: "Motorcycle helmets" },
      { id: "motorbike_raincoats", label: "Raincoats" },
      { id: "motorbike_phone_mounts", label: "Phone mounts" },
      { id: "motorbike_jackets", label: "Riding jackets" }
    ]
  }
];

export function getCategoryById(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId);
}

export function getSubcategoryById(subcategoryId) {
  for (const category of CATEGORIES) {
    const subcategory = category.subcategories.find((sub) => sub.id === subcategoryId);

    if (subcategory) {
      return subcategory;
    }
  }

  return null;
}

export function getChildCategoryById(childCategoryId) {
  for (const category of CATEGORIES) {
    for (const subcategory of category.subcategories) {
      if (!subcategory.children) continue;

      const child = subcategory.children.find((item) => item.id === childCategoryId);

      if (child) {
        return child;
      }
    }
  }

  return null;
}

export function getCategoryLabel(categoryId) {
  return getCategoryById(categoryId)?.label || categoryId;
}

export function getCategoryIcon(categoryId) {
  return getCategoryById(categoryId)?.icon || "✨";
}

export function getSubcategoryLabel(subcategoryId) {
  return getSubcategoryById(subcategoryId)?.label || subcategoryId;
}

export function getChildCategoryLabel(childCategoryId) {
  return getChildCategoryById(childCategoryId)?.label || childCategoryId;
}

export function getFirstSubcategory(categoryId) {
  const category = getCategoryById(categoryId);
  return category?.subcategories?.[0] || null;
}

export function getFirstChildCategory(subcategoryId) {
  const subcategory = getSubcategoryById(subcategoryId);
  return subcategory?.children?.[0] || null;
}

export function subcategoryHasChildren(subcategoryId) {
  const subcategory = getSubcategoryById(subcategoryId);
  return Boolean(subcategory?.children?.length);
}