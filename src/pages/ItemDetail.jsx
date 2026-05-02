import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  formatPrice,
  getBuyerProtection,
  getTotalWithProtection,
  getCategoryLabel
} from '../utils/format'

export default function ItemDetail() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListing()
  }, [id])

  async function loadListing() {
    setLoading(true)

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          bio,
          rating,
          sales_count,
          is_verified,
          location
        ),
        listing_images (
          image_url,
          sort_order
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error(error.message)
      setListing(null)
    } else {
      const sortedImages = [...(data.listing_images || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      )

      setListing({
        ...data,
        listing_images: sortedImages
      })
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading listing...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Listing not found</h2>
          <p>This item may have been removed.</p>
        </div>
      </div>
    )
  }

  const images = listing.listing_images || []
  const buyerProtection = getBuyerProtection(listing.price)
  const total = getTotalWithProtection(listing.price)
  const shippingEstimate = 80

  return (
    <div className="page">
      <div className="item-layout">
        <section className="item-gallery">
          <div className="main-image">
            {images[activeImage] ? (
              <img src={images[activeImage].image_url} alt={listing.title} />
            ) : (
              <div className="image-placeholder">No image</div>
            )}
          </div>

          <div className="thumbnail-row">
            {images.map((image, index) => (
              <button
                key={image.image_url}
                className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={image.image_url} alt={`${listing.title} ${index + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <section className="item-panel">
          <h1>{listing.title}</h1>

          <div className="item-price">{formatPrice(listing.price)}</div>

          <div className="tag-row">
            <span>{getCategoryLabel(listing.category)}</span>
            <span>{listing.condition}</span>
            {listing.brand && <span>{listing.brand}</span>}
            {listing.size && <span>Size {listing.size}</span>}
            {listing.is_negotiable && <span>Negotiable</span>}
          </div>

          <div className="seller-mini-card">
            <div className="avatar">
              {listing.profiles?.avatar_url ? (
                <img src={listing.profiles.avatar_url} alt={listing.profiles.username} />
              ) : (
                '👤'
              )}
            </div>

            <div>
              <Link to={`/profile/${listing.profiles?.username}`}>
                @{listing.profiles?.username}
              </Link>
              <p>
                ⭐ {listing.profiles?.rating || 5} ·{' '}
                {listing.profiles?.sales_count || 0} sales
              </p>
            </div>
          </div>

          <div className="buyer-shield">
            <strong>🛡️ Buyer Shield</strong>
            <p>
              Future buyer protection fee: 8% added to the item price. Payment
              and delivery are not active yet in this V1.
            </p>
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
              <strong>{formatPrice(total + shippingEstimate)}</strong>
            </div>
          </div>

          <div className="item-actions">
            <button className="primary-button">Buy Now</button>
            <button className="secondary-button">Make an Offer</button>
            <button className="secondary-button">Chat with seller</button>
          </div>
        </section>
      </div>

      <section className="description-section">
        <h2>Description</h2>
        <p>{listing.description}</p>

        <h2>Location</h2>
        <p>{listing.location}</p>
      </section>
    </div>
  )
}