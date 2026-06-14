import { ChevronLeft, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../context/AuthContext";
import { fetchFavoriteListings } from "../lib/favorites";

export default function Favorites() {
  const navigate = useNavigate();
  const { user, loadingAuth } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      if (loadingAuth) return;

      if (!user) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const favoriteListings = await fetchFavoriteListings(user.id);

        if (!isMounted) return;

        setFavorites(favoriteListings);
      } catch (error) {
        console.error("Favorites loading error:", error);

        if (!isMounted) return;

        setFavorites([]);
        setErrorMessage(
          error.message || "Unable to load your favorite items."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [user, loadingAuth, navigate]);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  return (
    <main className="favorites-page">
      <header className="favorites-mobile-header">
        <button type="button" onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={31} />
        </button>

        <h1>Favorites</h1>

        <Link to="/search" aria-label="Search">
          <Search size={29} />
        </Link>
      </header>

      <div className="container favorites-container">
        <div className="favorites-desktop-header">
          <h1>Favorites</h1>
          <p>Your saved items are all gathered here.</p>
        </div>

        {loading && (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="skeleton-card" key={index}>
                <div className="skeleton skeleton-img" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        )}

        {!loading && errorMessage && (
          <section className="favorites-empty-state">
            <div className="favorites-empty-icon">
              <Heart size={38} />
            </div>

            <h2>Unable to load favorites</h2>
            <p>{errorMessage}</p>
          </section>
        )}

        {!loading && !errorMessage && favorites.length === 0 && (
          <section className="favorites-empty-state">
            <div className="favorites-empty-icon">
              <Heart size={38} />
            </div>

            <h2>No favorites yet</h2>
            <p>
              Tap the heart on an item to save it here and find it again later.
            </p>

            <Link to="/" className="favorites-empty-button">
              Browse items
            </Link>
          </section>
        )}

        {!loading && !errorMessage && favorites.length > 0 && (
          <section className="favorites-grid-section">
            <div className="grid favorites-grid">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}