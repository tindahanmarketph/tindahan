import { Link, useNavigate } from "react-router-dom";
import {
  Award, ChevronLeft, ChevronRight, HeartHandshake, LifeBuoy, Megaphone, Plane, ReceiptText,
  Settings, SlidersHorizontal, Wallet, WalletCards
} from "lucide-react";

const TOOLS = [
  { to: "/orders", icon: ReceiptText, title: "My sales and purchases", text: "Track orders, labels and refunds" },
  { to: "/wallet", icon: Wallet, title: "My wallet", text: "Balance, refunds and payouts" },
  { to: "/promotion-tools", icon: Megaphone, title: "Promotion tools", text: "Reach more buyers" },
  { to: "/bundle-discounts", icon: WalletCards, title: "Bundle discounts", text: "Sell several items at once" },
  { to: "/holiday-mode", icon: Plane, title: "Holiday mode", text: "Pause your closet while away" },
  { to: "/badges", icon: Award, title: "Badges", text: "Show you are reliable" },
  { to: "/personalisation", icon: SlidersHorizontal, title: "Personalisation", text: "Sizes, brands and members" },
  { to: "/donations", icon: HeartHandshake, title: "Donations", text: "Give part of your earnings" },
  { to: "/settings/profile", icon: Settings, title: "Settings", text: "Profile, address, privacy" },
  { to: "/help-center", icon: LifeBuoy, title: "Help Center", text: "Answers and contact" }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage info-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Dashboard</h1>
        <span />
      </header>

      <div className="info-body">
        <header className="info-hero">
          <p className="info-kicker">Your TindaHan</p>
          <h2 className="info-title">Dashboard</h2>
          <p className="info-summary">All your selling and account tools in one place.</p>
        </header>

        <div className="info-related">
          <div>
            {TOOLS.map(({ to, icon: Icon, title, text }) => (
              <Link key={to} to={to} className="info-related-card">
                <span className="info-related-icon"><Icon size={20} /></span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
                <ChevronRight size={20} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
