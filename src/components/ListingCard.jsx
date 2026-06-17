import { Heart, Info, Package, ShieldCheck, X } from "lucide-react";
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

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

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

  const itemPrice = Number(listing.price || 0);
  const buyerProtection = itemPrice * 0.08;
  const protectedPrice = itemPrice + buyerProtection;

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

  function openPriceDetails(event) {
    event.preventDefault();
    event.stopPropagation();
    setShowPriceDetails(true);
  }

  function closePriceDetails(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setShowPriceDetails(false);
  }

  return (
    <>
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
            ₱{Number(itemPrice || 0).toLocaleString("en-PH")}
          </p>

          <button
            type="button"
            className="listing-protected-price"
            onClick={openPriceDetails}
            aria-label="Show price details"
          >
            ₱{formatPrice(protectedPrice)} incl. Buyer Protection
            <ShieldCheck size={13} />
          </button>

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

      {showPriceDetails && (
        <div
          className="price-details-overlay"
          role="presentation"
          onClick={closePriceDetails}
        >
          <section
            className="price-details-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Price details"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="price-details-header">
              <span />
              <h2>Price details</h2>

              <button type="button" onClick={closePriceDetails} aria-label="Close">
                <X size={26} />
              </button>
            </header>

            <div className="price-details-body">
              <div className="price-details-product">
                <div className="price-details-product-image">
                  {firstPhoto ? (
                    <img src={firstPhoto} alt={listing.title} />
                  ) : (
                    <Package size={22} />
                  )}
                </div>

                <div>
                  <strong>{listing.title}</strong>
                  <span>₱{formatPrice(itemPrice)}</span>
                </div>
              </div>

              <div className="price-details-row">
                <div className="price-details-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <strong>
                    Buyer Protection fees <Info size={16} />
                  </strong>
                  <span>₱{formatPrice(buyerProtection)}</span>
                </div>
              </div>

              <div className="price-details-muted-label">
                To be selected at checkout
              </div>

              <div className="price-details-row">
                <div className="price-details-icon">
                  <Package size={20} />
                </div>

                <div>
                  <strong>Shipping fees</strong>
                  <span>from ₱80.00</span>
                  <small>Depending on the selected delivery method</small>
                </div>
              </div>

              <p className="price-details-note">
                Buyer Protection fees are mandatory when you buy an item on
                TindaHan. These fees are added every time a purchase is validated.
                The item price is set by the seller and can be negotiated.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}