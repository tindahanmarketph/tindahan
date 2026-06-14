import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  HeartHandshake,
  Info,
  Settings,
  ShoppingCart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage wallet-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>My wallet</h1>

        <button type="button" aria-label="Settings">
          <Settings size={23} />
        </button>
      </header>

      <section className="wallet-pending-row">
        <span>Pending amount</span>

        <div>
          <strong>₱0.00</strong>
          <Info size={19} />
        </div>
      </section>

      <section className="wallet-balance-card">
        <h2>₱0.00</h2>
        <p>Available balance</p>

        <div className="wallet-actions">
          <button type="button" disabled>
            <span>
              <Building2 size={26} />
            </span>
            Transfer
          </button>

          <button type="button">
            <span>
              <ShoppingCart size={26} />
            </span>
            Buy
          </button>

          <button type="button">
            <span>
              <HeartHandshake size={26} />
            </span>
            Donate
          </button>
        </div>
      </section>

      <section className="wallet-section-list">
        <article className="wallet-list-row">
          <div>
            <strong>Initial balance</strong>
            <span>June 2026</span>
          </div>

          <strong>₱0.00</strong>
        </article>

        <button type="button" className="wallet-list-row">
          <div>
            <strong>History</strong>
          </div>

          <ChevronRight size={23} />
        </button>
      </section>

      <div className="wallet-empty-space">
        <CircleDollarSign size={48} />
      </div>
    </main>
  );
}