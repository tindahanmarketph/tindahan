import { ChevronLeft, Info, Shirt, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Badges() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage tindahan-badges-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Badges</h1>

        <span />
      </header>

      <section className="tindahan-badge-card">
        <div className="tindahan-badge-icon">
          <Shirt size={30} />
        </div>

        <div className="tindahan-badge-content">
          <h2>It’s a good start!</h2>
          <p>
            List 5 items within 30 days to earn the Active Publisher badge.
          </p>

          <Link to="/sell" className="tindahan-primary-wide">
            List an item
          </Link>
        </div>

        <button
          type="button"
          className="tindahan-info-button"
          aria-label="More information"
        >
          <Info size={20} />
        </button>
      </section>

      <section className="tindahan-badge-card">
        <div className="tindahan-badge-icon">
          <Truck size={30} />
        </div>

        <div className="tindahan-badge-content">
          <h2>Ready for the Fast Shipping badge?</h2>
          <p>
            Ship the items you sell within the next 24 hours so this badge can
            be visible to buyers.
          </p>
        </div>

        <button
          type="button"
          className="tindahan-info-button"
          aria-label="More information"
        >
          <Info size={20} />
        </button>
      </section>
    </main>
  );
}