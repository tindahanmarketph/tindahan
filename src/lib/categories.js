/* =========================================================
   TINDAHAN CATEGORIES
   Main categories used across the marketplace
========================================================= */

export const CATEGORIES = [
  {
    id: "women",
    label: "Women",
    icon: "👗",
    subcategories: [
      {
        id: "women_clothing",
        label: "Clothing"
      },
      {
        id: "women_shoes",
        label: "Shoes"
      },
      {
        id: "women_bags",
        label: "Bags"
      },
      {
        id: "women_accessories",
        label: "Accessories"
      },
      {
        id: "women_beauty",
        label: "Beauty"
      },
      {
        id: "women_maternity",
        label: "Maternity"
      }
    ]
  },

  {
    id: "men",
    label: "Men",
    icon: "👔",
    subcategories: [
      {
        id: "men_clothing",
        label: "Clothing"
      },
      {
        id: "men_shoes",
        label: "Shoes"
      },
      {
        id: "men_bags",
        label: "Bags"
      },
      {
        id: "men_accessories",
        label: "Accessories"
      },
      {
        id: "men_grooming",
        label: "Grooming"
      }
    ]
  },

  {
    id: "kids",
    label: "Kids",
    icon: "🧸",
    subcategories: [
      {
        id: "kids_girls_clothing",
        label: "Girls clothing"
      },
      {
        id: "kids_boys_clothing",
        label: "Boys clothing"
      },
      {
        id: "kids_baby_clothing",
        label: "Baby clothing"
      },
      {
        id: "kids_shoes",
        label: "Kids shoes"
      },
      {
        id: "kids_toys",
        label: "Toys"
      },
      {
        id: "kids_school_items",
        label: "School items"
      },
      {
        id: "kids_baby_gear",
        label: "Baby gear"
      },
      {
        id: "kids_accessories",
        label: "Kids accessories"
      }
    ]
  },

  {
    id: "designer",
    label: "Designer",
    icon: "✨",
    subcategories: [
      {
        id: "designer_clothing",
        label: "Designer clothing"
      },
      {
        id: "designer_shoes",
        label: "Designer shoes"
      },
      {
        id: "designer_bags",
        label: "Designer bags"
      },
      {
        id: "designer_accessories",
        label: "Designer accessories"
      },
      {
        id: "designer_watches",
        label: "Luxury watches"
      }
    ]
  },

  {
    id: "home",
    label: "Home",
    icon: "🏠",
    subcategories: [
      {
        id: "home_decor",
        label: "Home decor"
      },
      {
        id: "home_kitchen",
        label: "Kitchen"
      },
      {
        id: "home_bedding",
        label: "Bedding"
      },
      {
        id: "home_bath",
        label: "Bath"
      },
      {
        id: "home_storage",
        label: "Storage"
      },
      {
        id: "home_furniture",
        label: "Furniture"
      },
      {
        id: "home_garden",
        label: "Garden"
      },
      {
        id: "home_appliances",
        label: "Appliances",
        children: [
          {
            id: "home_rice_cookers",
            label: "Rice cookers"
          },
          {
            id: "home_electric_fans",
            label: "Electric fans"
          },
          {
            id: "home_kettles",
            label: "Kettles"
          },
          {
            id: "home_small_kitchen_appliances",
            label: "Small kitchen appliances"
          },
          {
            id: "home_air_coolers",
            label: "Air coolers"
          },
          {
            id: "home_other_small_appliances",
            label: "Other small appliances"
          }
        ]
      }
    ]
  },

  {
    id: "electronics",
    label: "Electronics",
    icon: "📱",
    subcategories: [
      {
        id: "electronics_phones",
        label: "Mobile phones"
      },
      {
        id: "electronics_tablets",
        label: "Tablets"
      },
      {
        id: "electronics_computers",
        label: "Computers"
      },
      {
        id: "electronics_cameras",
        label: "Cameras"
      },
      {
        id: "electronics_audio",
        label: "Audio"
      },
      {
        id: "electronics_gaming",
        label: "Gaming consoles"
      },
      {
        id: "electronics_smartwatches",
        label: "Smartwatches"
      },
      {
        id: "electronics_accessories",
        label: "Accessories"
      }
    ]
  },

  {
    id: "entertainment",
    label: "Entertainment",
    icon: "🎮",
    subcategories: [
      {
        id: "entertainment_books",
        label: "Books"
      },
      {
        id: "entertainment_movies",
        label: "Movies"
      },
      {
        id: "entertainment_music",
        label: "Music"
      },
      {
        id: "entertainment_video_games",
        label: "Video games"
      },
      {
        id: "entertainment_board_games",
        label: "Board games"
      },
      {
        id: "entertainment_comics_manga",
        label: "Comics & manga"
      }
    ]
  },

  {
    id: "hobbies",
    label: "Hobbies",
    icon: "🃏",
    subcategories: [
      {
        id: "hobbies_collectibles",
        label: "Collectibles"
      },
      {
        id: "hobbies_trading_cards",
        label: "Trading cards"
      },
      {
        id: "hobbies_art_supplies",
        label: "Art supplies"
      },
      {
        id: "hobbies_instruments",
        label: "Musical instruments"
      },
      {
        id: "hobbies_crafts",
        label: "Crafts"
      },
      {
        id: "hobbies_photography",
        label: "Photography gear"
      },
      {
        id: "hobbies_antiques",
        label: "Antiques"
      }
    ]
  },

  {
    id: "sports",
    label: "Sports",
    icon: "⚽",
    subcategories: [
      {
        id: "sports_clothing",
        label: "Sports clothing"
      },
      {
        id: "sports_shoes",
        label: "Sports shoes"
      },
      {
        id: "sports_fitness",
        label: "Fitness equipment"
      },
      {
        id: "sports_outdoor",
        label: "Outdoor gear"
      },
      {
        id: "sports_cycling",
        label: "Cycling"
      },
      {
        id: "sports_basketball",
        label: "Basketball"
      },
      {
        id: "sports_swimming",
        label: "Swimming"
      },
      {
        id: "sports_other",
        label: "Other sports"
      }
    ]
  },

  {
    id: "pets",
    label: "Pets",
    icon: "🐾",
    subcategories: [
      {
        id: "pets_accessories",
        label: "Pet accessories"
      },
      {
        id: "pets_clothing",
        label: "Pet clothing"
      },
      {
        id: "pets_toys",
        label: "Pet toys"
      },
      {
        id: "pets_carriers",
        label: "Pet carriers"
      },
      {
        id: "pets_bowls_feeders",
        label: "Bowls & feeders"
      }
    ]
  },

  {
    id: "beauty",
    label: "Beauty",
    icon: "💄",
    subcategories: [
      {
        id: "beauty_makeup",
        label: "Makeup"
      },
      {
        id: "beauty_skincare",
        label: "Skincare"
      },
      {
        id: "beauty_haircare",
        label: "Hair care"
      },
      {
        id: "beauty_fragrance",
        label: "Fragrance"
      },
      {
        id: "beauty_nails",
        label: "Nail care"
      },
      {
        id: "beauty_tools",
        label: "Beauty tools"
      }
    ]
  },

  {
    id: "school_office",
    label: "School & Office",
    icon: "🎒",
    subcategories: [
      {
        id: "school_bags",
        label: "School bags"
      },
      {
        id: "school_uniforms",
        label: "Uniforms"
      },
      {
        id: "school_books",
        label: "Books"
      },
      {
        id: "school_stationery",
        label: "Stationery"
      },
      {
        id: "office_supplies",
        label: "Office supplies"
      },
      {
        id: "school_calculators",
        label: "Calculators"
      }
    ]
  },

  {
    id: "local_cultural",
    label: "Local & Cultural",
    icon: "🇵🇭",
    subcategories: [
      {
        id: "local_barong",
        label: "Barong Tagalog"
      },
      {
        id: "local_filipiniana",
        label: "Filipiniana dresses"
      },
      {
        id: "local_handmade",
        label: "Local handmade items"
      },
      {
        id: "local_brands",
        label: "Local fashion brands"
      },
      {
        id: "local_festival",
        label: "Festival outfits"
      },
      {
        id: "local_accessories",
        label: "Traditional accessories"
      }
    ]
  },

  {
    id: "travel_motorbike",
    label: "Travel & Motorbike",
    icon: "🛵",
    subcategories: [
      {
        id: "travel_bags",
        label: "Travel bags"
      },
      {
        id: "travel_accessories",
        label: "Travel accessories"
      },
      {
        id: "motorbike_helmets",
        label: "Motorcycle helmets"
      },
      {
        id: "motorbike_raincoats",
        label: "Raincoats"
      },
      {
        id: "motorbike_phone_mounts",
        label: "Phone mounts"
      },
      {
        id: "motorbike_jackets",
        label: "Riding jackets"
      }
    ]
  }
];


/* =========================================================
   DETAILED SEARCH CATEGORY TREE
   Used by search filters
   Women / Men / Designer completed first
========================================================= */

export const SEARCH_CATEGORY_TREE = [
  {
    id: "women",
    label: "Women",
    icon: "👗",
    children: [
      {
        id: "women_clothing",
        label: "Clothing",
        icon: "👚",
        children: [
          {
            id: "women_coats_jackets",
            label: "Coats & jackets"
          },
          {
            id: "women_hoodies_sweatshirts",
            label: "Hoodies & sweatshirts"
          },
          {
            id: "women_blazers_suits",
            label: "Blazers & suits"
          },
          {
            id: "women_dresses",
            label: "Dresses"
          },
          {
            id: "women_skirts",
            label: "Skirts"
          },
          {
            id: "women_skorts",
            label: "Skorts"
          },
          {
            id: "women_tops_tshirts",
            label: "Tops & T-shirts"
          },
          {
            id: "women_shirts_blouses",
            label: "Shirts & blouses"
          },
          {
            id: "women_knitwear",
            label: "Knitwear"
          },
          {
            id: "women_jeans",
            label: "Jeans"
          },
          {
            id: "women_trousers_leggings",
            label: "Trousers & leggings"
          },
          {
            id: "women_shorts",
            label: "Shorts"
          },
          {
            id: "women_jumpsuits_rompers",
            label: "Jumpsuits & rompers"
          },
          {
            id: "women_swimwear",
            label: "Swimwear"
          },
          {
            id: "women_lingerie_sleepwear",
            label: "Lingerie & sleepwear"
          },
          {
            id: "women_maternity_clothing",
            label: "Maternity"
          },
          {
            id: "women_sportswear",
            label: "Sportswear"
          },
          {
            id: "women_costumes",
            label: "Costumes & special outfits"
          },
          {
            id: "women_other_clothing",
            label: "Other clothing"
          }
        ]
      },

      {
        id: "women_shoes",
        label: "Shoes",
        icon: "👟",
        children: [
          {
            id: "women_ballet_flats",
            label: "Ballet flats"
          },
          {
            id: "women_loafers",
            label: "Loafers & boat shoes"
          },
          {
            id: "women_boots",
            label: "Boots"
          },
          {
            id: "women_mules_clogs",
            label: "Mules & clogs"
          },
          {
            id: "women_espadrilles",
            label: "Espadrilles"
          },
          {
            id: "women_slides_flip_flops",
            label: "Slides & flip-flops"
          },
          {
            id: "women_heels",
            label: "Heels"
          },
          {
            id: "women_lace_up_shoes",
            label: "Lace-up shoes"
          },
          {
            id: "women_mary_janes",
            label: "Mary Janes"
          },
          {
            id: "women_sandals",
            label: "Sandals"
          },
          {
            id: "women_slippers",
            label: "Slippers"
          },
          {
            id: "women_sports_shoes",
            label: "Sports shoes"
          },
          {
            id: "women_sneakers",
            label: "Sneakers"
          },
          {
            id: "women_other_shoes",
            label: "Other shoes"
          }
        ]
      },

      {
        id: "women_bags",
        label: "Bags",
        icon: "👜",
        children: [
          {
            id: "women_backpacks",
            label: "Backpacks"
          },
          {
            id: "women_beach_bags",
            label: "Beach bags"
          },
          {
            id: "women_bucket_bags",
            label: "Bucket bags"
          },
          {
            id: "women_belt_bags",
            label: "Belt bags"
          },
          {
            id: "women_clutches",
            label: "Clutches"
          },
          {
            id: "women_garment_bags",
            label: "Garment bags"
          },
          {
            id: "women_gym_bags",
            label: "Gym bags"
          },
          {
            id: "women_handbags",
            label: "Handbags"
          },
          {
            id: "women_crossbody_bags",
            label: "Crossbody bags"
          },
          {
            id: "women_messenger_bags",
            label: "Messenger bags"
          },
          {
            id: "women_duffel_bags",
            label: "Duffel bags"
          },
          {
            id: "women_travel_bags",
            label: "Travel bags"
          },
          {
            id: "women_makeup_bags",
            label: "Makeup bags"
          },
          {
            id: "women_school_bags",
            label: "School bags & satchels"
          },
          {
            id: "women_shoulder_bags",
            label: "Shoulder bags"
          },
          {
            id: "women_tote_bags",
            label: "Tote bags"
          },
          {
            id: "women_wallets",
            label: "Wallets & purses"
          },
          {
            id: "women_wristlets",
            label: "Wristlets"
          },
          {
            id: "women_other_bags",
            label: "Other bags"
          }
        ]
      },

      {
        id: "women_accessories",
        label: "Accessories",
        icon: "💍",
        children: [
          {
            id: "women_bandanas",
            label: "Bandanas & hair scarves"
          },
          {
            id: "women_belts",
            label: "Belts"
          },
          {
            id: "women_gloves",
            label: "Gloves"
          },
          {
            id: "women_hair_accessories",
            label: "Hair accessories"
          },
          {
            id: "women_hats_caps",
            label: "Hats & caps"
          },
          {
            id: "women_jewelry",
            label: "Jewelry"
          },
          {
            id: "women_keychains",
            label: "Keychains"
          },
          {
            id: "women_scarves_shawls",
            label: "Scarves & shawls"
          },
          {
            id: "women_sunglasses",
            label: "Sunglasses"
          },
          {
            id: "women_umbrellas",
            label: "Umbrellas"
          },
          {
            id: "women_watches",
            label: "Watches"
          },
          {
            id: "women_other_accessories",
            label: "Other accessories"
          }
        ]
      },

      {
        id: "women_beauty",
        label: "Beauty",
        icon: "💄",
        children: [
          {
            id: "women_beauty_skincare",
            label: "Skincare"
          },
          {
            id: "women_beauty_haircare",
            label: "Hair care"
          },
          {
            id: "women_beauty_bodycare",
            label: "Body care"
          },
          {
            id: "women_beauty_hands_nails",
            label: "Hand & nail care"
          },
          {
            id: "women_beauty_fragrance",
            label: "Fragrance"
          },
          {
            id: "women_beauty_makeup",
            label: "Makeup"
          },
          {
            id: "women_beauty_tools",
            label: "Beauty tools & accessories"
          },
          {
            id: "women_beauty_sets",
            label: "Beauty sets"
          },
          {
            id: "women_beauty_other",
            label: "Other beauty products"
          }
        ]
      },

      {
        id: "women_maternity",
        label: "Maternity",
        icon: "🤰",
        children: [
          {
            id: "women_maternity_tops",
            label: "Maternity tops"
          },
          {
            id: "women_maternity_dresses",
            label: "Maternity dresses"
          },
          {
            id: "women_maternity_trousers",
            label: "Maternity trousers & leggings"
          },
          {
            id: "women_maternity_lingerie",
            label: "Maternity lingerie"
          },
          {
            id: "women_maternity_nursing",
            label: "Nursing clothing"
          },
          {
            id: "women_maternity_other",
            label: "Other maternity clothing"
          }
        ]
      }
    ]
  },

  {
    id: "men",
    label: "Men",
    icon: "👔",
    children: [
      {
        id: "men_clothing",
        label: "Clothing",
        icon: "👕",
        children: [
          {
            id: "men_jeans",
            label: "Jeans"
          },
          {
            id: "men_coats_jackets",
            label: "Coats & jackets"
          },
          {
            id: "men_tops_tshirts",
            label: "Tops & T-shirts"
          },
          {
            id: "men_shirts",
            label: "Shirts"
          },
          {
            id: "men_suits_blazers",
            label: "Suits & blazers"
          },
          {
            id: "men_sweaters",
            label: "Sweaters & knitwear"
          },
          {
            id: "men_hoodies_sweatshirts",
            label: "Hoodies & sweatshirts"
          },
          {
            id: "men_pants",
            label: "Pants"
          },
          {
            id: "men_shorts",
            label: "Shorts"
          },
          {
            id: "men_underwear_socks",
            label: "Underwear & socks"
          },
          {
            id: "men_sleepwear",
            label: "Sleepwear"
          },
          {
            id: "men_swimwear",
            label: "Swimwear"
          },
          {
            id: "men_sportswear",
            label: "Sportswear"
          },
          {
            id: "men_costumes",
            label: "Costumes & special outfits"
          },
          {
            id: "men_other_clothing",
            label: "Other clothing"
          }
        ]
      },

      {
        id: "men_shoes",
        label: "Shoes",
        icon: "👞",
        children: [
          {
            id: "men_loafers",
            label: "Loafers & boat shoes"
          },
          {
            id: "men_boots",
            label: "Boots"
          },
          {
            id: "men_mules_clogs",
            label: "Mules & clogs"
          },
          {
            id: "men_espadrilles",
            label: "Espadrilles"
          },
          {
            id: "men_slides_flip_flops",
            label: "Slides & flip-flops"
          },
          {
            id: "men_dress_shoes",
            label: "Dress shoes"
          },
          {
            id: "men_lace_up_shoes",
            label: "Lace-up shoes"
          },
          {
            id: "men_sandals",
            label: "Sandals"
          },
          {
            id: "men_slippers",
            label: "Slippers"
          },
          {
            id: "men_sports_shoes",
            label: "Sports shoes"
          },
          {
            id: "men_sneakers",
            label: "Sneakers"
          },
          {
            id: "men_other_shoes",
            label: "Other shoes"
          }
        ]
      },

      {
        id: "men_bags",
        label: "Bags",
        icon: "🎒",
        children: [
          {
            id: "men_backpacks",
            label: "Backpacks"
          },
          {
            id: "men_briefcases",
            label: "Briefcases"
          },
          {
            id: "men_crossbody_bags",
            label: "Crossbody bags"
          },
          {
            id: "men_duffel_bags",
            label: "Duffel bags"
          },
          {
            id: "men_gym_bags",
            label: "Gym bags"
          },
          {
            id: "men_laptop_bags",
            label: "Laptop bags"
          },
          {
            id: "men_messenger_bags",
            label: "Messenger bags"
          },
          {
            id: "men_travel_bags",
            label: "Travel bags"
          },
          {
            id: "men_tote_bags",
            label: "Tote bags"
          },
          {
            id: "men_wallets",
            label: "Wallets"
          },
          {
            id: "men_other_bags",
            label: "Other bags"
          }
        ]
      },

      {
        id: "men_accessories",
        label: "Accessories",
        icon: "⌚",
        children: [
          {
            id: "men_bandanas",
            label: "Bandanas & head scarves"
          },
          {
            id: "men_belts",
            label: "Belts"
          },
          {
            id: "men_suspenders",
            label: "Suspenders"
          },
          {
            id: "men_gloves",
            label: "Gloves"
          },
          {
            id: "men_pocket_squares",
            label: "Pocket squares"
          },
          {
            id: "men_hats_caps",
            label: "Hats & caps"
          },
          {
            id: "men_jewelry",
            label: "Jewelry"
          },
          {
            id: "men_scarves",
            label: "Scarves & shawls"
          },
          {
            id: "men_sunglasses",
            label: "Sunglasses"
          },
          {
            id: "men_ties_bow_ties",
            label: "Ties & bow ties"
          },
          {
            id: "men_watches",
            label: "Watches"
          },
          {
            id: "men_keychains",
            label: "Keychains"
          },
          {
            id: "men_other_accessories",
            label: "Other accessories"
          }
        ]
      },

      {
        id: "men_grooming",
        label: "Grooming",
        icon: "🧴",
        children: [
          {
            id: "men_grooming_face",
            label: "Face care"
          },
          {
            id: "men_grooming_shaving",
            label: "Shaving"
          },
          {
            id: "men_grooming_hair",
            label: "Hair care"
          },
          {
            id: "men_grooming_body",
            label: "Body care"
          },
          {
            id: "men_grooming_hands_nails",
            label: "Hand & nail care"
          },
          {
            id: "men_grooming_fragrance",
            label: "Fragrance"
          },
          {
            id: "men_grooming_accessories",
            label: "Grooming accessories"
          },
          {
            id: "men_grooming_other",
            label: "Other grooming products"
          }
        ]
      }
    ]
  },

  {
    id: "designer",
    label: "Designer",
    icon: "✨",
    children: [
      {
        id: "designer_women",
        label: "Designer for Women",
        icon: "👗",
        children: [
          {
            id: "designer_women_clothing",
            label: "Clothing",
            children: [
              {
                id: "designer_women_dresses",
                label: "Dresses"
              },
              {
                id: "designer_women_tops",
                label: "Tops & shirts"
              },
              {
                id: "designer_women_knitwear",
                label: "Knitwear"
              },
              {
                id: "designer_women_jackets",
                label: "Jackets & coats"
              },
              {
                id: "designer_women_blazers",
                label: "Blazers"
              },
              {
                id: "designer_women_jeans",
                label: "Jeans"
              },
              {
                id: "designer_women_trousers",
                label: "Trousers"
              },
              {
                id: "designer_women_skirts",
                label: "Skirts"
              },
              {
                id: "designer_women_shorts",
                label: "Shorts"
              }
            ]
          },

          {
            id: "designer_women_shoes",
            label: "Shoes",
            children: [
              {
                id: "designer_women_sneakers",
                label: "Sneakers"
              },
              {
                id: "designer_women_heels",
                label: "Heels"
              },
              {
                id: "designer_women_boots",
                label: "Boots"
              },
              {
                id: "designer_women_sandals",
                label: "Sandals"
              },
              {
                id: "designer_women_flats",
                label: "Flats"
              },
              {
                id: "designer_women_loafers",
                label: "Loafers"
              }
            ]
          },

          {
            id: "designer_women_bags",
            label: "Bags",
            children: [
              {
                id: "designer_women_handbags",
                label: "Handbags"
              },
              {
                id: "designer_women_shoulder_bags",
                label: "Shoulder bags"
              },
              {
                id: "designer_women_crossbody_bags",
                label: "Crossbody bags"
              },
              {
                id: "designer_women_tote_bags",
                label: "Tote bags"
              },
              {
                id: "designer_women_clutches",
                label: "Clutches"
              },
              {
                id: "designer_women_backpacks",
                label: "Backpacks"
              }
            ]
          },

          {
            id: "designer_women_accessories",
            label: "Accessories",
            children: [
              {
                id: "designer_women_belts",
                label: "Belts"
              },
              {
                id: "designer_women_sunglasses",
                label: "Sunglasses"
              },
              {
                id: "designer_women_scarves",
                label: "Scarves"
              },
              {
                id: "designer_women_jewelry",
                label: "Jewelry"
              },
              {
                id: "designer_women_wallets",
                label: "Wallets"
              },
              {
                id: "designer_women_hats",
                label: "Hats & caps"
              }
            ]
          },

          {
            id: "designer_women_watches",
            label: "Watches"
          }
        ]
      },

      {
        id: "designer_men",
        label: "Designer for Men",
        icon: "⌚",
        children: [
          {
            id: "designer_men_clothing",
            label: "Clothing",
            children: [
              {
                id: "designer_men_tshirts",
                label: "T-shirts"
              },
              {
                id: "designer_men_shirts",
                label: "Shirts"
              },
              {
                id: "designer_men_knitwear",
                label: "Knitwear"
              },
              {
                id: "designer_men_hoodies",
                label: "Hoodies & sweatshirts"
              },
              {
                id: "designer_men_jackets",
                label: "Jackets & coats"
              },
              {
                id: "designer_men_suits",
                label: "Suits & blazers"
              },
              {
                id: "designer_men_jeans",
                label: "Jeans"
              },
              {
                id: "designer_men_trousers",
                label: "Trousers"
              },
              {
                id: "designer_men_shorts",
                label: "Shorts"
              }
            ]
          },

          {
            id: "designer_men_shoes",
            label: "Shoes",
            children: [
              {
                id: "designer_men_sneakers",
                label: "Sneakers"
              },
              {
                id: "designer_men_loafers",
                label: "Loafers"
              },
              {
                id: "designer_men_boots",
                label: "Boots"
              },
              {
                id: "designer_men_dress_shoes",
                label: "Dress shoes"
              },
              {
                id: "designer_men_sandals",
                label: "Sandals"
              }
            ]
          },

          {
            id: "designer_men_bags",
            label: "Bags",
            children: [
              {
                id: "designer_men_backpacks",
                label: "Backpacks"
              },
              {
                id: "designer_men_briefcases",
                label: "Briefcases"
              },
              {
                id: "designer_men_crossbody_bags",
                label: "Crossbody bags"
              },
              {
                id: "designer_men_messenger_bags",
                label: "Messenger bags"
              },
              {
                id: "designer_men_travel_bags",
                label: "Travel bags"
              }
            ]
          },

          {
            id: "designer_men_accessories",
            label: "Accessories",
            children: [
              {
                id: "designer_men_belts",
                label: "Belts"
              },
              {
                id: "designer_men_sunglasses",
                label: "Sunglasses"
              },
              {
                id: "designer_men_wallets",
                label: "Wallets"
              },
              {
                id: "designer_men_ties",
                label: "Ties & bow ties"
              },
              {
                id: "designer_men_jewelry",
                label: "Jewelry"
              },
              {
                id: "designer_men_hats",
                label: "Hats & caps"
              }
            ]
          },

          {
            id: "designer_men_watches",
            label: "Watches"
          }
        ]
      }
    ]
  },

  {
    id: "kids",
    label: "Kids",
    icon: "🧸",
    children: []
  },

  {
    id: "home",
    label: "Home",
    icon: "🏠",
    children: []
  },

  {
    id: "electronics",
    label: "Electronics",
    icon: "📱",
    children: []
  },

  {
    id: "entertainment",
    label: "Entertainment",
    icon: "🎮",
    children: []
  },

  {
    id: "hobbies",
    label: "Hobbies",
    icon: "🃏",
    children: []
  },

  {
    id: "sports",
    label: "Sports",
    icon: "⚽",
    children: []
  },

  {
    id: "pets",
    label: "Pets",
    icon: "🐾",
    children: []
  },

  {
    id: "beauty",
    label: "Beauty",
    icon: "💄",
    children: []
  },

  {
    id: "school_office",
    label: "School & Office",
    icon: "🎒",
    children: []
  },

  {
    id: "local_cultural",
    label: "Local & Cultural",
    icon: "🇵🇭",
    children: []
  },

  {
    id: "travel_motorbike",
    label: "Travel & Motorbike",
    icon: "🛵",
    children: []
  }
];


/* =========================================================
   SEARCH TREE HELPERS
========================================================= */

export function findSearchNodeById(nodeId) {
  if (!nodeId) {
    return null;
  }

  function search(nodes) {
    for (const node of nodes || []) {
      if (node.id === nodeId) {
        return node;
      }

      if (node.children?.length) {
        const childResult = search(
          node.children
        );

        if (childResult) {
          return childResult;
        }
      }
    }

    return null;
  }

  return search(
    SEARCH_CATEGORY_TREE
  );
}


export function getSearchCategoryById(categoryId) {
  return (
    SEARCH_CATEGORY_TREE.find(
      (category) =>
        category.id === categoryId
    ) || null
  );
}


export function getSearchCategoryChildren(categoryId) {
  return (
    findSearchNodeById(
      categoryId
    )?.children || []
  );
}


export function getSearchNodePath(nodeId) {
  if (!nodeId) {
    return [];
  }

  function walk(nodes, path = []) {
    for (const node of nodes || []) {
      const nextPath = [
        ...path,
        node
      ];

      if (node.id === nodeId) {
        return nextPath;
      }

      if (node.children?.length) {
        const result = walk(
          node.children,
          nextPath
        );

        if (result.length) {
          return result;
        }
      }
    }

    return [];
  }

  return walk(
    SEARCH_CATEGORY_TREE
  );
}


export function searchNodeHasChildren(nodeId) {
  const node =
    findSearchNodeById(
      nodeId
    );

  return Boolean(
    node?.children?.length
  );
}


/* =========================================================
   CORE HELPERS
   Used by Home, ListingCard, NewListing, Product page...
========================================================= */

export function getCategoryById(categoryId) {
  return (
    CATEGORIES.find(
      (category) =>
        category.id === categoryId
    ) || null
  );
}


export function getSubcategoryById(subcategoryId) {
  for (const category of CATEGORIES) {
    const subcategory =
      category.subcategories?.find(
        (sub) =>
          sub.id ===
          subcategoryId
      );

    if (subcategory) {
      return subcategory;
    }
  }

  const searchNode =
    findSearchNodeById(
      subcategoryId
    );

  return searchNode || null;
}


export function getChildCategoryById(childCategoryId) {
  for (const category of CATEGORIES) {
    for (
      const subcategory
      of category.subcategories || []
    ) {
      if (
        !subcategory.children?.length
      ) {
        continue;
      }

      const child =
        subcategory.children.find(
          (item) =>
            item.id ===
            childCategoryId
        );

      if (child) {
        return child;
      }
    }
  }

  return (
    findSearchNodeById(
      childCategoryId
    ) || null
  );
}


/* =========================================================
   LABEL HELPERS
========================================================= */

export function getCategoryLabel(categoryId) {
  return (
    getCategoryById(
      categoryId
    )?.label ||
    findSearchNodeById(
      categoryId
    )?.label ||
    categoryId ||
    ""
  );
}


/*
  IMPORTANT:
  ListingCard.jsx imports this function.
  Keep this export.
*/
export function getCategoryIcon(categoryId) {
  return (
    getCategoryById(
      categoryId
    )?.icon ||
    findSearchNodeById(
      categoryId
    )?.icon ||
    "✨"
  );
}


export function getSubcategoryLabel(subcategoryId) {
  return (
    getSubcategoryById(
      subcategoryId
    )?.label ||
    findSearchNodeById(
      subcategoryId
    )?.label ||
    subcategoryId ||
    ""
  );
}


export function getChildCategoryLabel(childCategoryId) {
  return (
    getChildCategoryById(
      childCategoryId
    )?.label ||
    findSearchNodeById(
      childCategoryId
    )?.label ||
    childCategoryId ||
    ""
  );
}


/* =========================================================
   LISTING CREATION HELPERS
========================================================= */

export function getFirstSubcategory(categoryId) {
  const category =
    getCategoryById(
      categoryId
    );

  return (
    category
      ?.subcategories
      ?.[0] ||
    null
  );
}


export function getFirstChildCategory(subcategoryId) {
  const subcategory =
    getSubcategoryById(
      subcategoryId
    );

  return (
    subcategory
      ?.children
      ?.[0] ||
    null
  );
}


export function subcategoryHasChildren(subcategoryId) {
  const subcategory =
    getSubcategoryById(
      subcategoryId
    );

  return Boolean(
    subcategory
      ?.children
      ?.length
  );
}