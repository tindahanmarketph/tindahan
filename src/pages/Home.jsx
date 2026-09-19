import {
  useEffect,
  useMemo,
  useState
} from "react";
import {
  useSearchParams
} from "react-router-dom";
import {
  BadgeCheck,
  HeartHandshake,
  ShieldCheck,
  Tag
} from "lucide-react";
import ListingCard from "../components/ListingCard";
import GuestHero from "../components/GuestHero";
import SearchFilterChips from "../components/SearchFilterChips";
import { useAuth } from "../context/AuthContext";
import { supabaseConfig } from "../lib/supabase";
import {
  getCategoryLabel,
  getChildCategoryLabel,
  getSubcategoryLabel
} from "../lib/categories";
import {
  countActiveSearchFilters,
  readMultiParam
} from "../lib/searchFilters";

const SUPABASE_TIMEOUT_MS =
  9000;

function ListingSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

function HomeTrustCards() {
  const trustCards = [
    {
      icon: (
        <ShieldCheck
          size={21}
        />
      ),
      title:
        "8% Buyer Protection",
      text:
        "Secure payment until delivery"
    },
    {
      icon: (
        <Tag
          size={21}
        />
      ),
      title:
        "0% Seller Fees",
      text:
        "List for free, always"
    },
    {
      icon: (
        <BadgeCheck
          size={21}
        />
      ),
      title:
        "Trusted Marketplace",
      text:
        "Safer buying and selling on TindaHan"
    },
    {
      icon: (
        <HeartHandshake
          size={21}
        />
      ),
      title:
        "Made by Filipinos for Filipinos",
      text:
        "Local, simple and built for the Philippines"
    }
  ];

  return (
    <section className="home-trust-section">
      <div className="container home-trust-inner home-trust-card-mobile-slider">
        {trustCards.map(
          (
            card,
            index
          ) => (
            <div
              key={
                card.title
              }
              className="home-trust-card"
              style={{
                "--trust-index":
                  index
              }}
            >
              <div className="home-trust-icon">
                {
                  card.icon
                }
              </div>

              <div>
                <strong>
                  {
                    card.title
                  }
                </strong>

                <span>
                  {
                    card.text
                  }
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = SUPABASE_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(() => {
      controller.abort();
    }, timeoutMs);

  try {
    return await fetch(
      url,
      {
        ...options,
        signal:
          controller.signal
      }
    );
  } finally {
    clearTimeout(
      timeoutId
    );
  }
}

function getSupabaseHeaders() {
  return {
    apikey:
      supabaseConfig.anonKey,
    Authorization:
      `Bearer ${supabaseConfig.anonKey}`,
    "Content-Type":
      "application/json"
  };
}

function sanitizeSearchQuery(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .replace(
      /[(),]/g,
      " "
    );
}

function buildListingsUrl({
  category,
  subcategory,
  childCategory,
  query,
  sort,
  minimumPrice,
  maximumPrice
}) {
  const params =
    new URLSearchParams();

  params.set(
    "select",
    "*"
  );

  /*
   * Public marketplace:
   * available / active / reserved only.
   * Sold items never return in feed/search.
   */
  params.set(
    "status",
    "in.(active,available,reserved)"
  );

  params.set(
    "limit",
    "1000"
  );

  if (
    category &&
    category !== "all"
  ) {
    params.set(
      "category",
      `eq.${category}`
    );
  }

  if (subcategory) {
    params.set(
      "subcategory",
      `eq.${subcategory}`
    );
  }

  if (childCategory) {
    params.set(
      "child_category",
      `eq.${childCategory}`
    );
  }

  if (query) {
    const cleanQuery =
      sanitizeSearchQuery(
        query
      );

    if (cleanQuery) {
      params.set(
        "or",
        `(title.ilike.*${cleanQuery}*,description.ilike.*${cleanQuery}*,brand.ilike.*${cleanQuery}*)`
      );
    }
  }

  const parsedMinimum =
    Number(
      minimumPrice
    );

  const parsedMaximum =
    Number(
      maximumPrice
    );

  if (
    minimumPrice !== "" &&
    Number.isFinite(
      parsedMinimum
    )
  ) {
    params.set(
      "price",
      `gte.${parsedMinimum}`
    );
  }

  if (
    maximumPrice !== "" &&
    Number.isFinite(
      parsedMaximum
    )
  ) {
    /*
     * PostgREST cannot use the same
     * price query parameter twice via set().
     * Maximum is therefore finalized
     * client-side below.
     */
  }

  if (
    sort ===
      "price-low"
  ) {
    params.set(
      "order",
      "price.asc"
    );
  } else if (
    sort ===
      "price-high"
  ) {
    params.set(
      "order",
      "price.desc"
    );
  } else {
    params.set(
      "order",
      "created_at.desc"
    );
  }

  return `${supabaseConfig.url}/rest/v1/listings?${params.toString()}`;
}

function normalizeText(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
}

function matchesAnyExact(
  listingValue,
  selectedValues
) {
  if (
    !selectedValues.length
  ) {
    return true;
  }

  const cleanListingValue =
    normalizeText(
      listingValue
    );

  return selectedValues.some(
    (value) =>
      cleanListingValue ===
      normalizeText(
        value
      )
  );
}

function matchesAnyContained(
  listingValue,
  selectedValues
) {
  if (
    !selectedValues.length
  ) {
    return true;
  }

  const cleanListingValue =
    normalizeText(
      listingValue
    );

  return selectedValues.some(
    (value) =>
      cleanListingValue.includes(
        normalizeText(
          value
        )
      )
  );
}

function applySearchFilters(
  listings,
  {
    sizes,
    brands,
    conditions,
    colors,
    materials,
    minimumPrice,
    maximumPrice
  }
) {
  const min =
    Number(
      minimumPrice
    );

  const max =
    Number(
      maximumPrice
    );

  return (
    listings || []
  ).filter(
    (listing) => {
      if (
        !matchesAnyExact(
          listing.size,
          sizes
        )
      ) {
        return false;
      }

      if (
        !matchesAnyExact(
          listing.brand,
          brands
        )
      ) {
        return false;
      }

      if (
        !matchesAnyExact(
          listing.condition,
          conditions
        )
      ) {
        return false;
      }

      if (
        !matchesAnyContained(
          listing.color,
          colors
        )
      ) {
        return false;
      }

      const materialText =
        [
          listing.material,
          listing.description
        ]
          .filter(
            Boolean
          )
          .join(" ");

      if (
        !matchesAnyContained(
          materialText,
          materials
        )
      ) {
        return false;
      }

      const price =
        Number(
          listing.price || 0
        );

      if (
        minimumPrice !== "" &&
        Number.isFinite(
          min
        ) &&
        price < min
      ) {
        return false;
      }

      if (
        maximumPrice !== "" &&
        Number.isFinite(
          max
        ) &&
        price > max
      ) {
        return false;
      }

      return true;
    }
  );
}

async function fetchListingsViaRest({
  category,
  subcategory,
  childCategory,
  query,
  sort,
  sizes,
  brands,
  conditions,
  colors,
  materials,
  minimumPrice,
  maximumPrice
}) {
  if (
    !supabaseConfig.isReady
  ) {
    return {
      listings: [],
      warning:
        "Supabase environment variables are missing on Netlify."
    };
  }

  const listingsUrl =
    buildListingsUrl({
      category,
      subcategory,
      childCategory,
      query,
      sort,
      minimumPrice,
      maximumPrice
    });

  const listingsResponse =
    await fetchWithTimeout(
      listingsUrl,
      {
        headers:
          getSupabaseHeaders()
      }
    );

  if (
    !listingsResponse.ok
  ) {
    const text =
      await listingsResponse.text();

    throw new Error(
      `Listings request failed: ${listingsResponse.status} ${text}`
    );
  }

  const rawListings =
    await listingsResponse.json();

  const filteredListings =
    applySearchFilters(
      rawListings,
      {
        sizes,
        brands,
        conditions,
        colors,
        materials,
        minimumPrice,
        maximumPrice
      }
    );

  const sellerIds = [
    ...new Set(
      filteredListings
        .map(
          (listing) =>
            listing.seller_id
        )
        .filter(Boolean)
    )
  ];

  if (
    sellerIds.length === 0
  ) {
    return {
      listings:
        filteredListings,
      warning: ""
    };
  }

  try {
    const encodedIds =
      sellerIds
        .map(
          (id) =>
            `"${id}"`
        )
        .join(",");

    let profilesUrl =
      `${supabaseConfig.url}/rest/v1/profiles` +
      `?select=id,username,avatar_url,rating,is_verified,total_sales,holiday_mode` +
      `&id=in.(${encodedIds})`;

    let profilesResponse =
      await fetchWithTimeout(
        profilesUrl,
        {
          headers:
            getSupabaseHeaders()
        }
      );

    if (
      !profilesResponse.ok
    ) {
      profilesUrl =
        `${supabaseConfig.url}/rest/v1/profiles` +
        `?select=id,username,avatar_url,rating,is_verified,total_sales` +
        `&id=in.(${encodedIds})`;

      profilesResponse =
        await fetchWithTimeout(
          profilesUrl,
          {
            headers:
              getSupabaseHeaders()
          }
        );
    }

    if (
      !profilesResponse.ok
    ) {
      throw new Error(
        `Profiles request failed: ${profilesResponse.status}`
      );
    }

    const profiles =
      await profilesResponse.json();

    const profilesById =
      profiles.reduce(
        (
          accumulator,
          profile
        ) => {
          accumulator[
            profile.id
          ] = profile;

          return accumulator;
        },
        {}
      );

    return {
      listings:
        filteredListings
          .map(
            (listing) => ({
              ...listing,
              profiles:
                profilesById[
                  listing
                    .seller_id
                ] || null
            })
          )
          .filter(
            (listing) =>
              !listing.profiles
                ?.holiday_mode
          ),
      warning: ""
    };
  } catch (
    profileError
  ) {
    console.warn(
      "Profiles loading skipped:",
      profileError.message
    );

    /*
     * Do not show an RLS warning
     * to marketplace users.
     */
    return {
      listings:
        filteredListings,
      warning: ""
    };
  }
}

function useMobileFeedZoomLock() {
  useEffect(() => {
    const isMobileViewport =
      () =>
        window.innerWidth <=
        760;

    let lastTouchEnd = 0;

    function preventGesture(
      event
    ) {
      if (
        isMobileViewport()
      ) {
        event.preventDefault();
      }
    }

    function preventMultiTouch(
      event
    ) {
      if (
        !isMobileViewport()
      ) {
        return;
      }

      if (
        event.touches &&
        event.touches.length >
          1
      ) {
        event.preventDefault();
      }
    }

    function preventDoubleTapZoom(
      event
    ) {
      if (
        !isMobileViewport()
      ) {
        return;
      }

      const now =
        Date.now();

      if (
        now -
          lastTouchEnd <=
        320
      ) {
        event.preventDefault();
      }

      lastTouchEnd =
        now;
    }

    function preventCtrlWheelZoom(
      event
    ) {
      if (
        !isMobileViewport()
      ) {
        return;
      }

      if (
        event.ctrlKey
      ) {
        event.preventDefault();
      }
    }

    const html =
      document.documentElement;

    const body =
      document.body;

    const previousHtmlTouchAction =
      html.style.touchAction;

    const previousBodyTouchAction =
      body.style.touchAction;

    const previousHtmlOverflowX =
      html.style.overflowX;

    const previousBodyOverflowX =
      body.style.overflowX;

    html.style.touchAction =
      "pan-y";

    body.style.touchAction =
      "pan-y";

    html.style.overflowX =
      "hidden";

    body.style.overflowX =
      "hidden";

    document.addEventListener(
      "gesturestart",
      preventGesture,
      {
        passive: false
      }
    );

    document.addEventListener(
      "gesturechange",
      preventGesture,
      {
        passive: false
      }
    );

    document.addEventListener(
      "gestureend",
      preventGesture,
      {
        passive: false
      }
    );

    document.addEventListener(
      "touchmove",
      preventMultiTouch,
      {
        passive: false
      }
    );

    document.addEventListener(
      "touchend",
      preventDoubleTapZoom,
      {
        passive: false
      }
    );

    document.addEventListener(
      "wheel",
      preventCtrlWheelZoom,
      {
        passive: false
      }
    );

    return () => {
      html.style.touchAction =
        previousHtmlTouchAction;

      body.style.touchAction =
        previousBodyTouchAction;

      html.style.overflowX =
        previousHtmlOverflowX;

      body.style.overflowX =
        previousBodyOverflowX;

      document.removeEventListener(
        "gesturestart",
        preventGesture
      );

      document.removeEventListener(
        "gesturechange",
        preventGesture
      );

      document.removeEventListener(
        "gestureend",
        preventGesture
      );

      document.removeEventListener(
        "touchmove",
        preventMultiTouch
      );

      document.removeEventListener(
        "touchend",
        preventDoubleTapZoom
      );

      document.removeEventListener(
        "wheel",
        preventCtrlWheelZoom
      );
    };
  }, []);
}

export default function Home() {
  useMobileFeedZoomLock();

  const {
    user,
    loadingAuth
  } = useAuth();

  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const paramsKey =
    searchParams.toString();

  const activeCategory =
    searchParams.get(
      "category"
    ) || "all";

  const activeSubcategory =
    searchParams.get(
      "subcategory"
    ) || "";

  const activeChildCategory =
    searchParams.get(
      "child_category"
    ) || "";

  const activeQuery =
    searchParams.get(
      "q"
    ) || "";

  const activeSort =
    searchParams.get(
      "sort"
    ) || "newest";

  const activeSizes =
    readMultiParam(
      searchParams,
      "size"
    );

  const activeBrands =
    readMultiParam(
      searchParams,
      "brand"
    );

  const activeConditions =
    readMultiParam(
      searchParams,
      "condition"
    );

  const activeColors =
    readMultiParam(
      searchParams,
      "color"
    );

  const activeMaterials =
    readMultiParam(
      searchParams,
      "material"
    );

  const minimumPrice =
    searchParams.get(
      "min_price"
    ) || "";

  const maximumPrice =
    searchParams.get(
      "max_price"
    ) || "";

  const activeFilterCount =
    countActiveSearchFilters(
      searchParams
    );

  const [
    listings,
    setListings
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    loadMessage,
    setLoadMessage
  ] = useState("");

  const isFilteredPage =
    Boolean(
      activeQuery ||
        activeCategory !==
          "all" ||
        activeSubcategory ||
        activeChildCategory ||
        activeFilterCount >
          0
    );

  const shouldShowGuestHero =
    !loadingAuth &&
    !user &&
    !isFilteredPage;

  const shouldShowFilters =
    Boolean(
      activeQuery ||
        activeFilterCount >
          0 ||
        activeCategory !==
          "all"
    );

  const pageTitle =
    useMemo(() => {
      if (
        activeQuery &&
        activeChildCategory
      ) {
        return `${getChildCategoryLabel(
          activeChildCategory
        )} results for "${activeQuery}"`;
      }

      if (
        activeQuery &&
        activeSubcategory
      ) {
        return `${getSubcategoryLabel(
          activeSubcategory
        )} results for "${activeQuery}"`;
      }

      if (
        activeQuery &&
        activeCategory !==
          "all"
      ) {
        return `${getCategoryLabel(
          activeCategory
        )} results for "${activeQuery}"`;
      }

      if (
        activeQuery
      ) {
        return `Results for "${activeQuery}"`;
      }

      if (
        activeChildCategory
      ) {
        return getChildCategoryLabel(
          activeChildCategory
        );
      }

      if (
        activeSubcategory
      ) {
        return getSubcategoryLabel(
          activeSubcategory
        );
      }

      if (
        activeCategory !==
        "all"
      ) {
        return getCategoryLabel(
          activeCategory
        );
      }

      return "Fresh finds";
    }, [
      activeCategory,
      activeSubcategory,
      activeChildCategory,
      activeQuery
    ]);

  const pageSubtitle =
    useMemo(() => {
      if (
        activeChildCategory
      ) {
        return `Explore second-hand ${getChildCategoryLabel(
          activeChildCategory
        ).toLowerCase()} items across the Philippines.`;
      }

      if (
        activeSubcategory
      ) {
        return `Explore second-hand ${getSubcategoryLabel(
          activeSubcategory
        ).toLowerCase()} items across the Philippines.`;
      }

      if (
        activeCategory !==
        "all"
      ) {
        return `Explore second-hand ${getCategoryLabel(
          activeCategory
        ).toLowerCase()} items across the Philippines.`;
      }

      return "Buy and sell second-hand treasures across the Philippines.";
    }, [
      activeCategory,
      activeSubcategory,
      activeChildCategory
    ]);

  useEffect(() => {
    let isMounted =
      true;

    async function loadListings() {
      setLoading(true);
      setLoadMessage("");

      try {
        const result =
          await fetchListingsViaRest(
            {
              category:
                activeCategory,
              subcategory:
                activeSubcategory,
              childCategory:
                activeChildCategory,
              query:
                activeQuery,
              sort:
                activeSort,
              sizes:
                activeSizes,
              brands:
                activeBrands,
              conditions:
                activeConditions,
              colors:
                activeColors,
              materials:
                activeMaterials,
              minimumPrice,
              maximumPrice
            }
          );

        if (
          !isMounted
        ) {
          return;
        }

        setListings(
          result.listings ||
            []
        );

        setLoadMessage(
          result.warning ||
            ""
        );
      } catch (
        error
      ) {
        console.error(
          "Home listings loading error:",
          error
        );

        if (
          !isMounted
        ) {
          return;
        }

        setListings([]);

        setLoadMessage(
          error?.message ||
            "Unable to load listings from Supabase."
        );
      } finally {
        if (
          isMounted
        ) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted =
        false;
    };
  }, [
    paramsKey
  ]);

  function handleSortChange(
    event
  ) {
    const nextSort =
      event.target.value;

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (
      nextSort ===
      "newest"
    ) {
      nextParams.delete(
        "sort"
      );
    } else {
      nextParams.set(
        "sort",
        nextSort
      );
    }

    setSearchParams(
      nextParams
    );
  }

  return (
    <>
      {shouldShowGuestHero && (
        <>
          <GuestHero />

          <HomeTrustCards />
        </>
      )}

      <main
        className={
          isFilteredPage
            ? "page home-page"
            : "page home-page home-page-unfiltered"
        }
      >
        <div className="container home-feed-container">
          {shouldShowFilters && (
            <SearchFilterChips />
          )}

          <div className="page-header home-page-header search-results-heading">
            <div>
              <h1>
                {pageTitle}
              </h1>

              <p>
                {pageSubtitle}
              </p>
            </div>

            <select
              className="select home-desktop-sort"
              value={
                activeSort
              }
              onChange={
                handleSortChange
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="price-low">
                Price low to high
              </option>

              <option value="price-high">
                Price high to low
              </option>
            </select>
          </div>

          {!loading &&
            listings.length >
              0 && (
              <div className="search-results-count">
                {listings.length.toLocaleString(
                  "en-PH"
                )}{" "}
                result
                {listings.length !==
                1
                  ? "s"
                  : ""}
              </div>
            )}

          {loading && (
            <div className="grid home-feed-grid">
              {Array.from({
                length: 12
              }).map(
                (
                  _,
                  index
                ) => (
                  <ListingSkeleton
                    key={
                      index
                    }
                  />
                )
              )}
            </div>
          )}

          {!loading &&
            loadMessage &&
            listings.length ===
              0 && (
              <div className="empty-state home-error-state">
                <h2>
                  Unable to load items
                </h2>

                <p>
                  {
                    loadMessage
                  }
                </p>
              </div>
            )}

          {!loading &&
            !loadMessage &&
            listings.length ===
              0 && (
              <div className="empty-state">
                <h2>
                  No items found
                </h2>

                <p>
                  {isFilteredPage
                    ? "Try changing or removing some filters."
                    : "Be the first to list an item on TindaHan."}
                </p>
              </div>
            )}

          {!loading &&
            listings.length >
              0 && (
              <div className="grid home-feed-grid">
                {listings.map(
                  (
                    listing
                  ) => (
                    <ListingCard
                      key={
                        listing.id
                      }
                      listing={
                        listing
                      }
                    />
                  )
                )}
              </div>
            )}
        </div>
      </main>
    </>
  );
}