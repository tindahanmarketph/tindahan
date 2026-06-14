import { ChevronLeft, Shirt, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PromotionTools() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Close">
          <X size={25} />
        </button>

        <h1>Promote your listings</h1>

        <span />
      </header>

      <section className="promotion-card">
        <div>
          <strong>Boost your items</strong>
          <p>Promote an item and reach more buyers. Track your stats easily.</p>
        </div>

        <div className="promotion-illustration">
          <TrendingUp size={34} />
          <Shirt size={33} />
        </div>
      </section>
    </main>
  );
}