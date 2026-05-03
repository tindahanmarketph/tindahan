import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  formatPrice,
  getBuyerProtection,
  getTotalWithProtection,
  getCategoryLabel
} from "../utils/format";

const conditionLabels = {
  new: "New with tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  very_good: "Very good"
};

function formatRelativeTime(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths < 12) return `${diffMonths} months ago`;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function ItemDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  async function loadListing() {
    setLoading(true);

    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          bio,
          rating,
          sales_count,
          total_sales,
          is_verified,
          location
        ),
        listing_images (
          image_url,
          sort_order
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      setListing(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setListing(null);
      setLoading(false);
      return;
    }

    const sortedImages = [...(data.listing_images || [])].sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );

    setListing({
      ...data,
      listing_images: sortedImages
    });

    setLoading(false);
  }

  const images = useMemo(() => {
    if (!listing) return [];

    if (listing.listing_images?.length > 0) {
      return listing.listing_images.map((image) => image.image_url).filter(Boolean);
    }

    if (Array.isArray(listing.photos)) {
      return listing.photos.filter(Boolean);
    }

    return [];
  }, [listing]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h2>Loading listing...</h2>
            <p>Please wait a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h2>Listing not found</h2>
            <p>This item may have been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const buyerProtection = getBuyerProtection(listing.price);
  const shippingEstimate = 80;
  const total = getTotalWithProtection(listing.price) + shippingEstimate;
  const relativeCreatedAt = formatRelativeTime(listing.created_at);
  const seller = listing.profiles;

  return (
    <div className="page">
      <div className="container item-layout">
        <section className="item-gallery">
          <div className="main-image">
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={listing.title} />
            ) : (
              <div className="image-placeholder">No image</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  className={`thumbnail ${activeImage === index ? "active" : ""}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={imageUrl} alt={`${listing.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="item-panel">
          <div className="item-top">
            <h1>{listing.title}</h1>

            <p className="item-meta-line">
              {listing.size && `${listing.size} · `}
              {conditionLabels[listing.condition] || listing.condition}
              {listing.brand && (
                <>
                  {" · "}
                  <span>{listing.brand}</span>
                </>
              )}
              {" · "}
              Added {relativeCreatedAt}
            </p>

            <div className="item-price">{formatPrice(listing.price)}</div>

            <p className="buyer-protection-small">
              Includes Buyer Protection
            </p>
          </div>

          <div className="product-characteristics">
            {listing.brand && (
              <div className="characteristic-row">
                <span>Brand</span>
                <strong>{listing.brand}</strong>
              </div>
            )}

            {listing.size && (
              <div className="characteristic-row">
                <span>Size</span>
                <strong>{listing.size}</strong>
              </div>
            )}

            {listing.condition && (
              <div className="characteristic-row">
                <span>Condition</span>
                <strong>{conditionLabels[listing.condition] || listing.condition}</strong>
              </div>
            )}

            {listing.color && (
              <div className="characteristic-row">
                <span>Color</span>
                <strong>{listing.color}</strong>
              </div>
            )}

            <div className="characteristic-row">
              <span>Added</span>
              <strong>{relativeCreatedAt}</strong>
            </div>
          </div>

          <div className="item-description-block">
            <p>{listing.description || "No description provided."}</p>
          </div>

          <div className="tag-row">
            {listing.category && <span>{getCategoryLabel(listing.category)}</span>}
            {listing.condition && (
              <span>{conditionLabels[listing.condition] || listing.condition}</span>
            )}
            {listing.brand && <span>{listing.brand}</span>}
            {listing.size && <span>Size {listing.size}</span>}
            {listing.is_negotiable && <span>Negotiable</span>}
          </div>

          <div className="shipping-summary">
            <span>Shipping</span>
            <strong>from {formatPrice(shippingEstimate)}</strong>
          </div>

          {listing.location && (
            <p className="location-line">
              <MapPin size={17} />
              {listing.location}
            </p>
          )}

          {seller && (
            <div className="seller-mini-card">
              <div className="avatar">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.username} />
                ) : (
                  seller.username?.slice(0, 1)?.toUpperCase() || "👤"
                )}
              </div>

              <div>
                <Link to={`/profile/${seller.username}`}>
                  @{seller.username}
                </Link>

                <p>
                  <Star size={15} fill="currentColor" /> {seller.rating || 5} ·{" "}
                  {seller.sales_count || seller.total_sales || 0} sales
                </p>
              </div>
            </div>
          )}

          <div className="buyer-shield">
            <ShieldCheck size={20} />
            <div>
              <strong>Buyer Shield</strong>
              <p>
                Buyer protection helps cover secure payment support and issue handling.
              </p>
            </div>
          </div>

          <div className="price-table">
            <div>
              <span>Item price</span>
              <strong>{formatPrice(listing.price)}</strong>
            </div>

            <div>
              <span>Buyer Protection 8%</span>
              <strong>{formatPrice(buyerProtection)}</strong>
            </div>

            <div>
              <span>Estimated shipping</span>
              <strong>{formatPrice(shippingEstimate)}</strong>
            </div>

            <div className="total-line">
              <span>Estimated total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          <div className="item-actions">
            <button className="item-action-btn item-buy-btn" type="button">
              Buy Now
            </button>

            <button className="item-action-btn item-offer-btn" type="button">
              Make an Offer
            </button>

            <button className="item-action-btn item-chat-btn" type="button">
              Chat with seller
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}