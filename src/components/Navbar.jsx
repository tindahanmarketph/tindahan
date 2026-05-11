import {
  Camera,
  ChevronDown,
  HelpCircle,
  LogOut,
  Mail,
  Search,
  UserRound
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, logout } = useAuth();

  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  function handleSearchSubmit(e) {
    e.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      navigate("/");
      return;
    }

    navigate(`/?q=${encodeURIComponent(cleanQuery)}`);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Unable to log out.");
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          TindaHan
        </Link>

        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <button className="search-type-button" type="button">
            Articles
            <ChevronDown size={16} />
          </button>

          <div className="search-input-wrapper">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search for items"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <button
            className="search-camera-button"
            type="button"
            aria-label="Search by image"
          >
            <Camera size={19} />
          </button>
        </form>

        <nav className="navbar-actions">
          {user && (
            <Link
              className="navbar-icon-link"
              to="/messages"
              aria-label="Messages"
              title="Messages"
            >
              <Mail size={21} />
            </Link>
          )}

          {user ? (
            <>
              <Link
                className="navbar-account-link"
                to={`/profile/${profile?.username || user?.email?.split("@")[0] || ""}`}
              >
                <UserRound size={17} />
                <span>{profile?.username || "Profile"}</span>
              </Link>

              <button
                className="navbar-login-button"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="navbar-auth-box">
              <Link to="/register">Sign up</Link>
              <span>|</span>
              <Link to="/login">Log in</Link>
            </div>
          )}

          <Link to="/sell" className="navbar-sell-button">
            Sell your items
          </Link>

          <button className="navbar-help-button" type="button" aria-label="Help">
            <HelpCircle size={22} />
          </button>

          <button className="navbar-language-button" type="button">
            EN
            <ChevronDown size={15} />
          </button>
        </nav>
      </div>
    </header>
  );
}