import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { Blocks, Inline } from "../components/InfoContent";
import { INFO_PAGES } from "../content";
import { CONTACT_EMAIL } from "../content/site";

/* Page d'information générique : conditions, confidentialité, À propos, etc. */
export default function InfoPage({ pageKey }) {
  const page = INFO_PAGES[pageKey];
  const navigate = useNavigate();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pageKey, hash]);

  if (!page) return null;

  const sections = page.sections || [];
  const related = (page.related || []).map((key) => ({ key, ...INFO_PAGES[key] })).filter((r) => r.path);

  return (
    <main className="mobile-subpage info-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>{page.title}</h1>
        <span />
      </header>

      <article className="info-body">
        <header className="info-hero">
          {page.kicker && <p className="info-kicker">{page.kicker}</p>}
          <h2 className="info-title">{page.title}</h2>
          {page.summary && <p className="info-summary">{page.summary}</p>}
          {page.updated && <p className="info-updated">Last updated: {page.updated}</p>}
        </header>

        {sections.length >= 4 && (
          <nav className="info-toc" aria-label="On this page">
            <strong>On this page</strong>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title.replace(/^\d+\.\s*/, "")}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="info-section">
            <h2>{s.title}</h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}

        {related.length > 0 && (
          <section className="info-related" aria-label="Related pages">
            <h2>Related</h2>
            <div>
              {related.map((r) => (
                <Link key={r.key} to={r.path} className="info-related-card">
                  <span>
                    <strong>{r.title}</strong>
                    {r.summary && <small>{r.summary}</small>}
                  </span>
                  <ChevronRight size={20} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <aside className="info-contact">
          <Mail size={22} aria-hidden="true" />
          <p>
            <Inline text={`Questions? Write to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) or visit the [Help Center](/help-center).`} />
          </p>
        </aside>
      </article>
    </main>
  );
}
