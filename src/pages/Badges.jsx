import { useEffect, useState } from "react";
import { Award, BadgeCheck, ChevronLeft, MessageCircle, Shirt, Truck, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { evaluateBadges, loadBadgeStats } from "../lib/walletData";

const ICONS = { publisher: Shirt, shipping: Truck, trusted: Award, verified: BadgeCheck, community: Users };

export default function Badges() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState(() => evaluateBadges({ listings: 0, shipped: 0, completedSales: 0, rating: 0, phoneVerified: false, invites: 0 }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadBadgeStats(user?.id, profile).then((stats) => {
      if (!cancelled) {
        setBadges(evaluateBadges(stats));
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id, profile]);

  const earned = badges.filter((b) => b.earned).length;

  return (
    <main className="mobile-subpage tindahan-badges-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Badges</h1>
        <span />
      </header>

      <p className="badge-summary" role="status">
        {loading ? "Loading your progress…" : `${earned} of ${badges.length} badges earned`}
      </p>

      {badges.map((badge) => {
        const Icon = ICONS[badge.id] || MessageCircle;
        const percent = Math.min(100, Math.round((badge.now / badge.goal) * 100));

        return (
          <section className={`tindahan-badge-card ${badge.earned ? "badge-earned" : ""}`} key={badge.id}>
            <div className="tindahan-badge-icon"><Icon size={30} /></div>

            <div className="tindahan-badge-content">
              <h2>{badge.title} {badge.earned && <span className="badge-earned-pill">Earned</span>}</h2>
              <p>{badge.text}</p>

              <div className="badge-progress" aria-label={`${percent}% complete`}>
                <span style={{ width: `${percent}%` }} />
              </div>
              <small>{Math.min(badge.now, badge.goal)} of {badge.goal}</small>

              {!badge.earned && (
                <Link to={badge.cta.to} className="tindahan-primary-wide">{badge.cta.label}</Link>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
