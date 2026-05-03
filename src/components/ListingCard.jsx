import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getCategoryIcon,
  getChildCategoryLabel,
  getSubcategoryLabel
} from "../lib/categories";

const conditionLabels = {
  new: "New with tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair"
};

export default function ListingCard({ listing }) {
  const seller = listing.profiles;
  const firstPhoto = listing.photos?.[0];

  return (
    <article className="listing-card">
      <Link to={`/item/${listing.id}`} className="listing-image-wrap">
        {firstPhoto ? (
          <img src={firstPhoto} alt={listing.title} className="listing-image" />
        ) : (
          <div className="image-placeholder">No photo</div>
        )}

        <button className="heart-floating" type="button" aria-label="Like">
          <Heart size={18} />
        </button>
      </Link>

      <Link to={`/item/${listing.id}`} className="listing-info">
        <h3>{listing.title}</h3>

        <p className="listing-price">
          ₱{Number(listing.price).toLocaleString("en-PH")}
        </p>

        <p className="listing-condition">
          {conditionLabels[listing.condition] || listing.condition}
        </p>

        {listing.subcategory && (
          <p className="listing-subcategory">
            {getCategoryIcon(listing.category)} {getSubcategoryLabel(listing.subcategory)}
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