import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Donations() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage tindahan-simple-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Donations</h1>

        <span />
      </header>

      <section className="tindahan-donations-block">
        <h2>Regular donations</h2>

        <p>
          Donate part of your earnings when you sell on TindaHan. Support local
          initiatives and help build a safer, more responsible marketplace.
          <button type="button">Learn more</button>
        </p>

        <button className="tindahan-primary-wide" type="button">
          Set up regular donations
        </button>
      </section>
    </main>
  );
}