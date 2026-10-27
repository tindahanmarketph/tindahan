import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { INFO_PAGES, LEGAL_KEYS } from "../content";
import { LEGAL_UPDATED } from "../content/site";

export default function LegalHub() {
  const navigate = useNavigate();

  const items = [
    ...LEGAL_KEYS.map((key) => ({ key, ...INFO_PAGES[key] })),
    { key: "cookie-settings", path: "/cookie-settings", title: "Cookie settings", summary: "Choose what TindaHan can store on your device." }
  ];

  return (
    <main className="mobile-subpage info-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Legal information</h1>
        <span />
      </header>

      <article className="info-body">
        <header className="info-hero">
          <p className="info-kicker">Legal</p>
          <h2 className="info-title">Legal information</h2>
          <p className="info-summary">
            The rules and notices that apply when you use TindaHan, under the laws of the Philippines.
          </p>
          <p className="info-updated">Last updated: {LEGAL_UPDATED}</p>
        </header>

        <div className="info-related">
          <div>
            {items.map((item) => (
              <Link key={item.key} to={item.path} className="info-related-card">
                <span className="info-related-icon"><FileText size={20} /></span>
                <span>
                  <strong>{item.title}</strong>
                  {item.summary && <small>{item.summary}</small>}
                </span>
                <ChevronRight size={20} />
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
