import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";
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
  fair: "Fair"
};

export default function ListingDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    async function fetchListing() {
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
            location,
            rating,
            total_sales,
            is_verified
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error(error.message);
        setListing(null);
      } else {
        setListing(data);
      }

      setLoading(false);
    }

    fetchListing();
  }, [id]);

  useEffect(() => {
    async function incrementViews() {
      if (!listing) return;

      await supabase
        .from("listings")
        .update({ views: (listing.views || 0) + 1 })
        .eq("id", listing.id);
    }

    incrementViews();
  }, [listing]);

  const price = Number(listing?.price || 0);
  const protection = price * 0.08;
  const shipping = 80;
  const total = price + protection + shipping;

  const photos = useMemo(() => listing?.photos || [], [listing]);

  function prevPhoto() {
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function nextPhoto() {
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <p>Loading item...</p>
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
            <p>This listing may have been removed.</p>
          </div>
        </div>
      </main>
    );
  }

  const seller = listing.profiles;

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
                  key={photo}
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
            <span>{getCategoryLabel(listing.category)}</span>

            {listing.subcategory && (
              <span>{getSubcategoryLabel(listing.subcategory)}</span>
            )}

            {listing.child_category && (
              <span>{getChildCategoryLabel(listing.child_category)}</span>
            )}

            <span>{conditionLabels[listing.condition]}</span>

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
                  <Star size={15} fill="currentColor" /> {seller.rating} ·{" "}
                  {seller.total_sales} sales
                </p>
              </div>
            </Link>
          )}

          <div className="shield-banner">
            <ShieldCheck />

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
            <button className="primary-button full" type="button">
              Buy Now
            </button>

            <button className="secondary-button full" type="button">
              Make an Offer
            </button>

            <button className="secondary-button full" type="button">
              Chat with seller
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}