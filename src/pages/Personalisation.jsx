import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Personalisation() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage mobile-personalisation-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Personalisation</h1>

        <button type="button" aria-label="Information">
          <Info size={23} />
        </button>
      </header>

      <section className="mobile-subpage-intro">
        <h2>Personalise your feed</h2>
        <p>Select your sizes, brands and members you want to follow.</p>
      </section>

      <section className="mobile-settings-list">
        <Link to="/personalisation/sizes" className="mobile-settings-row">
          <span>Categories and sizes</span>
          <ChevronRight size={23} />
        </Link>

        <Link to="/personalisation/brands" className="mobile-settings-row">
          <span>Brands</span>
          <ChevronRight size={23} />
        </Link>

        <Link to="/personalisation/members" className="mobile-settings-row">
          <span>Members</span>
          <ChevronRight size={23} />
        </Link>
      </section>
    </main>
  );
}