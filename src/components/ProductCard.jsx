import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format'

export default function ProductCard({ listing }) {
  const firstImage = listing.listing_images?.[0]?.image_url

  return (
    <Link to={`/item/${listing.id}`} className="product-card">
      <div className="product-image">
        {firstImage ? (
          <img src={firstImage} alt={listing.title} />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
      </div>

      <div className="product-info">
        <h3>{listing.title}</h3>
        <p className="product-price">{formatPrice(listing.price)}</p>
        <p className="product-meta">{listing.condition}</p>
        <p className="product-seller">
          @{listing.profiles?.username || 'seller'}
        </p>
      </div>
    </Link>
  )
}