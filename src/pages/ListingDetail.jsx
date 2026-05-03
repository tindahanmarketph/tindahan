import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getCategoryLabel,
  getChildCategoryLabel,
  getSubcategoryLabel
} from "../lib/categories";
import { supabase } from "../lib/supabase";

const conditionLabels = {
  new: "New with tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  very_good: "Very good"
};

export default function ListingDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      setErrorMessage("");
      setListing(null);
      setSeller(null);

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

        if (sellerError) {
          console.error("Seller profile error:", sellerError);
        } else {
          setSeller(sellerData);
        }
      }

      setLoading(false);
    }

    fetchListing();
  }, [id]);

  useEffect(() => {
    async function incrementViews() {
      if (!listing?.id) return;

      const nextViews = Number(listing.views || 0) + 1;

      await supabase
        .from("listings")
        .update({ views: nextViews })
        .eq("id", listing.id);
    }

    incrementViews();
  }, [listing?.id]);

  const price = Number(listing?.price || 0);
  const protection = price * 0.08;
  const shipping = 80;
  const total = price + protection + shipping;

  const photos = useMemo(() => {
    if (!listing?.photos || !Array.isArray(listing.photos)) return [];
    return listing.photos.filter(Boolean);
  }, [listing]);

  function prevPhoto() {
    if (photos.length === 0) return;
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function nextPhoto() {
    if (photos.length === 0) return;
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
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
    <main className="page">
      <div className="container detail-layout">
        <section className="photo-panel">
          <div className="main-photo">
            {photos.length > 0 ? (
              <img src={photos[photoIndex]} alt={listing.title} />
            ) : (
              <div className="image-placeholder">No photo</div>
            )}

            {photos.length > 1 && (
              <>
                <button className="carousel-btn left" type="button" onClick={prevPhoto}>
                  <ChevronLeft />
                </button>

                <button className="carousel-btn right" type="button" onClick={nextPhoto}>
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="thumb-row">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  className={index === photoIndex ? "thumb active" : "thumb"}
                  onClick={() => setPhotoIndex(index)}
                  type="button"
                >
                  <img src={photo} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="detail-card">
          <h1>{listing.title}</h1>

          <p className="detail-price">₱{price.toLocaleString("en-PH")}</p>

          <div className="tag-row">
            {listing.category && <span>{getCategoryLabel(listing.category)}</span>}

            {listing.subcategory && (
              <span>{getSubcategoryLabel(listing.subcategory)}</span>
            )}

            {listing.child_category && (
              <span>{getChildCategoryLabel(listing.child_category)}</span>
            )}

            {listing.condition && (
              <span>{conditionLabels[listing.condition] || listing.condition}</span>
            )}

            {listing.brand && <span>{listing.brand}</span>}

            {listing.size && <span>Size {listing.size}</span>}
          </div>

          <p className="description">
            {listing.description || "No description provided."}
          </p>

          {listing.location && (
            <p className="location-line">
              <MapPin size={17} />
              {listing.location}
            </p>
          )}

          {seller && (
            <Link to={`/profile/${seller.username}`} className="seller-card">
              <div className="avatar-large">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.username} />
                ) : (
                  seller.username?.slice(0, 1)?.toUpperCase()
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

          <div className="shield-banner">
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
          </div>

          <div className="detail-actions">
            <button className="detail-action-btn detail-buy-btn" type="button">
              Buy Now
            </button>

            <button className="detail-action-btn detail-offer-btn" type="button">
              Make an Offer
            </button>

            <button className="detail-action-btn detail-chat-btn" type="button">
              Chat with seller
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}