import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { DB_HARDENING } from "./featureFlags";

/*
 * Statistiques vendeur RÉELLES (cahier L3.3) : ventes = commandes complétées,
 * note = moyenne des avis reçus. Plus de « 5 » ni de « 0 » par défaut.
 */

export async function fetchSellerStats(sellerId) {
  const empty = { sales: 0, ratingAvg: null, ratingCount: 0 };
  if (!sellerId) return empty;

  if (DB_HARDENING) {
    try {
      const { data, error } = await supabase.rpc("seller_stats", { p_seller: sellerId });
      if (!error && data && typeof data === "object") {
        return {
          sales: Number(data.completed_sales) || 0,
          ratingAvg: data.rating_count > 0 ? Number(data.rating_avg) : null,
          ratingCount: Number(data.rating_count) || 0
        };
      }
    } catch {
      /* repli ci-dessous */
    }
  }

  const stats = { ...empty };

  try {
    const { data } = await supabase.from("reviews").select("rating").eq("reviewed_user_id", sellerId);
    const ratings = (data || []).map((row) => Number(row.rating)).filter((n) => Number.isFinite(n) && n > 0);
    if (ratings.length > 0) {
      stats.ratingCount = ratings.length;
      stats.ratingAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
  } catch {
    /* ignoré */
  }

  try {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .in("status", ["sold", "completed"]);
    stats.sales = count || 0;
  } catch {
    /* ignoré */
  }

  return stats;
}

export function useSellerStats(sellerId) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStats(null);
    fetchSellerStats(sellerId).then((value) => {
      if (!cancelled) setStats(value);
    });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  return stats;
}

export function formatRatingLabel(stats) {
  if (!stats) return "";
  const sales = `${stats.sales} sale${stats.sales === 1 ? "" : "s"}`;
  if (stats.ratingCount === 0) return `No reviews yet · ${sales}`;
  return `${stats.ratingAvg.toFixed(1)} (${stats.ratingCount}) · ${sales}`;
}
