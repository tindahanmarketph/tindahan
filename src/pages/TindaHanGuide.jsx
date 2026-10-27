import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GUIDE_ITEMS } from "../content/help";

export default function TindaHanGuide() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage tindahan-guide-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>TindaHan Guide</h1>
        <span />
      </header>

      <section className="tindahan-guide-list">
        {GUIDE_ITEMS.map((item) => (
          <Link key={item.slug} to={`/tindahan-guide/${item.slug}`} className="tindahan-guide-row">
            <span>{item.label}</span>
            <ChevronRight size={23} />
          </Link>
        ))}

        <Link to="/help-center" className="tindahan-guide-row">
          <span>More answers in the Help Center</span>
          <ChevronRight size={23} />
        </Link>
      </section>
    </main>
  );
}
