import { ChevronLeft, Camera, MessageCircle, Shirt, Tag, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const TIPS = [
  { icon: Camera, title: "Brighter photos", text: "Natural light and a plain background get more taps." },
  { icon: Tag, title: "A fair price", text: "Check similar items and leave room for offers." },
  { icon: MessageCircle, title: "Quick replies", text: "Buyers often choose the fastest seller." },
  { icon: Shirt, title: "Bundle discounts", text: "Encourage buyers to take several items." }
];

export default function PromotionTools() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage promotion-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Promote your listings</h1>
        <span />
      </header>

      <section className="promotion-card">
        <div>
          <strong>Boost your items</strong>
          <p>
            Promote an item and reach more buyers. Boosts are <strong>coming soon</strong>, with
            clear prices and results before you pay.
          </p>
        </div>
        <div className="promotion-illustration">
          <TrendingUp size={34} />
          <Shirt size={33} />
        </div>
      </section>

      <section className="promotion-tips">
        <h2>Sell faster today, for free</h2>
        {TIPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="promotion-tip">
            <span><Icon size={21} /></span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
        <Link to="/tindahan-guide/sell-faster" className="promotion-link">
          Read: How can I sell faster?
        </Link>
      </section>
    </main>
  );
}
