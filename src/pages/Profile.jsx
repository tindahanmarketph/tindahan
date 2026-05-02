import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

export default function Profile() {
  const { username } = useParams()
  const { profile: currentProfile } = useAuth()

  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const isOwnProfile = currentProfile?.username === username

  useEffect(() => {
    loadProfile()
  }, [username])

  async function loadProfile() {
    setLoading(true)

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileError) {
      console.error(profileError.message)
      setProfile(null)
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: listingData, error: listingError } = await supabase
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
      .eq('seller_id', profileData.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (listingError) {
      console.error(listingError.message)
      setListings([])
    } else {
      setListings(listingData || [])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Profile not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} />
          ) : (
            '👤'
          )}
        </div>

        <div className="profile-info">
          <div className="profile-title-row">
            <h1>@{profile.username}</h1>
            {profile.is_verified && <span className="verified-badge">Verified</span>}
          </div>

          <p>{profile.bio || 'No bio yet.'}</p>

          <div className="profile-stats">
            <span>⭐ {profile.rating || 5}</span>
            <span>{profile.sales_count || 0} sales</span>
            <span>{profile.location || 'Philippines'}</span>
          </div>

          {!isOwnProfile && <button className="secondary-button">Follow</button>}
        </div>
      </section>

      <div className="feed-header">
        <div>
          <h2>{isOwnProfile ? 'Your listings' : `${profile.username}'s listings`}</h2>
          <p>{listings.length} active listing(s)</p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <h3>No active listing</h3>
          <p>This seller has not published anything yet.</p>
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