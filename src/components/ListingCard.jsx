import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCategoryIcon,
  getChildCategoryLabel,
  getSubcategoryLabel
} from "../lib/categories";
import { useAuth } from "../context/AuthContext";
import { checkIsFavorite, toggleFavorite } from "../lib/favorites";

const conditionLabels = {
  new: "New with tags",
  new_without_tags: "New without tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  very_good: "Very good"
};

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFavoriteState() {
      if (!user?.id || !listing?.id) {
        setIsFavorite(false);
        return;
      }

      const favoriteState = await checkIsFavorite(user.id, listing.id);

      if (isMounted) {
        setIsFavorite(favoriteState);
      }
    }

    loadFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [user?.id, listing?.id]);

  if (!listing) return null;

  const seller = listing.profiles;
  const firstPhoto = listing.photos?.[0];

  async function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (favoriteLoading) return;

    const previousValue = isFavorite;
    const nextValue = !previousValue;

    setIsFavorite(nextValue);
    setFavoriteLoading(true);

    try {
      await toggleFavorite(user.id, listing.id, previousValue);
    } catch (error) {
      console.error("Favorite update error:", error);
      setIsFavorite(previousValue);
      alert(error.message || "Unable to update favorites.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <article className="listing-card">
      <Link to={`/item/${listing.id}`} className="listing-image-wrap">
        {firstPhoto ? (
          <img src={firstPhoto} alt={listing.title} className="listing-image" />
        ) : (
          <div className="image-placeholder">No photo</div>
        )}

        <button
          className={isFavorite ? "heart-floating favorited" : "heart-floating"}
          type="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          disabled={favoriteLoading}
          onClick={handleFavoriteClick}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </Link>

      <Link to={`/item/${listing.id}`} className="listing-info">
        <h3>{listing.title}</h3>

        <p className="listing-price">
          ₱{Number(listing.price || 0).toLocaleString("en-PH")}
        </p>

        <p className="listing-condition">
          {conditionLabels[listing.condition] || listing.condition}
        </p>

        {listing.subcategory && (
          <p className="listing-subcategory">
            {getCategoryIcon(listing.category)}{" "}
            {getSubcategoryLabel(listing.subcategory)}
          </p>
        )}

        {listing.child_category && (
          <p className="listing-child-category">
            {getChildCategoryLabel(listing.child_category)}
          </p>
        )}
      </Link>

      {seller && (
        <Link to={`/profile/${seller.username}`} className="seller-mini">
          <div className="avatar-small">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt={seller.username} />
            ) : (
              seller.username?.slice(0, 1)?.toUpperCase()
            )}
          </div>

          <span>{seller.username}</span>
        </Link>
      )}
    </article>
  );
}