import { useEffect, useState } from "react";
import {
  Building2, ChevronLeft, ChevronRight, CircleDollarSign, HeartHandshake, Info, Settings, ShoppingCart
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loadWalletSummary } from "../lib/walletData";

const peso = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" });
};

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPendingInfo, setShowPendingInfo] = useState(false);
  const [state, setState] = useState({ loading: true, error: false, pending: 0, available: 0, history: [] });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }

      try {
        const summary = await loadWalletSummary(user.id);
        if (!cancelled) setState({ loading: false, error: false, ...summary });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: true }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <main className="mobile-subpage wallet-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>My wallet</h1>
        <button type="button" aria-label="Payment settings" onClick={() => navigate("/settings/payments")}>
          <Settings size={23} />
        </button>
      </header>

      <section className="wallet-pending-row">
        <span>Pending amount</span>
        <div>
          <strong>{peso(state.pending)}</strong>
          <button
            type="button"
            className="wallet-info-button"
            aria-label="What is the pending amount?"
            aria-expanded={showPendingInfo}
            onClick={() => setShowPendingInfo((v) => !v)}
          >
            <Info size={19} />
          </button>
        </div>
      </section>

      {showPendingInfo && (
        <p className="wallet-info-note" role="status">
          Money from your sales that are not completed yet. It becomes available once the order is completed.
        </p>
      )}

      <section className="wallet-balance-card">
        <h2>{state.loading ? "…" : peso(state.available)}</h2>
        <p>Available balance</p>

        <div className="wallet-actions">
          <button type="button" disabled title="Payouts to GCash, Maya or a bank account are coming soon">
            <span><Building2 size={26} /></span>
            Transfer
          </button>
          <button type="button" onClick={() => navigate("/")}>
            <span><ShoppingCart size={26} /></span>
            Buy
          </button>
          <button type="button" onClick={() => navigate("/donations")}>
            <span><HeartHandshake size={26} /></span>
            Donate
          </button>
        </div>
      </section>

      <section className="wallet-section-list">
        {state.history.map((entry) => (
          <article className="wallet-list-row" key={entry.id}>
            <div>
              <strong>{entry.title}</strong>
              <span>{formatDate(entry.date)}</span>
            </div>
            <strong className="wallet-amount-in">+{peso(entry.amount)}</strong>
          </article>
        ))}

        <article className="wallet-list-row">
          <div>
            <strong>Initial balance</strong>
            <span>June 2026</span>
          </div>
          <strong>₱0.00</strong>
        </article>

        {state.error && (
          <p className="wallet-info-note">We could not load your sales right now. Please try again later.</p>
        )}
      </section>

      <section className="wallet-about" aria-label="How the wallet works">
        <h2>How your wallet works</h2>
        <ul>
          <li><strong>Sales:</strong> when an order is completed, your earnings are added here. Selling costs 0% in fees.</li>
          <li><strong>Refunds:</strong> approved refunds are returned to the buyer.</li>
          <li><strong>Transfer:</strong> payouts to <strong>GCash, Maya or a bank account</strong> are coming soon.</li>
        </ul>
        <p>
          During the beta, your balance is calculated from your completed sales. Learn more in{" "}
          <Link to="/tindahan-guide/how-wallet-works">How does the wallet work?</Link>
        </p>
      </section>

      <div className="wallet-empty-space">
        <CircleDollarSign size={48} />
      </div>
    </main>
  );
}
