import { useEffect, useState } from "react";
import { ChevronLeft, Camera, MessageCircle, Shirt, Tag, TrendingUp, Check, FlaskConical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  BOOST_PLANS,
  PAYMENT_METHODS,
  PAYMENT_MODE,
  loadBoosts,
  isBoostActive,
  payBoost
} from "../lib/boosts";

const TIPS = [
  { icon: Camera, title: "Brighter photos", text: "Natural light and a plain background get more taps." },
  { icon: Tag, title: "A fair price", text: "Check similar items and leave room for offers." },
  { icon: MessageCircle, title: "Quick replies", text: "Buyers often choose the fastest seller." },
  { icon: Shirt, title: "Bundle discounts", text: "Encourage buyers to take several items." }
];

const peso = (v) => `₱${Number(v || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" });

function isSold(status) {
  const s = String(status || "").toLowerCase();
  return s === "sold" || s === "completed";
}

export default function PromotionTools() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const simulated = PAYMENT_MODE === "simulation";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boosts, setBoosts] = useState([]);
  const [listingId, setListingId] = useState(null);
  const [planId, setPlanId] = useState("boost_3d");
  const [methodId, setMethodId] = useState("gcash");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setBoosts(loadBoosts(user.id));

    (async () => {
      try {
        const { data } = await supabase
          .from("listings")
          .select("id, title, price, photos, status")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });
        if (alive) setListings((data || []).filter((l) => !isSold(l.status)));
      } catch {
        if (alive) setListings([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const plan = BOOST_PLANS.find((p) => p.id === planId);
  const listing = listings.find((l) => l.id === listingId);
  const activeIds = new Set(boosts.filter((b) => isBoostActive(b)).map((b) => b.listing_id));

  async function handlePay() {
    if (!listing || !plan || paying) return;
    setPaying(true);
    setError("");
    setMessage("");
    try {
      await payBoost({ userId: user.id, listing, planId, methodId });
      setBoosts(loadBoosts(user.id));
      setMessage(`Boost active for "${listing.title}". No real money was charged.`);
      setListingId(null);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="mobile-subpage promotion-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Promote your listings</h1>
        <span />
      </header>

      <section className="promotion-card">
        <div>
          <strong>Boost your items</strong>
          <p>Promote an item and reach more buyers. Pick an item, a plan, and pay in a few taps.</p>
        </div>
        <div className="promotion-illustration">
          <TrendingUp size={34} />
          <Shirt size={33} />
        </div>
      </section>

      {simulated && (
        <div className="boost-test-banner" role="note">
          <FlaskConical size={18} />
          <span>Test mode: payments are simulated. No real money is charged.</span>
        </div>
      )}

      {!user && (
        <section className="boost-section">
          <p className="boost-empty">
            <Link to="/login">Log in</Link> to boost your listings.
          </p>
        </section>
      )}

      {user && (
        <>
          {message && <div className="boost-success"><Check size={18} /> {message}</div>}

          <section className="boost-section">
            <h2>1. Choose an item</h2>
            {loading && <p className="boost-empty">Loading your listings…</p>}
            {!loading && listings.length === 0 && (
              <p className="boost-empty">
                You have no active listings yet. <Link to="/sell">Sell an item</Link> to boost it.
              </p>
            )}
            {listings.map((l) => (
              <button
                key={l.id}
                type="button"
                className={listingId === l.id ? "boost-row selected" : "boost-row"}
                onClick={() => setListingId(l.id)}
              >
                {l.photos?.[0] ? <img src={l.photos[0]} alt="" /> : <span className="boost-thumb" />}
                <span className="boost-row-text">
                  <strong>{l.title}</strong>
                  <small>{peso(l.price)}{activeIds.has(l.id) ? " · Boosted" : ""}</small>
                </span>
                <span className="boost-pill">{listingId === l.id ? "Selected" : "Select"}</span>
              </button>
            ))}
          </section>

          {listings.length > 0 && (
            <section className="boost-section">
              <h2>2. Choose a plan</h2>
              {BOOST_PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={planId === p.id ? "boost-row selected" : "boost-row"}
                  onClick={() => setPlanId(p.id)}
                >
                  <span className="boost-row-text">
                    <strong>{p.days} {p.days === 1 ? "day" : "days"}</strong>
                    <small>{p.views}</small>
                  </span>
                  <b>{peso(p.price)}</b>
                  <span className="boost-pill">{planId === p.id ? "Selected" : "Select"}</span>
                </button>
              ))}
              <p className="boost-note">Estimated views are indicative only and are not guaranteed.</p>
            </section>
          )}

          {listings.length > 0 && (
            <section className="boost-section">
              <h2>3. Pay</h2>
              <div className="pers-chips boost-methods">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={methodId === m.id ? "pers-chip active" : "pers-chip"}
                    onClick={() => setMethodId(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {error && <p className="boost-error">{error}</p>}
              <button
                type="button"
                className="boost-pay"
                disabled={!listing || paying}
                onClick={handlePay}
              >
                {paying
                  ? "Processing…"
                  : listing
                    ? `Pay ${peso(plan.price)}${simulated ? " (test)" : ""}`
                    : "Select an item first"}
              </button>
            </section>
          )}

          {boosts.length > 0 && (
            <section className="boost-section">
              <h2>Your boosts</h2>
              {boosts.map((b) => (
                <div key={b.id} className="boost-history">
                  <span className="boost-row-text">
                    <strong>{b.listing_title}</strong>
                    <small>{dateLabel(b.starts_at)} – {dateLabel(b.ends_at)}{b.test ? " · test" : ""}</small>
                  </span>
                  <span className={isBoostActive(b) ? "boost-pill on" : "boost-pill"}>
                    {isBoostActive(b) ? "Active" : "Ended"}
                  </span>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      <section className="promotion-tips">
        <h2>Sell faster today, for free</h2>
        {TIPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="promotion-tip">
            <span><Icon size={21} /></span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
        <Link to="/tindahan-guide/sell-faster" className="promotion-link">
          Read: How can I sell faster?
        </Link>
      </section>
    </main>
  );
}
