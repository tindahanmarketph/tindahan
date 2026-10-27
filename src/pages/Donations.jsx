import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PERCENTS = [1, 2, 5, 10];
const CAUSES = [
  { id: "disaster", label: "Typhoon and disaster relief" },
  { id: "education", label: "Education and school supplies" },
  { id: "environment", label: "Environment and clean-ups" },
  { id: "animals", label: "Animal welfare" }
];

export default function Donations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const key = `tindahan_donation_preference_${user?.id || "guest"}`;
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(2);
  const [cause, setCause] = useState("disaster");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const v = JSON.parse(raw);
        if (v.percent) setPercent(v.percent);
        if (v.cause) setCause(v.cause);
        setSaved(true);
      }
    } catch {
      /* ignore */
    }
  }, [key]);

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify({ percent, cause }));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setOpen(false);
  }

  return (
    <main className="mobile-subpage tindahan-simple-page">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>
        <h1>Donations</h1>
        <span />
      </header>

      <section className="tindahan-donations-block">
        <h2>Regular donations</h2>
        <p>
          Donate part of your earnings when you sell on TindaHan. Support local initiatives and
          help build a safer, more responsible marketplace.
        </p>

        <div className="info-note info-note-info donation-note">
          <p>
            <strong>Coming soon.</strong> No donation is taken today. We will name the partner
            organisations before donations start, and you will always be able to change or stop them.
          </p>
        </div>

        {saved && !open && (
          <p className="donation-saved">
            Your preference: <strong>{percent}%</strong> of earnings to{" "}
            <strong>{CAUSES.find((c) => c.id === cause)?.label}</strong>.
          </p>
        )}

        {!open ? (
          <button className="tindahan-primary-wide" type="button" onClick={() => setOpen(true)}>
            {saved ? "Change my preference" : "Set up regular donations"}
          </button>
        ) : (
          <div className="donation-form">
            <fieldset>
              <legend>Share of your earnings</legend>
              <div className="donation-options">
                {PERCENTS.map((p) => (
                  <button key={p} type="button" className={percent === p ? "active" : ""} onClick={() => setPercent(p)}>
                    {p}%
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Cause</legend>
              <div className="donation-options column">
                {CAUSES.map((c) => (
                  <button key={c.id} type="button" className={cause === c.id ? "active" : ""} onClick={() => setCause(c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="tindahan-primary-wide" type="button" onClick={save}>Save preference</button>
          </div>
        )}
      </section>
    </main>
  );
}
