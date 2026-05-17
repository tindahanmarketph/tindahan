import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import GuestHero from "../components/GuestHero";
import { useAuth } from "../context/AuthContext";
import { supabaseConfig } from "../lib/supabase";
import {
  getCategoryLabel,
  getSubcategoryLabel,
  getChildCategoryLabel
} from "../lib/categories";

const SUPABASE_TIMEOUT_MS = 9000;

function ListingSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

async function fetchWithTimeout(url, options = {}, timeoutMs = SUPABASE_TIMEOUT_MS) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getSupabaseHeaders() {
  return {
    apikey: supabaseConfig.anonKey,
    Authorization: `Bearer ${supabaseConfig.anonKey}`,
    "Content-Type": "application/json"
  };
}

function buildListingsUrl({ category, subcategory, childCategory, query, sort }) {
  const params = new URLSearchParams();

  params.set("select", "*");
  params.set("status", "eq.active");

  if (category && category !== "all") {
    params.set("category", `eq.${category}`);
  }

  if (subcategory) {
    params.set("subcategory", `eq.${subcategory}`);
  }

  if (childCategory) {
    params.set("child_category", `eq.${childCategory}`);
  }

  if (query) {
    const cleanQuery = query.trim();

    if (cleanQuery) {
      params.set(
        "or",
        `(title.ilike.*${cleanQuery}*,description.ilike.*${cleanQuery}*,brand.ilike.*${cleanQuery}*)`
      );
    }
  }

  if (sort === "price-low") {
    params.set("order", "price.asc");
  } else if (sort === "price-high") {
    params.set("order", "price.desc");
  } else {
    params.set("order", "created_at.desc");
  }

  return `${supabaseConfig.url}/rest/v1/listings?${params.toString()}`;
}

async function fetchListingsViaRest({
  category,
  subcategory,
  childCategory,
  query,
  sort
}) {
  if (!supabaseConfig.isReady) {
    return {
      listings: [],
      warning:
        "Supabase environment variables are missing on Netlify. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    };
  }

  const listingsUrl = buildListingsUrl({
    category,
    subcategory,
    childCategory,
    query,
    sort
  });

  const listingsResponse = await fetchWithTimeout(listingsUrl, {
    headers: getSupabaseHeaders()
  });

  if (!listingsResponse.ok) {
    const text = await listingsResponse.text();

    throw new Error(`Listings request failed: ${listingsResponse.status} ${text}`);
  }

  const listings = await listingsResponse.json();

  const sellerIds = [
    ...new Set(listings.map((listing) => listing.seller_id).filter(Boolean))
  ];

  if (sellerIds.length === 0) {
    return {
      listings,
      warning: ""
    };
  }

  try {
    const encodedIds = sellerIds.map((id) => `"${id}"`).join(",");

    const profilesUrl =
      `${supabaseConfig.url}/rest/v1/profiles` +
      `?select=id,username,avatar_url,rating,is_verified,total_sales` +
      `&id=in.(${encodedIds})`;

    const profilesResponse = await fetchWithTimeout(profilesUrl, {
      headers: getSupabaseHeaders()
    });

    if (!profilesResponse.ok) {
      throw new Error(`Profiles request failed: ${profilesResponse.status}`);
    }

    const profiles = await profilesResponse.json();

    const profilesById = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    const listingsWithProfiles = listings.map((listing) => ({
      ...listing,
      profiles: profilesById[listing.seller_id] || null
    }));

    return {
      listings: listingsWithProfiles,
      warning: ""
    };
  } catch (profileError) {
    console.warn("Profiles loading skipped:", profileError.message);

    return {
      listings,
      warning:
        "Items loaded, but seller profiles could not be loaded. Check profiles RLS policies."
    };
  }
}

export default function Home() {
  const { user, loadingAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "all";
  const activeSubcategory = searchParams.get("subcategory") || "";
  const activeChildCategory = searchParams.get("child_category") || "";
  const activeQuery = searchParams.get("q") || "";
  const activeSort = searchParams.get("sort") || "newest";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");

  const isFilteredPage =
    activeQuery ||
    activeCategory !== "all" ||
    activeSubcategory ||
    activeChildCategory;

  const shouldShowGuestHero = !loadingAuth && !user && !isFilteredPage;

  const pageTitle = useMemo(() => {
    if (activeQuery && activeChildCategory) {
      return `${getChildCategoryLabel(activeChildCategory)} results for "${activeQuery}"`;
    }

    if (activeQuery && activeSubcategory) {
      return `${getSubcategoryLabel(activeSubcategory)} results for "${activeQuery}"`;
    }

    if (activeQuery && activeCategory !== "all") {
      return `${getCategoryLabel(activeCategory)} results for "${activeQuery}"`;
    }

    if (activeQuery) {
      return `Results for "${activeQuery}"`;
    }

    if (activeChildCategory) {
      return getChildCategoryLabel(activeChildCategory);
    }

    if (activeSubcategory) {
      return getSubcategoryLabel(activeSubcategory);
    }

    if (activeCategory !== "all") {
      return getCategoryLabel(activeCategory);
    }

    return "Fresh finds";
  }, [activeCategory, activeSubcategory, activeChildCategory, activeQuery]);

  const pageSubtitle = useMemo(() => {
    if (activeChildCategory) {
      return `Explore second-hand ${getChildCategoryLabel(
        activeChildCategory
      ).toLowerCase()} items across the Philippines.`;
    }

    if (activeSubcategory) {
      return `Explore second-hand ${getSubcategoryLabel(
        activeSubcategory
      ).toLowerCase()} items across the Philippines.`;
    }

    if (activeCategory !== "all") {
      return `Explore second-hand ${getCategoryLabel(
        activeCategory
      ).toLowerCase()} items across the Philippines.`;
    }

    return "Buy and sell second-hand treasures across the Philippines.";
  }, [activeCategory, activeSubcategory, activeChildCategory]);

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setLoading(true);
      setLoadMessage("");

      try {
        const result = await fetchListingsViaRest({
          category: activeCategory,
          subcategory: activeSubcategory,
          childCategory: activeChildCategory,
          query: activeQuery,
          sort: activeSort
        });

        if (!isMounted) return;

        setListings(result.listings || []);
        setLoadMessage(result.warning || "");
      } catch (error) {
        console.error("Home listings loading error:", error);

        if (!isMounted) return;

        setListings([]);
        setLoadMessage(error?.message || "Unable to load listings from Supabase.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [
    activeCategory,
    activeSubcategory,
    activeChildCategory,
    activeQuery,
    activeSort
  ]);

  function handleSortChange(event) {
    const nextSort = event.target.value;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("sort", nextSort);

    setSearchParams(nextParams);
  }

  return (
    <>
      {shouldShowGuestHero && <GuestHero />}

      <main className="page">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>{pageTitle}</h1>
              <p>{pageSubtitle}</p>
            </div>

            <select className="select" value={activeSort} onChange={handleSortChange}>
              <option value="newest">Newest first</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>
          </div>

          {loading && (
            <div className="grid">
              {Array.from({ length: 12 }).map((_, index) => (
                <ListingSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && loadMessage && listings.length === 0 && (
            <div className="empty-state">
              <h2>Unable to load items</h2>
              <p>{loadMessage}</p>
              <p className="debug-id">
                Check Netlify environment variables, Supabase table name, columns and
                RLS policies.
              </p>
            </div>
          )}

          {!loading && !loadMessage && listings.length === 0 && (
            <div className="empty-state">
              <h2>No items found</h2>
              <p>
                {isFilteredPage
                  ? "There are no active items matching this selection yet."
                  : "Be the first to list an item on TindaHan."}
              </p>
            </div>
          )}

          {!loading && loadMessage && listings.length > 0 && (
            <div className="empty-state" style={{ marginBottom: 20 }}>
              <h2>Items loaded with a warning</h2>
              <p>{loadMessage}</p>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}