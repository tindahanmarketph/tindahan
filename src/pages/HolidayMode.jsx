import { ChevronLeft, EyeOff, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function HolidayMode() {
  const navigate = useNavigate();
  const { user, profile, loadProfile } = useAuth();

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHolidayMode() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, holiday_mode")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.warn("Holiday mode loading skipped:", error.message);
        setErrorMessage(
          "Holiday Mode is not configured yet. Please add the holiday_mode column in Supabase."
        );
        setEnabled(false);
        setLoading(false);
        return;
      }

      const isEnabled = Boolean(data?.holiday_mode);

      setEnabled(isEnabled);
      setShowBubble(isEnabled);
      setLoading(false);
    }

    loadHolidayMode();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  async function toggleHolidayMode() {
    if (!user?.id || saving) return;

    const nextValue = !enabled;

    setSaving(true);
    setErrorMessage("");

    setEnabled(nextValue);

    if (nextValue) {
      setShowBubble(true);
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ holiday_mode: nextValue })
        .eq("id", user.id);

      if (error) throw error;

      if (typeof loadProfile === "function") {
        await loadProfile(user.id);
      }

      setEnabled(nextValue);
      setShowBubble(nextValue);
    } catch (error) {
      console.error("Holiday mode update error:", error);

      setEnabled(!nextValue);
      setShowBubble(!nextValue);

      setErrorMessage(
        error.message ||
          "Unable to update Holiday Mode. Please check your Supabase profiles table."
      );
    } finally {
      setSaving(false);
    }
  }

  const isHolidayActive = enabled || Boolean(profile?.holiday_mode);

  return (
    <main className="mobile-subpage holiday-mode-page">
      <header className="mobile-subpage-header holiday-mode-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Holiday mode</h1>

        <span />
      </header>

      <section className="holiday-mode-card">
        <div className="holiday-mode-icon">
          <EyeOff size={28} />
        </div>

        <div>
          <h2>Hide my items</h2>
          <p>
            Turn this on when you are away. Buyers will not see your active
            listings until you turn Holiday Mode off.
          </p>
        </div>

        <button
          type="button"
          className={isHolidayActive ? "tindahan-switch active" : "tindahan-switch"}
          onClick={toggleHolidayMode}
          disabled={loading || saving}
          aria-label="Toggle holiday mode"
          aria-pressed={isHolidayActive}
        >
          <span />
        </button>
      </section>

      {errorMessage && (
        <section className="holiday-mode-error">
          <strong>Unable to update Holiday Mode</strong>
          <p>{errorMessage}</p>
        </section>
      )}

      {showBubble && isHolidayActive && (
        <section className="holiday-mode-bubble">
          <button
            type="button"
            className="holiday-mode-bubble-close"
            onClick={() => setShowBubble(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="holiday-mode-bubble-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <strong>Your items are hidden</strong>
            <p>
              Your active listings are temporarily hidden from buyers. They will
              become visible again when you turn Holiday Mode off.
            </p>
          </div>
        </section>
      )}

      <section className="holiday-mode-info">
        <h3>What happens when Holiday Mode is active?</h3>

        <ul>
          <li>Your active listings disappear from the home feed.</li>
          <li>Your items are hidden from recommendations.</li>
          <li>You can reactivate your closet at any time.</li>
        </ul>
      </section>
    </main>
  );
}