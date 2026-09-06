import { supabase } from "./supabase";

export function formatReviewDate(dateValue) {
  if (!dateValue) return "Recently";

  return new Date(dateValue).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function normalizeReviewRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    orderId: row.order_id,
    reviewerId: row.reviewer_id,
    reviewedUserId: row.reviewed_user_id,
    reviewerRole: row.reviewer_role,
    rating: Number(row.rating || 0),
    comment: row.comment || "",
    createdAt: row.created_at,
    reviewer: row.reviewer || row.reviewer_profile || null,
    reviewedUser: row.reviewed_user || row.reviewed_profile || null
  };
}

export async function createReview({
  orderId,
  reviewerId,
  reviewedUserId,
  reviewerRole,
  rating,
  comment = ""
}) {
  if (!orderId) {
    throw new Error("Missing order.");
  }

  if (!reviewerId || !reviewedUserId) {
    throw new Error("Missing review users.");
  }

  const cleanRating = Number(rating);

  if (!Number.isFinite(cleanRating) || cleanRating < 1 || cleanRating > 5) {
    throw new Error("Please choose a rating from 1 to 5 stars.");
  }

  const cleanRole = reviewerRole === "seller" ? "seller" : "buyer";
  const cleanComment = String(comment || "").trim();

  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        order_id: orderId,
        reviewer_id: reviewerId,
        reviewed_user_id: reviewedUserId,
        reviewer_role: cleanRole,
        rating: cleanRating,
        comment: cleanComment
      },
      {
        onConflict: "order_id,reviewer_id,reviewed_user_id"
      }
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return normalizeReviewRow(data);
}

export async function getReviewForOrder({
  orderId,
  reviewerId,
  reviewedUserId
}) {
  if (!orderId || !reviewerId || !reviewedUserId) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .eq("reviewer_id", reviewerId)
    .eq("reviewed_user_id", reviewedUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeReviewRow(data);
}

export async function getReviewsForUser(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewed_user_id", userId)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw fallback.error;
    }

    return (fallback.data || []).map(normalizeReviewRow);
  }

  return (data || []).map(normalizeReviewRow);
}

export async function getUserReviewSummary(userId) {
  const reviews = await getReviewsForUser(userId);

  if (reviews.length === 0) {
    return {
      count: 0,
      average: 0,
      label: "No reviews yet"
    };
  }

  const average =
    reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
    reviews.length;

  return {
    count: reviews.length,
    average,
    label: `${average.toFixed(1)} · ${reviews.length} review${
      reviews.length > 1 ? "s" : ""
    }`
  };
}