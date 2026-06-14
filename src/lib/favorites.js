import { supabase } from "./supabase";

export async function checkIsFavorite(userId, listingId) {
  if (!userId || !listingId) return false;

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (error) {
    console.warn("Favorite check skipped:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function addFavorite(userId, listingId) {
  if (!userId || !listingId) {
    throw new Error("Missing user or listing.");
  }

  const { error } = await supabase
    .from("favorites")
    .insert({
      user_id: userId,
      listing_id: listingId
    });

  if (error && error.code !== "23505") {
    throw error;
  }

  return true;
}

export async function removeFavorite(userId, listingId) {
  if (!userId || !listingId) {
    throw new Error("Missing user or listing.");
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);

  if (error) {
    throw error;
  }

  return false;
}

export async function toggleFavorite(userId, listingId, currentValue) {
  if (currentValue) {
    return removeFavorite(userId, listingId);
  }

  return addFavorite(userId, listingId);
}

export async function fetchFavoriteListings(userId) {
  if (!userId) return [];

  const { data: favoriteRows, error: favoritesError } = await supabase
    .from("favorites")
    .select("listing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favoritesError) {
    throw favoritesError;
  }

  const listingIds = (favoriteRows || [])
    .map((row) => row.listing_id)
    .filter(Boolean);

  if (listingIds.length === 0) return [];

  const { data: listings, error: listingsError } = await supabase
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
    .in("id", listingIds);

  if (listingsError) {
    throw listingsError;
  }

  const listingsById = (listings || []).reduce((acc, listing) => {
    acc[listing.id] = listing;
    return acc;
  }, {});

  return listingIds
    .map((listingId) => listingsById[listingId])
    .filter(Boolean);
}