import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { supabase } from "../lib/supabase";

const SUPABASE_TIMEOUT_MS = 7000;

function ListingSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Supabase request timed out."));
    }, ms);
  });
}

async function fetchListingsSafely() {
  /*
    Première requête : version complète avec profiles.
    Si ça bloque ou si la relation profiles pose problème sur Netlify,
    on tente une deuxième requête plus simple.
  */

  try {
    const fullQuery = supabase
      .from("listings")
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    const { data, error } = await Promise.race([
      fullQuery,
      timeoutPromise(SUPABASE_TIMEOUT_MS)
    ]);

    if (error) {
      throw error;
    }

    return {
      listings: data || [],
      warning: ""
    };
  } catch (fullQueryError) {
    console.warn("Full listings query failed:", fullQueryError?.message);

    try {
      const simpleQuery = supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const { data, error } = await Promise.race([
        simpleQuery,
        timeoutPromise(SUPABASE_TIMEOUT_MS)
      ]);

      if (error) {
        throw error;
      }

      return {
        listings: data || [],
        warning:
          "Listings loaded without seller profile data. Check the profiles relation or RLS policies."
      };
    } catch (simpleQueryError) {
      console.error("Simple listings query failed:", simpleQueryError);

      return {
        listings: [],
        warning:
          simpleQueryError?.message ||
          "Unable to load listings from Supabase."
      };
    }
  }
}

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setLoading(true);
      setLoadMessage("");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
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

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Fresh finds</h1>
            <p>Buy and sell second-hand treasures across the Philippines.</p>
          </div>

          <select className="select" defaultValue="newest">
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
              Check Netlify environment variables, Supabase table name, columns
              and RLS policies.
            </p>
          </div>
        )}

        {!loading && !loadMessage && listings.length === 0 && (
          <div className="empty-state">
            <h2>No items yet</h2>
            <p>Be the first to list an item on TindaHan.</p>
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
  );
}