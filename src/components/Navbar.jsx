import {
  Bell,
  Camera,
  ChevronDown,
  HelpCircle,
  LogOut,
  Mail,
  Search,
  UserRound
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
import { useNotifications } from "../lib/notifications";
import { useUnreadMessages } from "../lib/unreadMessages";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const notifications = useNotifications(user?.id);
  const unreadMessages = useUnreadMessages(user?.id);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
        <Link to="/" className="navbar-logo" aria-label="TindaHan">
          <BrandLogo variant="horizontal" height={36} />
        </Link>

        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <button className="search-type-button" type="button">
            Items
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
            <>
              <Link
                className="navbar-icon-link"
                to="/messages"
                aria-label="Messages"
                title="Messages"
              >
                <Mail size={21} />
                {unreadMessages > 0 && (
                  <span className="navbar-notification-count" data-testid="navbar-message-count">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>

              <div className="navbar-notifications" ref={notificationsRef}>
                <button
                  className={`navbar-icon-link navbar-notification-button ${
                    notificationsOpen ? "active" : ""
                  }`}
                  type="button"
                  aria-label="Notifications"
                  title="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => {
                    if (notificationsOpen) notifications.markAllRead();
                    setNotificationsOpen((currentValue) => !currentValue);
                  }}
                >
                  <Bell size={21} />
                  {notifications.unread > 0 && (
                    <span className="navbar-notification-count" data-testid="notif-count">
                      {notifications.unread > 9 ? "9+" : notifications.unread}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notifications-popover">
                    {notifications.items.length === 0 ? (
                      <div className="notifications-empty">
                        <div className="notifications-empty-icon">
                          <Bell size={42} />
                        </div>

                        <strong>
                          You don&apos;t have notifications for now
                        </strong>
                      </div>
                    ) : (
                      <ul className="notifications-list" data-testid="notif-list">
                        {notifications.items.map((item) => (
                          <li key={item.id} className={notifications.isRead(item) ? "" : "unread"}>
                            <button
                              type="button"
                              onClick={() => {
                                notifications.markAllRead();
                                setNotificationsOpen(false);
                                if (item.link) navigate(item.link);
                              }}
                            >
                              <strong>{item.title}</strong>
                              {item.body && <span>{item.body}</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {user ? (
            <>
              <Link
                className="navbar-account-link"
                to={`/profile/${
                  profile?.username || user?.email?.split("@")[0] || ""
                }`}
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

          <button
            className="navbar-help-button"
            type="button"
            aria-label="Help Center"
            title="Help Center"
            onClick={() => navigate("/help-center")}
          >
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