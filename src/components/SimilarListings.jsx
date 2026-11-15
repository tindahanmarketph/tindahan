import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ListingCard from "./ListingCard";

/* Articles similaires (cahier L4.1) : même catégorie, annonces actives uniquement. */
export default function SimilarListings({ category, excludeId, title = "You may also like" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let query = supabase
        .from("listings")
        .select("*, profiles(id, username, avatar_url, rating, is_verified)")
        .in("status", ["active", "available"])
        .order("created_at", { ascending: false })
        .limit(9);

      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (cancelled || error) return;

      const rows = (data || []).filter((row) => String(row.id) !== String(excludeId)).slice(0, 8);

      if (rows.length === 0 && category) {
        /* Rien dans la catégorie : on montre les dernières annonces. */
        const fallback = await supabase
          .from("listings")
          .select("*, profiles(id, username, avatar_url, rating, is_verified)")
          .in("status", ["active", "available"])
          .order("created_at", { ascending: false })
          .limit(9);
        if (!cancelled && !fallback.error) {
          setItems((fallback.data || []).filter((r) => String(r.id) !== String(excludeId)).slice(0, 8));
        }
        return;
      }

      setItems(rows);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="similar-listings" data-testid="similar-listings">
      <h2>{title}</h2>
      <div className="grid">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
