import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ChevronRight,
  CircleHelp,
  Cookie,
  FileText,
  Gift,
  Heart,
  HomeIcon,
  Info,
  MapPin,
  Megaphone,
  Palette,
  Pencil,
  Plane,
  ReceiptText,
  Settings,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Star,
  Truck,
  Wallet,
  WalletCards
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ListingCard from "../components/ListingCard";
import { supabase } from "../lib/supabase";

function getInitial(username) {
  return username?.trim()?.charAt(0)?.toUpperCase() || "U";
}

function getLastSeenText(profile) {
  if (profile?.last_seen_at) {
    const lastSeen = new Date(profile.last_seen_at);
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return "Online now";
    if (diffMinutes < 60) return `Online ${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Online ${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `Online ${diffDays} days ago`;
  }

  return "Online recently";
}

function getProfileLocation(profile) {
  if (!profile) return "Philippines";

  if (profile.show_city && profile.city) {
    return `${profile.city}, ${profile.country || "Philippines"}`;
  }

  return profile.country || profile.location || "Philippines";
}

async function fetchUserListings(profileId) {
  const columnsToTry = ["seller_id", "user_id", "profile_id"];

  for (const column of columnsToTry) {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        profiles (
          id,
          username,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .eq(column, profileId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error) {
      return data || [];
    }
  }

  return [];
}

function MobileProfileMenuItem({
  icon,
  title,
  subtitle,
  value,
  to = "#",
  disabled = false
}) {
  const content = (
    <>
      <span className="mobile-profile-menu-icon">{icon}</span>

      <span className="mobile-profile-menu-main">
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>

      {value && <span className="mobile-profile-menu-value">{value}</span>}

      <ChevronRight size={22} className="mobile-profile-menu-chevron" />
    </>
  );

  if (disabled) {
    return <div className="mobile-profile-menu-item disabled">{content}</div>;
  }

  return (
    <Link to={to} className="mobile-profile-menu-item">
      {content}
    </Link>
  );
}

function MobileProfileDashboard({
  displayedUsername,
  displayedAvatar
}) {
  return (
    <section className="mobile-profile-dashboard">
      <header className="mobile-profile-header">
        <h1>Profile</h1>
      </header>

      <div className="mobile-profile-content">
        <Link
          to={`/profile/${displayedUsername}#profile-listings`}
          className="mobile-profile-user-card"
        >
          <div className="mobile-profile-avatar">
            {displayedAvatar ? (
              <img src={displayedAvatar} alt={`${displayedUsername} profile`} />
            ) : (
              getInitial(displayedUsername)
            )}
          </div>

          <div>
            <strong>{displayedUsername}</strong>
            <span>View my listings</span>
          </div>
        </Link>

        <Link to="/badges" className="mobile-profile-badges-card">
          <div className="mobile-profile-badges-row">
            <div>
              <BadgeCheck size={28} />
              <strong>Badges earned</strong>
            </div>

            <span>0 of 2</span>
          </div>

          <div className="mobile-profile-progress">
            <span />
          </div>
        </Link>
      </div>

      <div className="mobile-profile-section">
        <MobileProfileMenuItem
          icon={<Heart size={29} />}
          title="Favorites"
          to="/favorites"
        />
      </div>

      <div className="mobile-profile-section">
        <MobileProfileMenuItem
          icon={<Gift size={28} />}
          title="Invite friends"
          subtitle="Share TindaHan with your friends"
          to="/invite"
        />

        <MobileProfileMenuItem
          icon={<Wallet size={28} />}
          title="My wallet"
          value="₱0.00"
          to="/wallet"
        />

        <MobileProfileMenuItem
          icon={<ReceiptText size={28} />}
          title="My sales and purchases"
          to="/orders"
        />

        <MobileProfileMenuItem
          icon={<Megaphone size={28} />}
          title="Promotion tools"
          to="/promotion-tools"
        />
      </div>

      <div className="mobile-profile-section">
        <MobileProfileMenuItem
          icon={<SlidersHorizontal size={28} />}
          title="Personalisation"
          to="/personalisation"
        />

        <MobileProfileMenuItem
          icon={<WalletCards size={28} />}
          title="Bundle discounts"
          value="Disabled"
          to="/bundle-discounts"
        />

        <MobileProfileMenuItem
          icon={<Plane size={28} />}
          title="Holiday mode"
          to="/holiday-mode"
        />
      </div>

      <div className="mobile-profile-section">
        <MobileProfileMenuItem
          icon={<CircleHelp size={29} />}
          title="TindaHan Guide"
          to="/tindahan-guide"
        />

        <MobileProfileMenuItem
          icon={<ShieldCheck size={29} />}
          title="Help Center"
          to="/help-center"
        />
      </div>

      <div className="mobile-profile-section">
        <MobileProfileMenuItem
          icon={<Settings size={29} />}
          title="Settings"
          to="/settings/profile"
        />

        <MobileProfileMenuItem
          icon={<Cookie size={29} />}
          title="Cookie settings"
          to="/cookie-settings"
        />

        <MobileProfileMenuItem
          icon={<Info size={29} />}
          title="About us"
          to="/about"
        />

        <MobileProfileMenuItem
          icon={<FileText size={29} />}
          title="Legal information"
          to="/terms"
        />

        <MobileProfileMenuItem
          icon={<HomeIcon size={29} />}
          title="Our platform"
          to="/platform"
        />
      </div>

      <footer className="mobile-profile-footer-links">
        <Link to="/privacy">Protection Center</Link>
        <span>•</span>
        <Link to="/terms">Terms</Link>
        <span>•</span>
        <Link to="/cookies">Cookie Policy</Link>
      </footer>
    </section>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = useMemo(() => {
    if (!user || !profile) return false;
    return user.id === profile.id;
  }, [user, profile]);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const cleanUsername = username?.trim();

      let profileData = null;
      let profileError = null;

      const usernameResponse = await supabase
        .from("profiles")
        .select("*")
        .eq("username", cleanUsername)
        .maybeSingle();

      profileData = usernameResponse.data;
      profileError = usernameResponse.error;

      if (!profileData && user?.id) {
        const idResponse = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        profileData = idResponse.data;
        profileError = idResponse.error;
      }

      if (profileError || !profileData) {
        console.error("Profile loading error:", profileError?.message);
        setProfile(null);
        setListings([]);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const userListings = await fetchUserListings(profileData.id);
      setListings(userListings);

      setLoading(false);
    }

    loadProfile();
  }, [username, user?.id]);

  if (loading) {
    return (
      <main className="profile-page page">
        <div className="container">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page page">
        <div className="container">
          <div className="empty-state">
            <h2>Profile not found</h2>
            <p>This user does not exist or is no longer available.</p>
          </div>
        </div>
      </main>
    );
  }

  const displayedUsername = profile.username || "username";
  const displayedBio = profile.bio || "";
  const displayedAvatar = profile.avatar_url || "";
  const displayedLocation = getProfileLocation(profile);

  return (
    <main className={isOwnProfile ? "profile-page own-profile-page" : "profile-page"}>
      {isOwnProfile && (
        <MobileProfileDashboard
          displayedUsername={displayedUsername}
          displayedAvatar={displayedAvatar}
        />
      )}

      <div className="container profile-container">
        <section className="profile-overview">
          <div className="profile-avatar-wrap">
            {displayedAvatar ? (
              <img
                src={displayedAvatar}
                alt={`${displayedUsername} profile`}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder">
                {getInitial(displayedUsername)}
              </div>
            )}
          </div>

          <div className="profile-main-info">
            <div className="profile-name-row">
              <div>
                <h1>{displayedUsername}</h1>
                <p>No reviews yet</p>

                {displayedBio && <p className="profile-bio">{displayedBio}</p>}
              </div>

              {isOwnProfile && (
                <Link to="/settings/profile" className="profile-edit-button">
                  <Pencil size={18} />
                  Edit profile
                </Link>
              )}
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-block">
                <span className="profile-info-label">About:</span>

                <div className="profile-meta-line">
                  <MapPin size={18} />
                  <span>{displayedLocation}</span>
                </div>

                <div className="profile-meta-line">
                  <ShieldCheck size={18} />
                  <span>{getLastSeenText(profile)}</span>
                </div>

                <div className="profile-meta-line">
                  <Palette size={18} />

                  <Link to={`/profile/${displayedUsername}/followers`}>
                    0 followers
                  </Link>

                  <span>,</span>

                  <Link to={`/profile/${displayedUsername}/following`}>
                    0 following
                  </Link>
                </div>
              </div>

              <div className="profile-info-block">
                <span className="profile-info-label">Verified information:</span>

                <div className="profile-meta-line">
                  <ShieldCheck size={18} />
                  <span>Google</span>
                </div>

                <div className="profile-meta-line">
                  <ShieldCheck size={18} />
                  <span>Email</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="profile-tabs">
          <button type="button" className="profile-tab active">
            Listings
          </button>

          <button type="button" className="profile-tab">
            Reviews
          </button>
        </section>

        <section className="profile-badges">
          <article className="profile-badge-card">
            <div className="profile-badge-icon">
              <Shirt size={28} />
            </div>

            <div>
              <h3>It’s a good start!</h3>
              <p>
                Upload 5 items within 30 days to earn the Active Publisher badge.
              </p>
            </div>

            <Info className="profile-badge-info" size={21} />
          </article>

          <article className="profile-badge-card">
            <div className="profile-badge-icon">
              <Truck size={28} />
            </div>

            <div>
              <h3>Ready for the Fast Shipping badge?</h3>
              <p>
                Ship the items you sell within the next 24 hours so this badge
                can be visible to buyers.
              </p>
            </div>

            <Info className="profile-badge-info" size={21} />
          </article>
        </section>

        {listings.length > 0 ? (
          <section className="profile-listings-section" id="profile-listings">
            <div className="profile-section-header">
              <h2>
                {listings.length} listed item{listings.length > 1 ? "s" : ""}
              </h2>
            </div>

            <div className="grid">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        ) : (
          <section className="profile-empty-listings" id="profile-listings">
            <div className="profile-empty-icon">
              <Shirt size={44} />
            </div>

            <h2>Add items to start selling</h2>
            <p>Declutter your closet and sell what you no longer use.</p>

            <Link to="/sell" className="profile-empty-button">
              Add an item
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}