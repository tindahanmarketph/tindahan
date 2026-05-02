import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'
import SkeletonGrid from '../components/SkeletonGrid'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'recent'

  useEffect(() => {
    loadListings()
  }, [query, category, sort])

  async function loadListings() {
    setLoading(true)

    let request = supabase
      .from('listings')
      .select(`
        *,
        profiles (
          username,
          avatar_url,
          rating
        ),
        listing_images (
          image_url,
          sort_order
        )
      `)
      .eq('status', 'active')

    if (query) {
      request = request.ilike('title', `%${query}%`)
    }

    if (category) {
      request = request.eq('category', category)
    }

    if (sort === 'price_asc') {
      request = request.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      request = request.order('price', { ascending: false })
    } else {
      request = request.order('created_at', { ascending: false })
    }

    const { data, error } = await request

    if (error) {
      console.error(error.message)
      setListings([])
    } else {
      setListings(data || [])
    }

    setLoading(false)
  }

  function handleSortChange(event) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', event.target.value)
    setSearchParams(nextParams)
  }

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Buy and sell second-hand finds in the Philippines</h1>
          <p>
            Discover pre-loved fashion, kids items and home objects with TindaHan.
          </p>
        </div>
      </section>

      <div className="feed-header">
        <div>
          <h2>{query ? `Search results for "${query}"` : 'Latest listings'}</h2>
          <p>{listings.length} active listing(s)</p>
        </div>

        <select value={sort} onChange={handleSortChange}>
          <option value="recent">Most recent</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <h3>No result found</h3>
          <p>Try another search or category.</p>
        </div>
      ) : (
        <div className="product-grid">
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}