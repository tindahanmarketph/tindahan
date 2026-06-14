import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function BundleDiscounts() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);

  return (
    <main className="mobile-subpage tindahan-simple-page tint-background">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Bundle discounts</h1>

        <span />
      </header>

      <section className="tindahan-toggle-row">
        <strong>Offer bundle discounts</strong>

        <button
          type="button"
          className={enabled ? "tindahan-switch active" : "tindahan-switch"}
          onClick={() => setEnabled((currentValue) => !currentValue)}
          aria-label="Toggle bundle discounts"
        >
          <span />
        </button>
      </section>

      <section className="tindahan-info-note">
        <p>
          Offering bundle discounts is a great way to attract buyers. Buyers are
          encouraged to purchase several items from your closet.
        </p>
      </section>
    </main>
  );
}