import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MoreHorizontal,
  ShieldCheck,
  Star
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCategoryLabel,
  getChildCategoryLabel,
  getSubcategoryLabel
} from "../lib/categories";
import { supabase } from "../lib/supabase";
import ListingRecommendations from "../components/ListingRecommendations";

const conditionLabels = {
  new: "New with tags",
  new_without_tags: "New without tags",
  like_new: "Like new",
  very_good: "Very good",
  good: "Good",
  fair: "Fair"
};

function formatRelativeTime(dateValue) {
  if (!dateValue) return "recently";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths < 12) return `${diffMonths} months ago`;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchListing() {
      setLoading(true);
      setErrorMessage("");
      setListing(null);
      setSeller(null);
      setPhotoIndex(0);
      setDescriptionExpanded(false);

      if (!id) {
        setErrorMessage("Missing listing ID.");
        setLoading(false);
        return;
      }

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!isMounted) return;

      if (listingError) {
        console.error("Listing detail error:", listingError);
        setErrorMessage(listingError.message);
        setLoading(false);
        return;
      }

      if (!listingData) {
        setErrorMessage("This listing does not exist or was removed.");
        setLoading(false);
        return;
      }

      setListing(listingData);

      if (listingData.seller_id) {
        const { data: sellerData, error: sellerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", listingData.seller_id)
          .maybeSingle();

        if (!isMounted) return;

        if (sellerError) {
          console.error("Seller profile error:", sellerError);
        } else {
          setSeller(sellerData);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    fetchListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    async function incrementViews() {
      if (!listing?.id) return;

      const nextViews = Number(listing.views || 0) + 1;

      const { error } = await supabase
        .from("listings")
        .update({ views: nextViews })
        .eq("id", listing.id);

      if (error) {
        console.warn("View increment skipped:", error.message);
      }
    }

    incrementViews();
  }, [listing?.id]);

  const photos = useMemo(() => {
    if (!listing?.photos || !Array.isArray(listing.photos)) return [];
    return listing.photos.filter(Boolean);
  }, [listing]);

  const price = Number(listing?.price || 0);
  const protection = price * 0.08;
  const shipping = 80;
  const total = price + protection + shipping;

  const relativeCreatedAt = formatRelativeTime(listing?.created_at);

  const conditionLabel =
    conditionLabels[listing?.condition] || listing?.condition || "";

  const sellerName =
    seller?.username ||
    listing?.profiles?.username ||
    listing?.seller?.username ||
    "Member";

  const categoryLabel = listing?.category
    ? getCategoryLabel(listing.category)
    : "";

  const subcategoryLabel = listing?.subcategory
    ? getSubcategoryLabel(listing.subcategory)
    : "";

  const childCategoryLabel = listing?.child_category
    ? getChildCategoryLabel(listing.child_category)
    : "";

  const description = listing?.description?.trim() || "No description provided.";

  const shouldShowDescriptionToggle = description.length > 150;

  const displayedDescription =
    descriptionExpanded || !shouldShowDescriptionToggle
      ? description
      : `${description.slice(0, 150).trim()}...`;

  const characteristics = [
    listing?.brand ? ["Brand", listing.brand] : null,
    listing?.size ? ["Size", listing.size] : null,
    listing?.condition ? ["Condition", conditionLabel] : null,
    listing?.color ? ["Color", listing.color] : null,
    categoryLabel ? ["Category", categoryLabel] : null,
    subcategoryLabel ? ["Subcategory", subcategoryLabel] : null,
    childCategoryLabel ? ["Type", childCategoryLabel] : null,
    ["Added", relativeCreatedAt]
  ].filter(Boolean);

  const recommendationListing = useMemo(() => {
    if (!listing) return null;

    return {
      ...listing,
      profiles: seller || listing.profiles || null
    };
  }, [listing, seller]);

  function prevPhoto() {
    if (photos.length === 0) return;
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function nextPhoto() {
    if (photos.length === 0) return;
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  function handleChatWithSeller() {
    if (!listing) return;

    const params = new URLSearchParams();

    params.set("listingId", listing.id);
    params.set("title", listing.title || "Item");
    params.set("price", String(listing.price || 0));

    if (photos[0]) {
      params.set("photo", photos[0]);
    }

    if (seller?.id) {
      params.set("sellerId", seller.id);
    }

    if (seller?.username) {
      params.set("seller", seller.username);
    }

    navigate(`/messages?${params.toString()}`);
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <div className="empty-state">
            <h2>Loading item...</h2>
            <p>Please wait a moment.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="page">
        <div className="container">
          <div className="empty-state">
            <h1>Item not found</h1>
            <p>{errorMessage || "This listing may have been removed."}</p>
            <p className="debug-id">Listing ID: {id}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page listing-detail-page listing-detail-vinted-page">
      <div className="mobile-product-topbar">
        <button type="button" onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <button type="button" aria-label="More options">
          <MoreHorizontal size={25} />
        </button>
      </div>

      <div className="container detail-layout product-vinted-layout">
        <div className="detail-left-column product-vinted-left">
          <section className="photo-panel product-gallery-panel">
            <div className="main-photo product-main-photo">
              {photos.length > 0 ? (
                <img src={photos[photoIndex]} alt={listing.title} />
              ) : (
                <div className="image-placeholder">No photo</div>
              )}

              <button
                className="mobile-gallery-back"
                type="button"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                className="mobile-gallery-more"
                type="button"
                aria-label="More options"
              >
                <MoreHorizontal size={26} />
              </button>

              <button
                className="mobile-gallery-heart"
                type="button"
                aria-label="Add to favorites"
              >
                <Heart size={22} />
              </button>

              {photos.length > 1 && (
                <>
                  <button
                    className="carousel-btn left"
                    type="button"
                    onClick={prevPhoto}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft />
                  </button>

                  <button
                    className="carousel-btn right"
                    type="button"
                    onClick={nextPhoto}
                    aria-label="Next photo"
                  >
                    <ChevronRight />
                  </button>

                  <div className="mobile-photo-dots">
                    {photos.map((photo, index) => (
                      <button
                        key={`${photo}-${index}`}
                        type="button"
                        className={index === photoIndex ? "active" : ""}
                        onClick={() => setPhotoIndex(index)}
                        aria-label={`Show photo ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="thumb-row product-thumb-row">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    className={index === photoIndex ? "thumb active" : "thumb"}
                    onClick={() => setPhotoIndex(index)}
                    type="button"
                    aria-label={`Show photo ${index + 1}`}
                  >
                    <img src={photo} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="detail-recommendations-slot product-mobile-recommendations">
            <ListingRecommendations listing={recommendationListing} />
          </section>
        </div>

        <aside className="detail-card detail-sticky-card product-info-panel">
          <section className="product-summary-card">
            <div className="product-title-row">
              <h1>{listing.title}</h1>

              <button
                className="product-favorite-button"
                type="button"
                aria-label="Add to favorites"
              >
                <Heart size={24} />
              </button>
            </div>

            <p className="product-meta-line">
              {listing.size && `${listing.size} · `}
              {conditionLabel}
              {listing.brand && (
                <>
                  {" · "}
                  <span>{listing.brand}</span>
                </>
              )}
              {" · "}
              Added {relativeCreatedAt}
            </p>

            <p className="detail-price product-price">
              ₱{price.toLocaleString("en-PH")}
            </p>

            <p className="buyer-protection-small product-protection-line">
              ₱{(price + protection).toLocaleString("en-PH")} incl. Buyer
              Protection <ShieldCheck size={15} />
            </p>
          </section>

          <section className="mobile-demand-box">
            <span>🔥</span>
            <p>
              In demand! Buyers recently viewed or saved similar items.
            </p>
          </section>

          <section className="product-description-card">
            <h2>Description</h2>

            <p className="product-description-text">{displayedDescription}</p>

            {shouldShowDescriptionToggle && (
              <button
                className="product-see-more-button"
                type="button"
                onClick={() =>
                  setDescriptionExpanded((currentValue) => !currentValue)
                }
              >
                {descriptionExpanded ? "See less" : "See more"}
              </button>
            )}

            <div className="product-characteristics-clean">
              {characteristics.map(([label, value]) => (
                <div className="product-characteristic-clean-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          {seller && (
            <Link
              to={`/profile/${seller.username}`}
              className="seller-card product-seller-card"
            >
              <div className="avatar-large">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.username} />
                ) : (
                  getInitials(seller.username)
                )}
              </div>

              <div>
                <strong>{seller.username}</strong>

                <p>
                  <Star size={15} fill="currentColor" /> {seller.rating || 5} ·{" "}
                  {seller.total_sales || 0} sales
                </p>
              </div>
            </Link>
          )}

          {listing.location && (
            <p className="location-line product-location-line">
              <MapPin size={17} />
              {listing.location}
            </p>
          )}

          <section className="shield-banner product-shield-banner">
            <ShieldCheck size={21} />

            <div>
              <strong>Buyer Protection</strong>
              <p>
                Your payment is held securely until delivery. If there is an
                issue, TindaHan can help.
              </p>
            </div>
          </section>

          <section className="price-table product-price-table">
            <div>
              <span>Item</span>
              <strong>₱{price.toLocaleString("en-PH")}</strong>
            </div>

            <div>
              <span>Buyer Protection 8%</span>
              <strong>₱{protection.toLocaleString("en-PH")}</strong>
            </div>

            <div>
              <span>Estimated J&T delivery</span>
              <strong>₱{shipping.toLocaleString("en-PH")}</strong>
            </div>

            <div className="total-row">
              <span>Total</span>
              <strong>₱{total.toLocaleString("en-PH")}</strong>
            </div>
          </section>

          <div className="detail-actions product-desktop-actions">
            <button className="detail-action-btn detail-offer-btn" type="button">
              Make an offer
            </button>

            <button className="detail-action-btn detail-buy-btn" type="button">
              Buy
            </button>

            <button
              className="detail-action-btn detail-chat-btn"
              type="button"
              onClick={handleChatWithSeller}
            >
              Chat with seller
            </button>
          </div>
        </aside>
      </div>

      <div className="mobile-product-cta-bar">
        <button
          className="mobile-product-offer-button"
          type="button"
          onClick={handleChatWithSeller}
        >
          Make an offer
        </button>

        <button className="mobile-product-buy-button" type="button">
          Buy
        </button>
      </div>
    </main>
  );
}