import { Cookie } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useConsent } from "../lib/consent";

export default function CookieBanner() {
  const { decided, save } = useConsent();
  const { pathname } = useLocation();

  if (decided || pathname === "/cookie-settings") return null;

  return (
    <aside className="cookie-banner" role="dialog" aria-label="Cookie choices" aria-live="polite">
      <div className="cookie-banner-text">
        <Cookie size={22} aria-hidden="true" />
        <p>
          TindaHan stores only what it needs to run (log in, security, your choices). No ads, no
          tracking. <Link to="/cookies">Cookie Policy</Link>
        </p>
      </div>

      <div className="cookie-banner-actions">
        <button
          type="button"
          className="cookie-btn primary"
          onClick={() => save({ preferences: true, analytics: true, marketing: true })}
        >
          Accept all
        </button>
        <button type="button" className="cookie-btn" onClick={() => save({})}>
          Essential only
        </button>
        <Link className="cookie-link" to="/cookie-settings">
          Settings
        </Link>
      </div>
    </aside>
  );
}
