import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Camera, Check, FlaskConical, IdCard, Lock, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import {
  ID_TYPES,
  IDENTITY_MODE,
  MIN_AGE,
  getAge,
  isAdult,
  isIdentityVerified,
  submitIdentity
} from "../lib/identity";

const STEPS = ["Your age", "ID photos", "Check"];
const CHECKS = [
  "Photos received",
  "Document is readable",
  `Age confirmed (${MIN_AGE}+)`,
  "Identity check complete"
];

function PhotoPicker({ label, file, onPick }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file || file === "sample") {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <button type="button" className={file ? "idv-photo has-photo" : "idv-photo"} onClick={() => inputRef.current?.click()}>
      {preview ? (
        <img src={preview} alt="" />
      ) : file === "sample" ? (
        <span className="idv-photo-sample"><IdCard size={30} /> Sample photo</span>
      ) : (
        <span className="idv-photo-empty"><Camera size={26} /> {label}</span>
      )}
      <small>{file ? "Tap to retake" : "Tap to take or upload a photo"}</small>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />
    </button>
  );
}

export default function VerifyIdentity() {
  const { user, loadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const simulated = IDENTITY_MODE === "simulation";

  const knownBirth = user?.user_metadata?.birth_date || "";
  const [birthDate, setBirthDate] = useState(knownBirth);
  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState("philid");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(0);
  const [finished, setFinished] = useState(false);

  const idType = ID_TYPES.find((t) => t.id === typeId);
  const age = getAge(birthDate);
  const [blocked, setBlocked] = useState(false);
  const underage = blocked || (age !== null && age < MIN_AGE && Boolean(knownBirth));
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (step !== 2) return undefined;
    let cancelled = false;
    const timers = [];
    (async () => {
      try {
        await submitIdentity({ userId: user.id, birthDate, documentType: typeId });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Verification failed. Please try again.");
          setStep(1);
        }
        return;
      }
      CHECKS.forEach((_, i) => {
        timers.push(setTimeout(() => !cancelled && setDone(i + 1), 700 * (i + 1)));
      });
      timers.push(setTimeout(() => !cancelled && setFinished(true), 700 * CHECKS.length + 400));
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (loadingAuth) {
    return <main className="auth-page"><section className="auth-card"><p>Loading…</p></section></main>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isIdentityVerified(user.id) && step !== 2) return <Navigate to="/" replace />;

  function goNext() {
    setError("");
    if (step === 0) {
      if (!birthDate) return setError("Please enter your date of birth.");
      if (!isAdult(birthDate)) { setBlocked(true); return; }
      setStep(1);
      return;
    }
    if (step === 1) {
      const needBack = idType.both;
      if (!front || (needBack && !back)) {
        return setError(needBack ? "Add a photo of the front and the back of your ID." : "Add a photo of your passport photo page.");
      }
      if (!consent) return setError("Please accept the consent to continue.");
      setDone(0);
      setFinished(false);
      setStep(2);
    }
  }

  function finish() {
    const next = localStorage.getItem("tindahan_new_signup") === "true" ? "/welcome" : location.state?.from || "/";
    navigate(next, { replace: true });
  }

  if (underage) {
    return (
      <main className="auth-page auth-tindahan-page">
        <section className="auth-card auth-modern-card idv-card">
          <div className="auth-success-icon idv-blocked"><ShieldAlert size={34} /></div>
          <h1>TindaHan is for people aged {MIN_AGE} and over</h1>
          <p>
            We can't open this account because the date of birth you gave shows you are under {MIN_AGE}.
            You're welcome to come back when you turn {MIN_AGE}.
          </p>
          <button type="button" className="auth-primary-wide" onClick={async () => { await logout(); navigate("/"); }}>
            Log out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page auth-tindahan-page">
      <section className="auth-card auth-modern-card idv-card">
        <BrandLogo variant="vertical" className="auth-brand-logo" height={56} />

        <ol className="idv-steps" aria-label="Verification steps">
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? "current" : i < step ? "done" : ""}>
              <span>{i < step ? <Check size={14} /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        {simulated && (
          <div className="idv-test" role="note">
            <FlaskConical size={17} />
            <span>Test mode: your photos stay on your device and the check is approved automatically.</span>
          </div>
        )}

        {step === 0 && (
          <>
            <h1>Confirm your age</h1>
            <p>TindaHan is for people aged {MIN_AGE} and over. We check your age and identity once, to keep buyers and sellers safe.</p>
            <label className="idv-field">
              Date of birth
              <input
                type="date"
                value={birthDate}
                max={today}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={Boolean(knownBirth)}
              />
            </label>
            {knownBirth && <p className="idv-hint">This is the date you gave when you created your account.</p>}
            {error && <div className="auth-error">{error}</div>}
            <button type="button" className="auth-primary-wide" onClick={goNext}>Continue</button>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Add your ID</h1>
            <p>Take clear photos in good light. The whole ID must be visible, with no glare.</p>

            <label className="idv-field">
              Type of ID
              <select value={typeId} onChange={(e) => { setTypeId(e.target.value); setBack(null); }}>
                {ID_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>

            <div className="idv-photos">
              <PhotoPicker label={idType.both ? "Front of ID" : "Photo page"} file={front} onPick={setFront} />
              {idType.both && <PhotoPicker label="Back of ID" file={back} onPick={setBack} />}
            </div>

            {simulated && (
              <button type="button" className="idv-link" onClick={() => { setFront("sample"); setBack(idType.both ? "sample" : null); }}>
                Use sample photos (test)
              </button>
            )}

            <label className="idv-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I agree that TindaHan uses my ID only to check my age and identity, as described in the{" "}
                <Link to="/privacy" target="_blank">Protection Center</Link>.
              </span>
            </label>

            <div className="idv-lock"><Lock size={16} /> Your ID is never shown to other members.</div>

            {error && <div className="auth-error">{error}</div>}
            <button type="button" className="auth-primary-wide" onClick={goNext}>Submit for verification</button>
            <button type="button" className="idv-link" onClick={() => setStep(0)}>Back</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className={finished ? "auth-success-icon" : "auth-success-icon idv-working"}>
              {finished ? <ShieldCheck size={34} /> : <IdCard size={34} />}
            </div>
            <h1>{finished ? "You're verified" : "Checking your ID…"}</h1>
            <p>
              {finished
                ? "Thank you. You can now buy and sell on TindaHan."
                : "This usually takes a few minutes. You can keep this page open."}
            </p>

            <ul className="idv-checks">
              {CHECKS.map((c, i) => (
                <li key={c} className={i < done ? "ok" : ""}>
                  <span>{i < done ? <Check size={14} /> : null}</span>
                  {c}
                </li>
              ))}
            </ul>

            {simulated && !finished && (
              <p className="idv-hint">In the live app this check takes a few minutes and you'll be notified when it's done.</p>
            )}

            {finished && <button type="button" className="auth-primary-wide" onClick={finish}>Start exploring</button>}
          </>
        )}

        <p className="auth-link">
          <button type="button" className="idv-link" onClick={async () => { await logout(); navigate("/"); }}>
            Log out
          </button>
        </p>
      </section>
    </main>
  );
}
