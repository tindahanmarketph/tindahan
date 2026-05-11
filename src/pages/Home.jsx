import { useEffect, useMemo, useState } from "react";
import ListingCard from "../components/ListingCard";
import { supabase } from "../lib/supabase";

const SUPABASE_TIMEOUT_MS = 9000;
const LISTINGS_LIMIT = 80;

function ListingSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

function getEnvStatus() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    supabaseUrl,
    supabaseAnonKey,
    isReady: Boolean(supabaseUrl && supabaseAnonKey)
  };
}

async function runSupabaseQuery(buildQuery, timeoutMs = SUPABASE_TIMEOUT_MS) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const query = buildQuery(controller.signal);
    const result = await query;

    return result;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function attachAbortSignal(query, signal) {
  if (typeof query.abortSignal === "function") {
    return query.abortSignal(signal);
  }

  return query;
}

function getListingSellerId(listing) {
  return listing?.seller_id || listing?.user_id || listing?.profile_id || null;
}

async function fetchListingsOnly() {
  /*
    1. On tente d'abord avec status = active.
    2. Si ça échoue ou si ça retourne zéro résultat, on tente sans filtre status.
       Ça évite une Home vide si tes anciennes annonces ont status = null,
       published, available, ou autre.
  */

  try {
    const activeResult = await runSupabaseQuery((signal) => {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(LISTINGS_LIMIT);

      query = attachAbortSignal(query, signal);

      return query;
    });

    if (activeResult.error) {
      throw activeResult.error;
    }

    if (Array.isArray(activeResult.data) && activeResult.data.length > 0) {
      return {
        listings: activeResult.data,
        warning: ""
      };
    }

    const fallbackResult = await runSupabaseQuery((signal) => {
      let query = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(LISTINGS_LIMIT);

      query = attachAbortSignal(query, signal);

      return query;
    });

    if (fallbackResult.error) {
      throw fallbackResult.error;
    }

    return {
      listings: fallbackResult.data || [],
      warning:
        fallbackResult.data?.length > 0
          ? "Some listings were loaded without filtering by active status. Check the status column values in Supabase."
          : ""
    };
  } catch (error) {
    console.error("Listings query failed:", error);

    return {
      listings: [],
      warning:
        error?.name === "AbortError"
          ? "Supabase request timed out. Check your Supabase RLS policies and Netlify environment variables."
          : error?.message || "Unable to load listings from Supabase."
    };
  }
}

async function fetchSellerProfiles(listings) {
  const sellerIds = [
    ...new Set(
      listings
        .map((listing) => getListingSellerId(listing))
        .filter(Boolean)
    )
  ];

  if (sellerIds.length === 0) {
    return {};
  }

  try {
    const result = await runSupabaseQuery((signal) => {
      let query = supabase
        .from("profiles")
        .select("id, username, avatar_url, rating, is_verified, total_sales")
        .in("id", sellerIds);

      query = attachAbortSignal(query, signal);

      return query;
    }, 6000);

    if (result.error) {
      throw result.error;
    }

    const profilesMap = {};

    (result.data || []).forEach((profile) => {
      profilesMap[profile.id] = profile;
    });

    return profilesMap;
  } catch (error) {
    console.warn("Seller profiles query skipped:", error?.message || error);
    return {};
  }
}

async function fetchListingsSafely() {
  const listingsResult = await fetchListingsOnly();

  if (listingsResult.listings.length === 0) {
    return listingsResult;
  }

  const profilesMap = await fetchSellerProfiles(listingsResult.listings);

  const enrichedListings = listingsResult.listings.map((listing) => {
    const sellerId = getListingSellerId(listing);

    return {
      ...listing,
      profiles: listing.profiles || profilesMap[sellerId] || null
    };
  });

  return {
    listings: enrichedListings,
    warning: listingsResult.warning
  };
}

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setLoading(true);
      setLoadMessage("");

      const env = getEnvStatus();

      if (!env.isReady) {
        if (!isMounted) return;

        setListings([]);
        setLoadMessage(
          "Supabase environment variables are missing on Netlify. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
        );
        setLoading(false);
        return;
      }

      const result = await fetchListingsSafely();

      if (!isMounted) return;

      setListings(result.listings);
      setLoadMessage(result.warning);
      setLoading(false);
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedListings = useMemo(() => {
    const copy = [...listings];

    if (sort === "price-low") {
      return copy.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "price-high") {
      return copy.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return copy.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      return dateB - dateA;
    });
  }, [listings, sort]);

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Fresh finds</h1>
            <p>Buy and sell second-hand treasures across the Philippines.</p>
          </div>

          <select
            className="select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
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

        {!loading && loadMessage && sortedListings.length === 0 && (
          <div className="empty-state">
            <h2>Unable to load items</h2>
            <p>{loadMessage}</p>
            <p className="debug-id">
              Check Netlify environment variables, Supabase table name, columns
              and RLS policies.
            </p>
          </div>
        )}

        {!loading && !loadMessage && sortedListings.length === 0 && (
          <div className="empty-state">
            <h2>No items yet</h2>
            <p>Be the first to list an item on TindaHan.</p>
          </div>
        )}

        {!loading && loadMessage && sortedListings.length > 0 && (
          <div className="empty-state" style={{ marginBottom: 20 }}>
            <h2>Items loaded with a warning</h2>
            <p>{loadMessage}</p>
          </div>
        )}

        {!loading && sortedListings.length > 0 && (
          <div className="grid">
            {sortedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}