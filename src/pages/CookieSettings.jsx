import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useConsent } from "../lib/consent";

const ROWS = [
  { key: "necessary", title: "Essential", text: "Needed to run TindaHan: log in, security, your orders and your choices (like dark mode). Always on.", locked: true },
  { key: "preferences", title: "Preferences", text: "Remembers things like recently viewed items and filters on this device." },
  { key: "analytics", title: "Analytics", text: "Would help us understand how TindaHan is used. We do not use analytics today." },
  { key: "marketing", title: "Marketing", text: "Would be used to measure or show promotions. We do not use it today." }
];

export default function CookieSettings() {
  const navigate = useNavigate();
  const { consent, save } = useConsent();
  const [values, setValues] = useState({ necessary: true, preferences: false, analytics: false, marketing: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (consent) {
      setValues({
        necessary: true,
        preferences: Boolean(consent.preferences),
        analytics: Boolean(consent.analytics),
        marketing: Boolean(consent.marketing)
      });
    }
  }, [consent]);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <main className="mobile-subpage info-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Cookie settings</h1>
        <span />
      </header>

      <div className="info-body">
        <header className="info-hero">
          <p className="info-kicker">Legal</p>
          <h2 className="info-title">Cookie settings</h2>
          <p className="info-summary">
            Choose what TindaHan can store on your device. Read the <Link to="/cookies">Cookie Policy</Link> to see exactly what we store.
          </p>
        </header>

        <div className="cookie-rows">
          {ROWS.map((row) => (
            <div key={row.key} className="cookie-row">
              <div>
                <strong>{row.title}</strong>
                <p>{row.text}</p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${values[row.key] ? "active" : ""}`}
                aria-pressed={values[row.key]}
                aria-label={`${row.title} ${values[row.key] ? "on" : "off"}`}
                disabled={row.locked}
                onClick={() => setValues((v) => ({ ...v, [row.key]: !v[row.key] }))}
              >
                <span />
              </button>
            </div>
          ))}
        </div>

        <div className="cookie-actions">
          <button type="button" className="info-btn primary" onClick={() => { save(values); flash(); }}>
            Save my choices
          </button>
          <button
            type="button"
            className="info-btn"
            onClick={() => { const all = { preferences: true, analytics: true, marketing: true }; setValues({ necessary: true, ...all }); save(all); flash(); }}
          >
            Accept all
          </button>
          <button
            type="button"
            className="info-btn"
            onClick={() => { setValues({ necessary: true, preferences: false, analytics: false, marketing: false }); save({}); flash(); }}
          >
            Essential only
          </button>
        </div>

        <p className="info-updated" role="status">
          {saved
            ? "Saved. You can change your choices at any time."
            : consent?.savedAt
            ? `Last saved: ${new Date(consent.savedAt).toLocaleDateString("en-PH", { dateStyle: "long" })}.`
            : "You have not made a choice yet. Only essential storage is used."}
        </p>
      </div>
    </main>
  );
}
