import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OPTIONS = [0, 5, 10, 15, 20, 25, 30];
const DEFAULTS = { enabled: false, tiers: { 2: 5, 3: 10, 5: 20 } };

function storageKey(userId) {
  return `tindahan_bundle_discounts_${userId || "guest"}`;
}

export default function BundleDiscounts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(user?.id));
      if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* valeurs par défaut */
    }
  }, [user?.id]);

  function update(next) {
    setState(next);
    try {
      localStorage.setItem(storageKey(user?.id), JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

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
          className={state.enabled ? "tindahan-switch active" : "tindahan-switch"}
          onClick={() => update({ ...state, enabled: !state.enabled })}
          aria-pressed={state.enabled}
          aria-label="Toggle bundle discounts"
        >
          <span />
        </button>
      </section>

      {state.enabled && (
        <section className="bundle-tiers" aria-label="Discount levels">
          {[2, 3, 5].map((count) => (
            <label key={count} className="bundle-tier">
              <span>{count} items</span>
              <select
                value={state.tiers[count]}
                onChange={(e) =>
                  update({ ...state, tiers: { ...state.tiers, [count]: Number(e.target.value) } })
                }
              >
                {OPTIONS.map((o) => (
                  <option key={o} value={o}>{o === 0 ? "No discount" : `${o}%`}</option>
                ))}
              </select>
            </label>
          ))}
        </section>
      )}

      <section className="tindahan-info-note">
        <p>
          Offering bundle discounts is a great way to attract buyers. Buyers are encouraged to
          purchase several items from your closet, and you save on packaging and trips to the courier.
        </p>
        <p>
          Your choices are saved on this device. Bundle prices at checkout are being rolled out
          during the beta.
        </p>
        <p role="status" className="bundle-saved">{saved ? "Saved" : ""}</p>
      </section>
    </main>
  );
}
