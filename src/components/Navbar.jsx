import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')

  function handleSubmit(event) {
    event.preventDefault()

    const value = search.trim()

    if (!value) {
      navigate('/')
      return
    }

    navigate(`/?q=${encodeURIComponent(value)}`)
  }

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="logo">
          <span className="logo-mark">T</span>
          <span>TindaHan</span>
        </Link>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for Nike, bags, shirts..."
          />
        </form>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/sell" className="sell-button">
                Sell
              </Link>

              {profile && (
                <Link to={`/profile/${profile.username}`} className="icon-button">
                  👤
                </Link>
              )}

              <button className="text-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-button">
                Login
              </Link>
              <Link to="/register" className="sell-button">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}