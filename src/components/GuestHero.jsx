import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestHero() {
  const { user, loadingAuth } = useAuth();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q");
  const category = searchParams.get("category");

  const isFilteredPage = query || (category && category !== "all");

  if (loadingAuth) return null;
  if (user) return null;
  if (isFilteredPage) return null;

  return (
    <section className="guest-hero">
      <div className="guest-hero-background" />

      <div className="guest-hero-content">
        <div className="guest-hero-card">
          <h2>Ready to clean out your closet?</h2>

          <Link to="/sell" className="guest-hero-primary">
            Start selling
          </Link>

          <Link to="/how-it-works" className="guest-hero-secondary">
            Discover how it works
            </Link>
        </div>
      </div>
    </section>
  );
}