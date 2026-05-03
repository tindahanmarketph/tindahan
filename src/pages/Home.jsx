import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryBar from "../components/CategoryBar";
import ListingCard from "../components/ListingCard";
import {
  getCategoryLabel,
  getChildCategoryLabel,
  getSubcategoryLabel
} from "../lib/categories";
import { supabase } from "../lib/supabase";

function SkeletonGrid() {
  return (
    <div className="grid">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton skeleton-img"></div>
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line short"></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const subcategory = searchParams.get("subcategory") || "";
  const childCategory = searchParams.get("child_category") || "";
  const sort = searchParams.get("sort") || "recent";

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);

      let query = supabase
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
        .eq("status", "active");

      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (subcategory) {
        query = query.eq("subcategory", subcategory);
      }

      if (childCategory) {
        query = query.eq("child_category", childCategory);
      }

      if (q.trim()) {
        const term = q.trim();

        query = query.or(
          `title.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%`
        );
      }

      if (sort === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price_desc") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error(error.message);
        setListings([]);
      } else {
        setListings(data || []);
      }

      setLoading(false);
    }

    fetchListings();
  }, [q, category, subcategory, childCategory, sort]);

  const title = useMemo(() => {
    if (q) return `Search results for "${q}"`;
    if (childCategory) return getChildCategoryLabel(childCategory);
    if (subcategory) return getSubcategoryLabel(subcategory);
    if (category !== "all") return getCategoryLabel(category);
    return "Fresh finds";
  }, [q, category, subcategory, childCategory]);

  function handleSortChange(e) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", e.target.value);
    setSearchParams(params);
  }

  return (
    <>
      <CategoryBar />

      <main className="page">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>{title}</h1>
              <p>Buy and sell second-hand treasures across the Philippines.</p>
            </div>

            <select className="select" value={sort} onChange={handleSortChange}>
              <option value="recent">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <h2>No items found</h2>
              <p>Try another search, category or subcategory.</p>
            </div>
          ) : (
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