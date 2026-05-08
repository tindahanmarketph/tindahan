import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { supabase } from "../lib/supabase";

function ListingSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      if (!isMounted) return;

      setLoading(true);
      setLoadError("");

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error(
            "Supabase environment variables are missing on Netlify. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
          );
        }

        const { data, error } = await supabase
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

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        setListings(data || []);
      } catch (error) {
        console.error("Home listings loading error:", error);

        if (!isMounted) return;

        setListings([]);
        setLoadError(
          error?.message ||
            "Unable to load listings. Please check your Supabase configuration."
        );
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

        {!loading && loadError && (
          <div className="empty-state">
            <h2>Unable to load items</h2>
            <p>{loadError}</p>
            <p className="debug-id">
              Check your Netlify environment variables and Supabase RLS policies.
            </p>
          </div>
        )}

        {!loading && !loadError && listings.length === 0 && (
          <div className="empty-state">
            <h2>No items yet</h2>
            <p>Be the first to list an item on TindaHan.</p>
          </div>
        )}

        {!loading && !loadError && listings.length > 0 && (
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