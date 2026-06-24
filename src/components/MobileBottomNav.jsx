import { Home, Mail, Plus, Search, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav() {
  const location = useLocation();
  const { user, profile } = useAuth();

  const profileUrl = user
    ? `/profile/${profile?.username || user?.email?.split("@")[0] || ""}`
    : "/login";

  const isProfileArea =
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/wallet") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/badges") ||
    location.pathname.startsWith("/donations") ||
    location.pathname.startsWith("/holiday-mode") ||
    location.pathname.startsWith("/bundle-discounts") ||
    location.pathname.startsWith("/personalisation") ||
    location.pathname.startsWith("/promotion-tools") ||
    location.pathname.startsWith("/tindahan-guide");

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "mobile-bottom-link active" : "mobile-bottom-link"
        }
      >
        <Home size={27} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) =>
          isActive ? "mobile-bottom-link active" : "mobile-bottom-link"
        }
      >
        <Search size={28} />
        <span>Search</span>
      </NavLink>

      <NavLink
        to="/sell"
        className={({ isActive }) =>
          isActive
            ? "mobile-bottom-link mobile-sell-link active"
            : "mobile-bottom-link mobile-sell-link"
        }
      >
        <span className="mobile-sell-circle">
          <Plus size={22} strokeWidth={3.2} />
        </span>
        <span>Sell</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          isActive ? "mobile-bottom-link active" : "mobile-bottom-link"
        }
      >
        <span className="mobile-bottom-icon-wrap">
          <Mail size={28} />
          <span className="mobile-message-dot" />
        </span>
        <span>Messages</span>
      </NavLink>

      <NavLink
        to={profileUrl}
        className={() =>
          isProfileArea ? "mobile-bottom-link active" : "mobile-bottom-link"
        }
      >
        <UserRound size={29} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}