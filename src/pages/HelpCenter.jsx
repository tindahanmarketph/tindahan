import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Mail, Rocket, Search, ShieldCheck, ShoppingBag, Tag, Truck, UserRound, Wallet
} from "lucide-react";
import { Blocks, Inline } from "../components/InfoContent";
import { GUIDE_ITEMS, HELP_ARTICLES, HELP_CATEGORIES, getArticle } from "../content/help";
import { CONTACT_EMAIL, SOCIAL } from "../content/site";

const ICONS = { Rocket, ShoppingBag, Tag, Truck, Wallet, ShieldCheck, UserRound };

function HelpHeader({ title, onBack }) {
  return (
    <header className="mobile-subpage-header">
      <button type="button" onClick={onBack} aria-label="Go back">
        <ChevronLeft size={27} />
      </button>
      <h1>{title}</h1>
      <span />
    </header>
  );
}

function ArticleRow({ article, to }) {
  return (
    <Link to={to || `/help-center/${article.slug}`} className="help-article-row">
      <span>{article.q}</span>
      <ChevronRight size={20} />
    </Link>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;

    return HELP_ARTICLES.filter((a) => {
      const body = JSON.stringify(a.a).toLowerCase();
      return a.q.toLowerCase().includes(q) || body.includes(q);
    });
  }, [query]);

  const popular = GUIDE_ITEMS.slice(0, 6).map((g) => getArticle(g.slug)).filter(Boolean);

  return (
    <main className="mobile-subpage info-page help-page">
      <HelpHeader title="Help Center" onBack={() => navigate(-1)} />

      <div className="info-body">
        <header className="info-hero">
          <p className="info-kicker">Help</p>
          <h2 className="info-title">How can we help?</h2>
          <label className="help-search">
            <Search size={20} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search: shipping, GCash, refund…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the Help Center"
            />
          </label>
        </header>

        {results ? (
          <section className="info-section">
            <h2>{results.length} result{results.length === 1 ? "" : "s"}</h2>
            {results.length === 0 ? (
              <p>
                We could not find that. Try other words, or write to{" "}
                <Inline text={`[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`} />.
              </p>
            ) : (
              <div className="help-list">
                {results.map((a) => (
                  <ArticleRow key={a.slug} article={a} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="help-categories" aria-label="Topics">
              {HELP_CATEGORIES.map((c) => {
                const Icon = ICONS[c.icon] || Tag;
                return (
                  <Link key={c.id} to={`/help-center/topic/${c.id}`} className="help-category-card">
                    <span className="help-category-icon"><Icon size={22} /></span>
                    <span>
                      <strong>{c.title}</strong>
                      <small>{c.blurb}</small>
                    </span>
                  </Link>
                );
              })}
            </section>

            <section className="info-section">
              <h2>Popular questions</h2>
              <div className="help-list">
                {popular.map((a) => (
                  <ArticleRow key={a.slug} article={a} />
                ))}
              </div>
            </section>

            <aside className="info-contact info-contact-large">
              <Mail size={24} aria-hidden="true" />
              <div>
                <strong>Still need help?</strong>
                <p>
                  <Inline text={`Write to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). You can also reach us on [Instagram](${SOCIAL.instagram}) or [Facebook](${SOCIAL.facebook}).`} />
                </p>
              </div>
            </aside>
          </>
        )}
      </div>
    </main>
  );
}

export function HelpTopic() {
  const { cat } = useParams();
  const navigate = useNavigate();
  const category = HELP_CATEGORIES.find((c) => c.id === cat);

  if (!category) return <Navigate to="/help-center" replace />;

  const articles = HELP_ARTICLES.filter((a) => a.cat === cat);

  return (
    <main className="mobile-subpage info-page help-page">
      <HelpHeader title={category.title} onBack={() => navigate("/help-center")} />

      <div className="info-body">
        <header className="info-hero">
          <p className="info-kicker"><Link to="/help-center">Help Center</Link></p>
          <h2 className="info-title">{category.title}</h2>
          <p className="info-summary">{category.blurb}</p>
        </header>

        <div className="help-list">
          {articles.map((a) => (
            <ArticleRow key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function HelpArticle({ backTo = "/help-center", headerTitle = "Help Center" }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = getArticle(slug);

  if (!article) return <Navigate to={backTo} replace />;

  const category = HELP_CATEGORIES.find((c) => c.id === article.cat);
  const more = HELP_ARTICLES.filter((a) => a.cat === article.cat && a.slug !== article.slug).slice(0, 4);

  return (
    <main className="mobile-subpage info-page help-page">
      <HelpHeader title={headerTitle} onBack={() => navigate(-1)} />

      <article className="info-body">
        <header className="info-hero">
          <p className="info-kicker">
            <Link to="/help-center">Help Center</Link>
            {category && (
              <>
                {" / "}
                <Link to={`/help-center/topic/${category.id}`}>{category.title}</Link>
              </>
            )}
          </p>
          <h2 className="info-title">{article.q}</h2>
        </header>

        <section className="info-section info-article">
          <Blocks blocks={article.a} />
        </section>

        {more.length > 0 && (
          <section className="info-section">
            <h2>More in {category?.title}</h2>
            <div className="help-list">
              {more.map((a) => (
                <ArticleRow key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        <aside className="info-contact">
          <Mail size={22} aria-hidden="true" />
          <p>
            <Inline text={`Did not answer your question? Write to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`} />
          </p>
        </aside>
      </article>
    </main>
  );
}
