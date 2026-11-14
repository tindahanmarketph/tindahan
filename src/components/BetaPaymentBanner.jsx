import { FlaskConical } from "lucide-react";
import { PAYMENTS_SIMULATED } from "../lib/featureFlags";

/* Bannière « Beta – paiement simulé » (cahier L2.1, décision D6). */
export default function BetaPaymentBanner({ compact = false }) {
  if (!PAYMENTS_SIMULATED) return null;

  return (
    <div
      className={`beta-payment-banner ${compact ? "compact" : ""}`}
      role="note"
      data-testid="beta-payment-banner"
    >
      <FlaskConical size={compact ? 15 : 18} aria-hidden="true" />
      <p>
        <strong>Beta – simulated payment.</strong> No real money is charged or
        paid out during the beta test.
      </p>
    </div>
  );
}
